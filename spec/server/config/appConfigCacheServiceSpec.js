require("../testUtils/init");
var loader = require("../testUtils/loader");

var AppConfigCacheService = loader.load("config/AppConfigCacheService");
var AppConfig = loader.load("config/AppConfig");
var InMemoryAppCache = loader.load("cache/InMemoryAppCache");

var CACHE_KEY = "AppConfig";

describe("An app config cache service", function() {

	describe("getAppConfig method", function() {

		it("calls cache get method with expected cache key", function() {
			var imac = createInMemoryAppCacheWhichAlwaysReturnsUndefined(),
				accs = new AppConfigCacheService({ appCache: imac });

			accs.getAppConfig();

			expect(imac.get).toHaveBeenCalledWith(CACHE_KEY);
		});

		it("returns an AppConfig when found in cache", function() {
			var appConfig = new AppConfig(),
				imac = createInMemoryAppCacheWhichAlwaysReturnsValue(appConfig),
				accs = new AppConfigCacheService({ appCache: imac });

			var returnedObj = accs.getAppConfig();

			expect(returnedObj).toBe(appConfig);
		});

	});

	describe("setAppConfig method", function() {

		it("calls cache set method with expected cache key and app config", function() {
			var appConfig = new AppConfig(),
				imac = createInMemoryAppCacheWhichAlwaysReturnsUndefined(),
				accs = new AppConfigCacheService({ appCache: imac });

			accs.setAppConfig(appConfig);

			expect(imac.set).toHaveBeenCalledWith(CACHE_KEY, appConfig);
		});

	});

	describe("removeAppConfig method", function() {

		it("calls cache remove method with expected cache key", function() {
			var imac = createInMemoryAppCacheWhichAlwaysReturnsUndefined(),
				accs = new AppConfigCacheService({ appCache: imac });

			accs.removeAppConfig();

			expect(imac.remove).toHaveBeenCalledWith(CACHE_KEY);
		});

	});

});

function createInMemoryAppCacheWhichAlwaysReturnsUndefined() {
	return createInMemoryAppCacheWhichAlwaysReturnsValue(undefined);
}

function createInMemoryAppCacheWhichAlwaysReturnsValue(value) {
	var imac = new InMemoryAppCache();
	spyOn(imac, "get").and.returnValue(value);
	spyOn(imac, "set");
	spyOn(imac, "remove");
	return imac;
}
