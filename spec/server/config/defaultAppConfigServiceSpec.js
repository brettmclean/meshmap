require("../testUtils/init");
var loader = require("../testUtils/loader");

var AppConfig = loader.load("config/AppConfig");
var DefaultAppConfigService = loader.load("config/DefaultAppConfigService");

var MapExtent = loader.load("datamodel").MapExtent;

describe("A default app config service", function() {

	describe("generateDefaultConfig method", function() {

		it("returns an AppConfig", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig instanceof AppConfig).toBe(true);
		});

		it("returns AppConfig with reasonable default port number", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(typeof appConfig.portNumber).toBe("number");
			expect(appConfig.portNumber).toBeGreaterThan(1024);
			expect(appConfig.portNumber).toBeLessThan(65536);
		});

		it("returns AppConfig with reasonable site code length", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(typeof appConfig.siteCodeLength).toBe("number");
			expect(appConfig.siteCodeLength).toBeGreaterThan(3);
			expect(appConfig.siteCodeLength).toBeLessThan(100);
		});

		it("returns AppConfig with reasonable API path", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(typeof appConfig.apiPath).toBe("string");
			expect(appConfig.apiPath.length).toBeGreaterThan(1);
			expect(appConfig.apiPath.charAt(0)).toBe("/");
		});

		it("returns AppConfig with null API key", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig.apiKey).toBe(null);
		});

		it("returns AppConfig with in-memory data store", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig.store.type).toBe(appConfig.store.TYPE_MEMORY);
		});

		it("returns AppConfig with null store connection string", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig.store.connectionString).toBe(null);
		});

		it("returns AppConfig with reasonable max connections to data store", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();
			var maxConnections = appConfig.store.maxConnections;

			expect(typeof maxConnections).toBe("number");
			expect(maxConnections).toBeGreaterThan(4);
			expect(maxConnections).toBeLessThan(300);
		});

		it("returns AppConfig with log level set to info", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig.logging.level).toBe(appConfig.logging.LEVEL_INFO);
		});

		it("returns AppConfig with log directory set", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(typeof appConfig.logging.directory).toBe("string");
		});

		it("returns AppConfig set to log to console", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig.logging.logToConsole).toBe(true);
		});

		it("returns AppConfig where anyone can edit a marker in a new site", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();

			expect(appConfig.siteDefaults.onlyOwnerCanEdit).toBe(false);
		});

		it("returns AppConfig with an initial extent set for new sites", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();
			var initialExtent = appConfig.siteDefaults.initialExtent;

			expect(initialExtent instanceof MapExtent).toBe(true);
			expect(initialExtent.min.lat).toBeLessThan(initialExtent.max.lat);
			expect(initialExtent.min.lng).toBeLessThan(initialExtent.max.lng);
		});

		it("returns AppConfig with reasonable limit on hourly sites created per IP address", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();
			var newSitesPerIpPerHour = appConfig.limits.newSitesPerIpPerHour;

			expect(typeof newSitesPerIpPerHour).toBe("number");
			expect(newSitesPerIpPerHour).toBeGreaterThan(1);
			expect(newSitesPerIpPerHour).toBeLessThan(100);
		});

		it("returns AppConfig with reasonable limit on event loop lag", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();
			var allowedEventLoopLagMs = appConfig.limits.allowedEventLoopLagMs;

			expect(typeof allowedEventLoopLagMs).toBe("number");
			expect(allowedEventLoopLagMs).toBeGreaterThan(5);
			expect(allowedEventLoopLagMs).toBeLessThan(500);
		});

		it("returns AppConfig with reasonable limit on in-memory caching", function() {
			var dacs = createDefaultAppConfigService();

			var appConfig = dacs.generateDefaultConfig();
			var avoidCachingAboveHeapSizeMib = appConfig.limits.avoidCachingAboveHeapSizeMib;

			expect(typeof avoidCachingAboveHeapSizeMib).toBe("number");
			expect(avoidCachingAboveHeapSizeMib).toBeGreaterThan(16);
		});
	});

});

function createDefaultAppConfigService() {
	return new DefaultAppConfigService();
}
