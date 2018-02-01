require("../testUtils/init");
var loader = require("../testUtils/loader");

var LogProviderBase = loader.load("logging/LogProviderBase");

describe("A log provider base", function() {

	describe("error method", function() {

		it("exists", function() {
			verifyMethodExists("error");
		});

	});

	describe("warn method", function() {

		it("exists", function() {
			verifyMethodExists("warn");
		});

	});

	describe("info method", function() {

		it("exists", function() {
			verifyMethodExists("info");
		});

	});

	describe("debug method", function() {

		it("exists", function() {
			verifyMethodExists("debug");
		});

	});

	describe("trace method", function() {

		it("exists", function() {
			verifyMethodExists("trace");
		});

	});

});

var verifyMethodExists = function(methodName) {
	var lpb = new LogProviderBase();
	expect(typeof lpb[methodName]).toBe("function");
};
