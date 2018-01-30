require("../../testUtils/init");
var loader = require("../../testUtils/loader");

var loggerFactory = loader.load("utils/logging/loggerFactory"),
	Logger = loader.load("utils/logging/Logger");

describe("A Logger Factory", function() {

	it("can create a Logger", function() {
		var l = loggerFactory.create();
		expect(l).toEqual(jasmine.any(Logger));
	});
});
