var sw = require("../stopwatch");
var appConfigServiceFactory = require("../config/appConfigServiceFactory");
var loggingServiceFactory = require("../logging/factories/loggingServiceFactory");

var loggingService = loggingServiceFactory.create();

function Cache() {
	"use strict";

	this._dataCache = {};

	var appConfig = appConfigServiceFactory.create().getAppConfig();

	this.size = 0;

	// How frequently should we perform checks and consider reducing cached items (in ms)?
	this.checkInterval = 10000;

	// What is the minimum we should hold an object in the cache for (in ms)?
	this.minCacheTime = 30000;

	// What is the maximum we should hold an object in the cache for (in ms)?
	this.maxCacheTime = 1800000;

	// What is the maximum amount of data allowed on the heap before we reduce cached items (in mebibytes)?
	this.maxHeapSizeMb = appConfig.limits.avoidCachingAboveHeapSizeMib;

	// Can we remove the given item from the cache when it has expired?
	this.canRemoveItem = function() {
		return true;
	};

	setInterval(this.checkCacheSize, this.checkInterval, this);
}

function CacheEntry(data, expiryTime) {
	"use strict";
	this.data = data || null; /* Object */
	this.expiryTime = expiryTime || null; /* Number */
}

Cache.prototype = {

	get: function(key) {
		"use strict";
		var result = null;

		if(this._dataCache[key]) {
			var entry = this._dataCache[key];
			result = entry.data;

			var newExpiry = Date.now() + this.getCacheTime();
			if(newExpiry > entry.expiryTime) {
				entry.expiryTime = newExpiry;
			}
		}

		return result;
	},

	put: function(key, data) {
		"use strict";
		var cacheTime = this.getCacheTime();

		// Only cache if it won't expire instantly.
		if(cacheTime > 0) {

			this._dataCache[key] = new CacheEntry(data, Date.now() + this.getCacheTime());
			this.size++;
		}
	},

	getValues: function() {
		"use strict";
		var values = [];

		for(var key in this._dataCache) {
			if(this._dataCache.hasOwnProperty(key)) {
				values.push(this._dataCache[key].data);
			}
		}

		return values;
	},

	checkCacheSize: function(cache) {
		"use strict";
		cache.clearOldItems();
	},

	getCacheTime: function() {
		// Calculate cache time for new/accessed objects based on current environment conditions.
		"use strict";

		var result = this.maxCacheTime;

		var percUsed = (process.memoryUsage().heapUsed / 1048576) / this.maxHeapSizeMb;

		// If our heap size is more than 50% of configured maximum.
		if(percUsed > 0.5) {
			result *= 1 - percUsed; // Reduce cache time for this object.
		}

		if(result < this.minCacheTime) {
			result = this.minCacheTime;
		}

		return result;
	},

	clearOldItems: function() {
		"use strict";

		var stopwatch = new sw.Stopwatch("Clear old items in cache");

		var clearedItems = 0;
		var now = Date.now();

		for(var prop in this._dataCache) {
			if(this._dataCache.hasOwnProperty(prop)) {
				var entry = this._dataCache[prop];
				if(entry.expiryTime < now) {

					var canRemove = true;
					try {
						canRemove = this.canRemoveItem(entry.data);
					} catch(err) {
						loggingService.error("An error occurred while running cache's canRemoveItem: " + err);
					}

					if(canRemove) {
						delete entry.data;
						delete this._dataCache[prop];
						clearedItems++;
					}
				}
			}
		}

		this.size -= clearedItems;
		var removedItems = clearedItems > 0;

		if(removedItems) {
			loggingService.debug("Removed " + clearedItems + " old items from cache.");
		}

		if(global.gc) { // If node is run with --expose_gc
			global.gc(); // Run garbage collector
		}

		if(removedItems) {
			stopwatch.stop();
		}
	}

};

exports.Cache = Cache;
