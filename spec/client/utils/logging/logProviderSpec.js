require("../../testUtils/init");
var loader = require("../../testUtils/loader");

var LogProviderBase = loader.load("utils/logging/LogProviderBase");

var verifyLoggingMethodExists = function(methodName) {
	var lp = new LogProviderBase();

	expect(typeof lp[methodName]).toBe("function");

	expect(function() {
		lp[methodName]("Logged data");
	}).not.toThrow();
};

describe("A Log Provider", function() {

	it("has an error method", verifyLoggingMethodExists.bind(this, "error"));

	it("has a warn method", verifyLoggingMethodExists.bind(this, "warn"));

	it("has an info method", verifyLoggingMethodExists.bind(this, "info"));

	it("has a debug method", verifyLoggingMethodExists.bind(this, "debug"));

	it("has a trace method", verifyLoggingMethodExists.bind(this, "trace"));

});
