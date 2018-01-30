require("../testUtils/init");
var loader = require("../testUtils/loader");

var mapApiProviderFactory = loader.load("map/mapApiProviderFactory"),
	MapApiProviderBase = loader.load("map/MapApiProviderBase"),
	GoogleMapsApiProvider = loader.load("map/google/GoogleMapsApiProvider");

var GOOGLE_MAP_TYPE = "googleMaps";

describe("A map API provider factory", function() {

	it("produces a MapApiProviderBase by default", function() {
		var apiProvider = mapApiProviderFactory.create();
		expect(apiProvider instanceof MapApiProviderBase).toBeTruthy();
	});

	it("produces a GoogleMapsApiProvider when Google map type is given", function() {
		var map = mapApiProviderFactory.create({
			type: GOOGLE_MAP_TYPE
		});
		expect(map instanceof GoogleMapsApiProvider).toBeTruthy();
	});

});
