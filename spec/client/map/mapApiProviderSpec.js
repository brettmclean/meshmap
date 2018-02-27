require("../testUtils/init");
var loader = require("../testUtils/loader");

var MapApiProviderBase = loader.load("map/MapApiProviderBase"),
	dm = loader.load("model/datamodel"),
	symbols = loader.load("map/symbols"),
	MapExtent = dm.MapExtent,
	PointMarker = dm.PointMarker,
	Location = dm.Location;

var LOCATION1 = new Location(1, 1);
var LOCATION2 = new Location(2, 2);

var MARKER1 = new PointMarker(6, LOCATION1);

var POINT_SYMBOL = new symbols.PointSymbol(3);
var POLYLINE_SYMBOL = new symbols.PolylineSymbol(3, 5);

var createMapApiProvider = function() {
	return new MapApiProviderBase({});
};

var simulateMapReady = function(apiProvider) {
	apiProvider._onMapReady();
};

var simulateMapClick = function(apiProvider) {
	apiProvider._onMapClicked();
};

var simulateMapMove = function(apiProvider) {
	apiProvider._onMapMoved(new MapExtent());
};

var simulateMarkerClick = function(apiProvider, marker, clickedLocation) {
	apiProvider._onMarkerClicked(marker, clickedLocation);
};

var simulatePointMarkerCreated = function(apiProvider, location) {
	apiProvider._onPointMarkerCreated(location);
};

var simulatePolylineMarkerCreated = function(apiProvider, locations) {
	apiProvider._onPolylineMarkerCreated(locations);
};

var verifyMethodExists = function(methodName) {
	var map = createMapApiProvider();
	expect(typeof map[methodName]).toBe("function");
};

describe("A Map API provider", function() {

	it("has an initMap method",
		verifyMethodExists.bind(this, "initMap"));

	it("has a getMarkerSelectionContainer method",
		verifyMethodExists.bind(this, "getMarkerSelectionContainer"));

	it("has a setMarkerIcons method",
		verifyMethodExists.bind(this, "setMarkerIcons"));

	it("has a setMarkerColors method",
		verifyMethodExists.bind(this, "setMarkerColors"));

	it("has a clearMarkers method",
		verifyMethodExists.bind(this, "clearMarkers"));

	it("has an addPointMarker method",
		verifyMethodExists.bind(this, "addPointMarker"));

	it("has an addPolylineMarker method",
		verifyMethodExists.bind(this, "addPolylineMarker"));

	it("has an addPolygonMarker method",
		verifyMethodExists.bind(this, "addPolygonMarker"));

	it("has a removeMarker method",
		verifyMethodExists.bind(this, "removeMarker"));

	it("has a setExtent method",
		verifyMethodExists.bind(this, "setExtent"));

	it("has a setActiveMarkerType method",
		verifyMethodExists.bind(this, "setActiveMarkerType"));

	it("has a setMapHeight method",
		verifyMethodExists.bind(this, "setMapHeight"));

	it("has a setPointSymbol method",
		verifyMethodExists.bind(this, "setPointSymbol"));

	it("has a setPolylineSymbol method",
		verifyMethodExists.bind(this, "setPolylineSymbol"));

	it("has a setPolygonSymbol method",
		verifyMethodExists.bind(this, "setPolygonSymbol"));

	it("has a setDrawingMode method",
		verifyMethodExists.bind(this, "setDrawingMode"));

	it("implements the observable pattern",
		verifyMethodExists.bind(this, "bind"));

	it("emits mapReady event when map is ready", function(done) {
		var apiProvider = createMapApiProvider();

		apiProvider.bind("mapReady", done);
		simulateMapReady(apiProvider);
	});

	it("emits mapClicked event when map is clicked", function(done) {
		var apiProvider = createMapApiProvider();

		apiProvider.bind("mapClicked", done);
		simulateMapClick(apiProvider);
	});

	it("emits mapMoved event when map is moved", function(done) {
		var apiProvider = createMapApiProvider();

		apiProvider.bind("mapMoved", function(newMapExtent) {
			expect(newMapExtent instanceof MapExtent).toBeTruthy();
			done();
		});
		simulateMapMove(apiProvider);
	});

	it("emits markerClicked event when marker is clicked", function(done) {
		var apiProvider = createMapApiProvider();

		apiProvider.bind("markerClicked", function(marker, clickedLocation) {
			expect(marker).toBe(MARKER1);
			expect(clickedLocation).toBe(LOCATION1);
			done();
		});
		simulateMarkerClick(apiProvider, MARKER1, LOCATION1);
	});

	it("emits pointMarkerCreated event when point marker is created on map", function(done) {
		var apiProvider = createMapApiProvider();

		apiProvider.bind("pointMarkerCreated", done);
		simulatePointMarkerCreated(apiProvider, LOCATION1);
	});

	it("emits pointMarkerCreated event with location when point marker is created on map", function(done) {
		var apiProvider = createMapApiProvider();
		apiProvider.bind("pointMarkerCreated", function(location) {
			expect(location).toBe(LOCATION1);
			done();
		});

		simulatePointMarkerCreated(apiProvider, LOCATION1);
	});

	it("emits pointMarkerCreated event with current point symbol when point marker is created on map", function(done) {
		var apiProvider = createMapApiProvider();
		apiProvider.bind("pointMarkerCreated", function(location, pointSymbol) {
			// jshint unused:vars
			expect(pointSymbol).toBe(POINT_SYMBOL);
			done();
		});

		apiProvider.setPointSymbol(POINT_SYMBOL);
		simulatePointMarkerCreated(apiProvider, LOCATION1);
	});

	it("emits polylineMarkerCreated event with current polyline symbol when polyline market is created on map", function(done) {
		var apiProvider = createMapApiProvider();
		apiProvider.bind("polylineMarkerCreated", function(location, polylineSymbol) {
			// jshint unused:vars
			expect(polylineSymbol).toBe(POLYLINE_SYMBOL);
			done();
		});

		apiProvider.setPolylineSymbol(POLYLINE_SYMBOL);
		simulatePolylineMarkerCreated(apiProvider, [LOCATION1, LOCATION2]);
	});

});
