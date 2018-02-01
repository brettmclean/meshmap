require("../testUtils/init");
var loader = require("../testUtils/loader");

var ConsoleLogProvider = loader.load("logging/ConsoleLogProvider");
var LogProviderBase = loader.load("logging/LogProviderBase");

describe("A console log provider", function() {

	it("is a log provider", function() {
		var clp = new ConsoleLogProvider();

		expect(clp instanceof LogProviderBase).toBe(true);
	});

});
