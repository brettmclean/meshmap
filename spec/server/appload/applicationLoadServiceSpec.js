require("../testUtils/init");
var loader = require("../testUtils/loader");

var ApplicationLoadService = loader.load("appload/ApplicationLoadService");
var EventLoopLagProvider = loader.load("appload/EventLoopLagProvider");
var AppLimitsConfig = loader.load("config/AppConfig").AppLimitsConfig;

describe("An application load service", function() {

	describe("init method", function() {

		it("exists", function() {
			var als = createApplicationLoadService();

			expect(typeof als.init).toBe("function");
		});

	});

	describe("setConfig method", function() {

		it("exists", function() {
			var als = createApplicationLoadService();

			expect(typeof als.setConfig).toBe("function");
		});

		it("calls setMaxAllowedLag on event loop lag provider with configured value", function() {
			var maxEventLoopLagMs = 50,
				appLimitsConfig = createAppLimitsConfigWithAllowedEventLoopLag(maxEventLoopLagMs),
				ellp = createEventLoopLagProvider(),
				als = createApplicationLoadService({ eventLoopLagProvider: ellp });

			als.setConfig(appLimitsConfig);

			expect(ellp.setMaxAllowedLag).toHaveBeenCalledWith(maxEventLoopLagMs);
		});

	});

	describe("appIsOverloaded method", function() {

		it("exists", function() {
			var als = createApplicationLoadService();

			expect(typeof als.appIsOverloaded).toBe("function");
		});

		it("calls lagIsTooHigh on event loop lag provider", function() {
			var ellp = createEventLoopLagProvider(),
				als = createApplicationLoadService({ eventLoopLagProvider: ellp });

			als.appIsOverloaded();

			expect(ellp.lagIsTooHigh).toHaveBeenCalled();
		});

		it("returns true when lagIsTooHigh returns true on event loop lag provider", function() {
			var ellp = createEventLoopLagProviderWhichReturnsLagTooHighValue(true),
				als = createApplicationLoadService({ eventLoopLagProvider: ellp });

			var appIsOverloaded = als.appIsOverloaded();

			expect(appIsOverloaded).toBe(true);
		});

		it("returns false when lagIsTooHigh returns false on event loop lag provider", function() {
			var ellp = createEventLoopLagProviderWhichReturnsLagTooHighValue(false),
				als = createApplicationLoadService({ eventLoopLagProvider: ellp });

			var appIsOverloaded = als.appIsOverloaded();

			expect(appIsOverloaded).toBe(false);
		});

	});

	describe("shutdown method", function() {

		it("exists", function() {
			var als = createApplicationLoadService();

			expect(typeof als.shutdown).toBe("function");
		});

		it("calls shutdown on event loop lag provider", function() {
			var ellp = createEventLoopLagProvider(),
				als = createApplicationLoadService({ eventLoopLagProvider: ellp });

			als.shutdown();

			expect(ellp.shutdown).toHaveBeenCalled();
		});

	});

});

function createApplicationLoadService(deps) {
	deps = deps || {};

	deps.eventLoopLagProvider = deps.eventLoopLagProvider || createEventLoopLagProvider();

	return new ApplicationLoadService(deps);
}

function createEventLoopLagProvider() {
	return createEventLoopLagProviderWhichReturnsLagTooHighValue(false);
}

function createEventLoopLagProviderWhichReturnsLagTooHighValue(lagIsTooHigh) {
	var ellp = new EventLoopLagProvider();
	spyOn(ellp, "lagIsTooHigh").and.returnValue(lagIsTooHigh);
	spyOn(ellp, "shutdown");
	spyOn(ellp, "setMaxAllowedLag");
	return ellp;
}

function createAppLimitsConfigWithAllowedEventLoopLag(maxLagMs) {
	var alc = new AppLimitsConfig();
	alc.allowedEventLoopLagMs = maxLagMs;
	return alc;
}
