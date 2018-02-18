require("../testUtils/init");
var loader = require("../testUtils/loader");

var ApplicationLoadService = loader.load("appload/ApplicationLoadService");
var EventLoopLagProvider = loader.load("appload/EventLoopLagProvider");

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
	return ellp;
}
