require("../testUtils/init");
var loader = require("../testUtils/loader");

var mapFactory = loader.load("map/mapFactory"),
	MapApiProviderBase = loader.load("map/MapApiProviderBase"),
	MapBase = loader.load("map/MapBase"),
	GoogleMap = loader.load("map/google/GoogleMap");

var GOOGLE_MAP_TYPE = "googleMaps";

describe("A map factory", function() {

	it("produces a MapBase by default", function() {
		var map = createMapViaFactory(getMapConfig(null), createMapApiProvider());
		expect(map instanceof MapBase).toBeTruthy();
	});

	it("produces a GoogleMap when Google map type is given", function() {
		var map = createMapViaFactory(getMapConfig(GOOGLE_MAP_TYPE), createMapApiProvider());
		expect(map instanceof GoogleMap).toBeTruthy();
	});

});

var createMapViaFactory = function(mapConfig, apiProvider) {
	var factoryDependencies = getMapFactoryDependencies(mapConfig, apiProvider);
	return mapFactory.create(factoryDependencies);
};

var getMapFactoryDependencies = function(mapConfig, apiProvider) {
	return {
		mapConfig: mapConfig,
		apiProvider: apiProvider
	};
};

var getMapConfig = function(mapType) {
	return {
		type: mapType
	};
};

var createMapApiProvider = function() {
	return MapApiProviderBase();
};
