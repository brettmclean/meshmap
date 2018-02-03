require("../testUtils/init");
var loader = require("../testUtils/loader");

var DummyLogProvider = loader.load("logging/DummyLogProvider");
var LogProviderBase = loader.load("logging/LogProviderBase");

describe("A dummy log provider", function() {

	it("is a log provider", function() {
		var dlp = new DummyLogProvider();

		expect(dlp instanceof LogProviderBase).toBe(true);
	});

});
