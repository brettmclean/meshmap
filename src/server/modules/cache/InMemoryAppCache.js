var LRU = require("lru-cache");

var InMemoryAppCache = function() {
	var cacheImplOptions = {
		max: 500,
		maxAge: 1000 * 60 * 60
	};
	this._cacheImpl = LRU(cacheImplOptions);
};

InMemoryAppCache.prototype.get = function(cacheKey) {
	return this._cacheImpl.get(cacheKey);
};

InMemoryAppCache.prototype.set = function(cacheKey, value) {
	this._cacheImpl.set(cacheKey, value);
};

InMemoryAppCache.prototype.remove = function(cacheKey) {
	this._cacheImpl.del(cacheKey);
};

InMemoryAppCache.prototype.clearAll = function() {
	this._cacheImpl.reset();
};

module.exports = InMemoryAppCache;
