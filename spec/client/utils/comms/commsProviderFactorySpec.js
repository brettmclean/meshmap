require("../../testUtils/init");
var loader = require("../../testUtils/loader");

var commsProviderFactory = loader.load("utils/comms/commsProviderFactory"),
	CommsProviderBase = loader.load("utils/comms/CommsProviderBase");

var DUMMY_CONFIG = {
	host: "localhost",
	port: 1234
};

describe("A Comms Provider Factory", function() {

	it("throws a ReferenceError when not provided a config object", function() {
		expect(function() {
			commsProviderFactory.create();
		}).toThrowError(TypeError);
	});

	it("can create a comms provider", function() {
		var cp = commsProviderFactory.create(DUMMY_CONFIG);
		expect(cp).toEqual(jasmine.any(CommsProviderBase));
	});

});
