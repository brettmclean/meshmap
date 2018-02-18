require("../testUtils/init");
var loader = require("../testUtils/loader");

var EventLoopLagProvider = loader.load("load/EventLoopLagProvider");

describe("An event loop lag provider", function() {

	describe("lagIsTooHigh method", function() {

		it("exists", function() {
			var ellp = new EventLoopLagProvider();

			expect(typeof ellp.lagIsTooHigh).toBe("function");
		});

	});

	describe("setMaxAllowedLag method", function() {

		it("exists", function() {
			var ellp = new EventLoopLagProvider();

			expect(typeof ellp.setMaxAllowedLag).toBe("function");
		});

	});

	describe("shutdown method", function() {

		it("exists", function() {
			var ellp = new EventLoopLagProvider();

			expect(typeof ellp.shutdown).toBe("function");
		});

	});

});
