require("../testUtils/init");
var loader = require("../testUtils/loader");

var MapBase = loader.load("map/MapBase"),
	GoogleMap = loader.load("map/google/GoogleMap");

var createGoogleMap = function() {
	return new GoogleMap();
};

var createGoogleMapWithApiKey = function(key) {
	return new GoogleMap({
		key: key
	});
};

var API_KEY = "api-key-123";

describe("A Google map", function() {

	it("is a map", function() {
		var gm = createGoogleMap();
		expect(gm instanceof MapBase).toBeTruthy();
	});

	it("contains API key in script URL", function() {
		var gm = createGoogleMapWithApiKey(API_KEY);

		var scriptUrls = gm.getScriptUrls();
		expect(scriptUrls.length).toBe(1);
		expect(scriptUrls[0]).toContain(API_KEY);
	});

});
