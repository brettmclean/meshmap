require("../testUtils/init");
var loader = require("../testUtils/loader");

var MapApiProviderBase = loader.load("map/MapApiProviderBase"),
	GoogleMapsApiProvider = loader.load("map/google/GoogleMapsApiProvider");

var createGoogleMapsApiProvider = function() {
	var deps = {
		viewInjectionService: null
	};
	return new GoogleMapsApiProvider(deps);
};

describe("A Google Maps API provider", function() {

	it("is a map API provider", function() {
		var gmap = createGoogleMapsApiProvider();

		expect(gmap instanceof MapApiProviderBase).toBeTruthy();
	});

});
