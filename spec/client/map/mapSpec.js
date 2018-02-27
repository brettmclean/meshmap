require("../testUtils/init");
var loader = require("../testUtils/loader");

var MapBase = loader.load("map/MapBase"),
	MarkerInfoContext = loader.load("map/MarkerInfoContext"),
	MapApiProviderBase = loader.load("map/MapApiProviderBase"),
	ViewInjectionService = loader.load("angular/ViewInjectionService"),
	MarkerSelectionContext = loader.load("map/MarkerSelectionContext"),
	symbols = loader.load("map/symbols"),
	dm = loader.load("model/datamodel"),
	Location = dm.Location,
	Marker = dm.Marker,
	PointMarker = dm.PointMarker,
	PolylineMarker = dm.PolylineMarker,
	PolygonMarker = dm.PolygonMarker,
	MapExtent = dm.MapExtent;

var LAYOUT_LARGE = "large";

var POINT_SYMBOL = new symbols.PointSymbol(3);
var POLYLINE_SYMBOL = new symbols.PolylineSymbol(3, 5);
var POLYGON_SYMBOL = new symbols.PolygonSymbol(3, 8, 5);

var LOCATION1 = new Location(1, 1);
var LOCATION2 = new Location(2, 2);
var TWO_LOCATIONS = [LOCATION1, LOCATION2];

var MARKER1 = new PointMarker(6, LOCATION1);
var MARKER2 = new PointMarker(8, LOCATION2);

var POINT_MARKER = MARKER1;
var POINT_MARKER2 = MARKER2;
var POLYLINE_MARKER = new PolylineMarker(10, [LOCATION1, LOCATION2]);
var POLYGON_MARKER = new PolygonMarker(10, [LOCATION1, LOCATION2]);

var MARKER_INFO_CONTEXT = new MarkerInfoContext(MARKER1);

var EXTENT1 = new MapExtent(LOCATION1, LOCATION2);

var MARKER_ICONS = {
	"1": "http://maps.google.com/mapfiles/marker.png",
	"2": "http://maps.google.com/mapfiles/marker_black.png",
	"3": "http://maps.google.com/mapfiles/marker_grey.png"
};

var MARKER_COLORS = {
	"1": "#FF0000",
	"2": "#00FF00",
	"3": "#0000FF"
};

var MARKER_TYPES = MapBase.MARKER_TYPES;

var createMapBase = function(deps) {
	var opts = {};
	deps = deps || {};

	deps.apiProvider = deps.apiProvider || createMapApiProviderBase();
	deps.markerSelectionContext = deps.markerSelectionContext || new MarkerSelectionContext();

	if(!deps.viewInjectionService) {
		deps.viewInjectionService = new ViewInjectionService();
		spyOn(deps.viewInjectionService, "injectAndCreate");
	}

	return new MapBase(deps, opts);
};

var createMapBaseWithApiProvider = function(apiProvider) {
	var deps = {
		apiProvider: apiProvider
	};
	return createMapBase(deps);
};

var satisfyApiProviderDependencies = function(map) {
	map.setMarkerIcons(MARKER_ICONS);
	map.setMarkerColors(MARKER_COLORS);
	map.notifyApiAvailable();
};

var simulateApiProviderMapReady = function(apiProvider) {
	apiProvider._onMapReady();
};

var simulateApiProviderMapMove = function(apiProvider) {
	apiProvider._onMapMoved(EXTENT1);
};

var simulateApiProviderMarkerClick = function(apiProvider, marker, clickedLocation) {
	apiProvider._onMarkerClicked(marker, clickedLocation);
};

var simulateApiProviderPointMarkerCreated = function(apiProvider, location) {
	apiProvider._onPointMarkerCreated(location);
};

var simulateApiProviderPolylineMarkerCreated = function(apiProvider, locations) {
	apiProvider._onPolylineMarkerCreated(locations);
};

var simulateApiProviderPolygonMarkerCreated = function(apiProvider, locations) {
	apiProvider._onPolygonMarkerCreated(locations);
};

var simulateMarkerSelectionContextToolChanged = function(markerSelectionContext, activeTool) {
	markerSelectionContext._onToolChanged(activeTool);
};

var simulateMarkerSelectionPointSymbolChanged = function(markerSelectionContext, pointSymbol) {
	markerSelectionContext.trigger("pointSymbolChanged", pointSymbol);
};

var simulateMarkerSelectionPolylineSymbolChanged = function(markerSelectionContext, polylineSymbol) {
	markerSelectionContext.trigger("polylineSymbolChanged", polylineSymbol);
};

var simulateMarkerSelectionPolygonSymbolChanged = function(markerSelectionContext, polygonSymbol) {
	markerSelectionContext.trigger("polygonSymbolChanged", polygonSymbol);
};

var verifyMethodExists = function(methodName) {
	var mb = createMapBase();
	expect(typeof mb[methodName]).toBe("function");
};

var verifyImmediatelyInformsApiProvider = function(mapMethod, apiMethod, apiArgs) {
	var api = createMapApiProviderBase(),
		mb = createMapBaseWithApiProvider(api);

	spyOn(api, apiMethod);
	mb[mapMethod].apply(mb, apiArgs);

	expect(api[apiMethod]).toHaveBeenCalled();
	var apiCallArgs = api[apiMethod].calls.mostRecent().args;
	expect(apiCallArgs).toEqual(apiArgs);
};

var verifyInformsApiProviderWhenReady = function(mapMethod, apiMethod, apiArgs) {
	var api = createMapApiProviderBase(),
		mb = createMapBaseWithApiProvider(api);

	spyOn(api, apiMethod);
	mb[mapMethod].apply(mb, apiArgs);
	expect(api[apiMethod]).not.toHaveBeenCalled();

	satisfyApiProviderDependencies(mb);
	expect(api[apiMethod]).toHaveBeenCalled();

	var apiCallArgs = api[apiMethod].calls.mostRecent().args;
	expect(apiCallArgs).toEqual(apiArgs);
};

var verifyImmediatelyInformsMarkerSelectionContext = function(mapMethod, contextMethod, contextArgs) {
	var msc = new MarkerSelectionContext(),
		mb = createMapBase({
			markerSelectionContext: msc
		});

	spyOn(msc, contextMethod);
	mb[mapMethod].apply(mb, contextArgs);

	expect(msc[contextMethod]).toHaveBeenCalled();
	var contextCallArgs = msc[contextMethod].calls.mostRecent().args;
	expect(contextCallArgs).toEqual(contextArgs);
};

describe("A map", function() {

	it("has marker types", function() {
		expect(MapBase.MARKER_TYPES).toBeDefined();
		expect(MapBase.MARKER_TYPES.POINT).toEqual(jasmine.any(String));
		expect(MapBase.MARKER_TYPES.POLYLINE).toEqual(jasmine.any(String));
		expect(MapBase.MARKER_TYPES.POLYGON).toEqual(jasmine.any(String));
	});

	it("has a getScriptUrls method",
		verifyMethodExists.bind(this, "getScriptUrls"));

	it("returns an array from getScriptUrls", function() {
		var mb = createMapBase();

		var result = mb.getScriptUrls();

		expect(Array.isArray(result)).toBeTruthy();
	});

	it("has a setLayout method",
		verifyMethodExists.bind(this, "setLayout"));

	it("informs its marker selection context when layout has changed", function() {
		var msc = new MarkerSelectionContext(),
			mb = createMapBase({
				markerSelectionContext: msc
			});
		spyOn(msc, "setLayout");

		mb.setLayout(LAYOUT_LARGE);

		expect(msc.setLayout).toHaveBeenCalledWith(LAYOUT_LARGE);
	});

	it("returns a String from its getMapTypeDescription method", function() {
		var mb = createMapBase();

		var result = mb.getMapTypeDescription();

		expect(typeof result === "string").toBeTruthy();
	});

	it("has a notifyApiAvailable method",
		verifyMethodExists.bind(this, "notifyApiAvailable"));

	it("asks API provider to init map when provider dependencies met", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "initMap");
		satisfyApiProviderDependencies(mb);

		expect(api.initMap).toHaveBeenCalled();
	});

	it("only asks API provider to init map once", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "initMap");
		satisfyApiProviderDependencies(mb);
		mb.notifyApiAvailable();
		mb.setMarkerIcons(MARKER_ICONS);

		expect(api.initMap.calls.count()).toBe(1);
	});

	it("has a setMarkerIcons method",
		verifyMethodExists.bind(this, "setMarkerIcons"));

	it("immediately passes marker icons to API provider",
		verifyImmediatelyInformsApiProvider.bind(this, "setMarkerIcons", "setMarkerIcons", [MARKER_ICONS]));

	it("immediately passes marker icons to marker selection context",
		verifyImmediatelyInformsMarkerSelectionContext.bind(this, "setMarkerIcons", "setMarkerIcons", [MARKER_ICONS]));

	it("has a setMarkerColors method",
		verifyMethodExists.bind(this, "setMarkerColors"));

	it("immediately passes marker colors to API provider",
		verifyImmediatelyInformsApiProvider.bind(this, "setMarkerColors", "setMarkerColors", [MARKER_COLORS]));

	it("immediately passes marker colors to marker selection context",
		verifyImmediatelyInformsMarkerSelectionContext.bind(this, "setMarkerColors", "setMarkerColors", [MARKER_COLORS]));

	it("has a clearMarkers method",
		verifyMethodExists.bind(this, "clearMarkers"));

	it("informs map API provider of cleared markers when provider is ready", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "clearMarkers");
		mb.clearMarkers();
		satisfyApiProviderDependencies(mb);

		expect(api.clearMarkers).toHaveBeenCalled();
	});

	it("has a setExtent method",
		verifyMethodExists.bind(this, "setExtent"));

	it("informs map API provider of map extent when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "setExtent", "setExtent", [EXTENT1]));

	it("has an addMarker method",
		verifyMethodExists.bind(this, "addMarker"));

	it("informs map API provider of added markers when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "addMarker", "addPointMarker", [POINT_MARKER]));

	it("has an removeMarker method",
		verifyMethodExists.bind(this, "removeMarker"));

	it("informs map API provider of removed marker when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "removeMarker", "removeMarker", [MARKER2]));

	it("has a setActiveMarkerType method",
		verifyMethodExists.bind(this, "setActiveMarkerType"));

	it("informs map API provider of new active marker type when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "setActiveMarkerType", "setActiveMarkerType", [MARKER_TYPES.POLYGON]));

	it("has a setMapHeight method",
		verifyMethodExists.bind(this, "setMapHeight"));

	it("informs map API provider of new map height when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "setMapHeight", "setMapHeight", [500]));

	it("has a setPointSymbol method",
		verifyMethodExists.bind(this, "setPointSymbol"));

	it("informs map API provider of updated point symbol when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "setPointSymbol", "setPointSymbol", [POINT_SYMBOL]));

	it("has a setPolylineSymbol method",
		verifyMethodExists.bind(this, "setPolylineSymbol"));

	it("informs map API provider of updated polyline symbol when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "setPolylineSymbol", "setPolylineSymbol", [POLYLINE_SYMBOL]));

	it("has a setPolygonSymbol method",
		verifyMethodExists.bind(this, "setPolygonSymbol"));

	it("informs map API provider of updated polygon symbol when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "setPolygonSymbol", "setPolygonSymbol", [POLYGON_SYMBOL]));

	it("has a showMarkerInfo method",
		verifyMethodExists.bind(this, "showMarkerInfo"));

	it("informs map API provider to show marker info when provider is ready",
		verifyInformsApiProviderWhenReady.bind(this, "showMarkerInfo", "showMarkerInfo", [MARKER_INFO_CONTEXT, LOCATION1]));

	it("informs map API provider of change regardless of dependency resolution order", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "addPointMarker");

		mb.addMarker(POINT_MARKER);
		expect(api.addPointMarker).not.toHaveBeenCalled();

		mb.setMarkerColors(MARKER_COLORS);
		mb.notifyApiAvailable();
		mb.setMarkerIcons(MARKER_ICONS);

		expect(api.addPointMarker).toHaveBeenCalledWith(POINT_MARKER);
	});

	it("immediately informs map API provider of change if provider was already ready", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "addPointMarker");
		satisfyApiProviderDependencies(mb);
		mb.addMarker(POINT_MARKER);

		expect(api.addPointMarker).toHaveBeenCalledWith(POINT_MARKER);
	});

	it("can queue multiple changes of same type and execute them when provider is ready", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "addPointMarker");
		mb.addMarker(POINT_MARKER);
		mb.addMarker(POINT_MARKER2);
		expect(api.addPointMarker).not.toHaveBeenCalled();

		satisfyApiProviderDependencies(mb);

		expect(api.addPointMarker).toHaveBeenCalledWith(POINT_MARKER);
		expect(api.addPointMarker).toHaveBeenCalledWith(POINT_MARKER2);
	});

	it("can queue multiple changes of different types and execute them when provider is ready", function() {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		spyOn(api, "addPointMarker");
		mb.addMarker(POINT_MARKER);
		expect(api.addPointMarker).not.toHaveBeenCalled();

		spyOn(api, "setExtent");
		mb.setExtent(EXTENT1);
		expect(api.setExtent).not.toHaveBeenCalled();

		satisfyApiProviderDependencies(mb);

		expect(api.addPointMarker).toHaveBeenCalledWith(POINT_MARKER);
		expect(api.setExtent).toHaveBeenCalledWith(EXTENT1);
	});

	it("asks map API provider for marker selection container when map is ready", function() {
		// jshint unused: false
		var api = createMapApiProviderBase(),
			deps = {
				apiProvider: api
			},
			mb = createMapBase(deps);

		spyOn(api, "getMarkerSelectionContainer");
		mb.init();
		simulateApiProviderMapReady(api);

		expect(api.getMarkerSelectionContainer).toHaveBeenCalled();
	});

	it("calls view injection service with API-provided marker selector element when map is ready", function() {
		// jshint unused: false
		var api = createMapApiProviderBase(),
			vis = new ViewInjectionService(),
			domElement = {},
			deps = {
				viewInjectionService: vis,
				apiProvider: api
			},
			mb = createMapBase(deps);

		spyOn(api, "getMarkerSelectionContainer").and.returnValue(domElement);
		spyOn(vis, "injectAndCreate");
		mb.init();
		simulateApiProviderMapReady(api);

		expect(vis.injectAndCreate).toHaveBeenCalledWith(domElement,
			jasmine.any(String),
			jasmine.any(String),
			jasmine.any(Object));
	});

	it("calls view injection service with a MarkerSelectionContext when map is ready", function() {
		// jshint unused: false
		var api = createMapApiProviderBase(),
			vis = new ViewInjectionService(),
			deps = {
				viewInjectionService: vis,
				apiProvider: api
			},
			mb = createMapBase(deps);

		spyOn(api, "getMarkerSelectionContainer").and.returnValue({});
		spyOn(vis, "injectAndCreate");
		mb.init();
		simulateApiProviderMapReady(api);

		expect(vis.injectAndCreate).toHaveBeenCalledWith(jasmine.any(Object),
			jasmine.any(String),
			jasmine.any(String),
			jasmine.any(MarkerSelectionContext));
	});

	it("implements the observable pattern",
		verifyMethodExists.bind(this, "bind"));

	it("repeats mapMoved events received from API provider", function(done) {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		mb.bind("mapMoved", function(newMapExtent) {
			expect(newMapExtent instanceof MapExtent).toBeTruthy();
			done();
		});
		mb.init();

		simulateApiProviderMapMove(api);
	});

	it("repeats markerClicked events received from API provider", function(done) {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		mb.bind("markerClicked", function(marker, clickedLocation) {
			expect(marker instanceof Marker).toBeTruthy();
			expect(clickedLocation instanceof Location).toBeTruthy();
			done();
		});
		mb.init();

		simulateApiProviderMarkerClick(api, MARKER1, LOCATION1);
	});

	it("repeats pointMarkerCreated events received from API provider", function(done) {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		mb.bind("pointMarkerCreated", function(location, pointSymbol) {
			expect(location).toBe(LOCATION1);
			expect(pointSymbol).toBe(POINT_SYMBOL);
			done();
		});

		mb.init();
		api.setPointSymbol(POINT_SYMBOL);

		simulateApiProviderPointMarkerCreated(api, LOCATION1);
	});

	it("repeats polylineMarkerCreated events received from API provider", function(done) {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		mb.bind("polylineMarkerCreated", function(locations, polylineSymbol) {
			expect(locations).toBe(TWO_LOCATIONS);
			expect(polylineSymbol).toBe(POLYLINE_SYMBOL);
			done();
		});

		mb.init();
		api.setPolylineSymbol(POLYLINE_SYMBOL);

		simulateApiProviderPolylineMarkerCreated(api, TWO_LOCATIONS);
	});

	it("repeats polygonMarkerCreated events received from API provider", function(done) {
		var api = createMapApiProviderBase(),
			mb = createMapBaseWithApiProvider(api);

		mb.bind("polygonMarkerCreated", function(locations, polygonSymbol) {
			expect(locations).toBe(TWO_LOCATIONS);
			expect(polygonSymbol).toBe(POLYGON_SYMBOL);
			done();
		});

		mb.init();
		api.setPolygonSymbol(POLYGON_SYMBOL);

		simulateApiProviderPolygonMarkerCreated(api, TWO_LOCATIONS);
	});

	describe("addMarker method", function() {
		it("calls addPointMarker on API provider when given a PointMarker", function() {
			var api = createMapApiProviderBase(),
				mb = createMapBaseWithApiProvider(api);
			spyOn(api, "addPointMarker");

			mb.addMarker(POINT_MARKER);
			satisfyApiProviderDependencies(mb);

			expect(api.addPointMarker).toHaveBeenCalledWith(POINT_MARKER);
		});

		it("calls addPolylineMarker on API provider when given a PolylineMarker", function() {
			var api = createMapApiProviderBase(),
				mb = createMapBaseWithApiProvider(api);
			spyOn(api, "addPolylineMarker");

			mb.addMarker(POLYLINE_MARKER);
			satisfyApiProviderDependencies(mb);

			expect(api.addPolylineMarker).toHaveBeenCalledWith(POLYLINE_MARKER);
		});

		it("calls addPolygonMarker on API provider when given a PolygonMarker", function() {
			var api = createMapApiProviderBase(),
				mb = createMapBaseWithApiProvider(api);
			spyOn(api, "addPolygonMarker");

			mb.addMarker(POLYGON_MARKER);
			satisfyApiProviderDependencies(mb);

			expect(api.addPolygonMarker).toHaveBeenCalledWith(POLYGON_MARKER);
		});

		it("does not call addPointMarker on API provider when given a PolylineMarker", function() {
			var api = createMapApiProviderBase(),
				mb = createMapBaseWithApiProvider(api);
			spyOn(api, "addPointMarker");

			mb.addMarker(POLYLINE_MARKER);
			satisfyApiProviderDependencies(mb);

			expect(api.addPointMarker).not.toHaveBeenCalled();
		});

		it("does not call addPolylineMarker on API provider when given a PolygonMarker", function() {
			var api = createMapApiProviderBase(),
				mb = createMapBaseWithApiProvider(api);
			spyOn(api, "addPolylineMarker");

			mb.addMarker(POLYGON_MARKER);
			satisfyApiProviderDependencies(mb);

			expect(api.addPolylineMarker).not.toHaveBeenCalled();
		});

		it("does not throw an error when given invalid marker", function() {
			var api = createMapApiProviderBase(),
				mb = createMapBaseWithApiProvider(api);

			satisfyApiProviderDependencies(mb);

			expect(function() {
				mb.addMarker({});
			}).not.toThrow();
		});

		it("tells API provider to change drawing mode when marker selector has tool changed", function() {
			// jshint unused: false
			var api = createMapApiProviderBase(),
				msc = new MarkerSelectionContext(),
				mb = createMapBase({
					markerSelectionContext: msc,
					apiProvider: api
				});
			spyOn(api, "setDrawingMode");

			mb.init();
			simulateMarkerSelectionContextToolChanged(msc, msc.TOOL_POINT);

			expect(api.setDrawingMode).toHaveBeenCalledWith(api.DRAWING_POINT);
		});

		it("tells API provider to disable drawing mode when marker selector changes to pan tool", function() {
			// jshint unused: false
			var api = createMapApiProviderBase(),
				msc = new MarkerSelectionContext(),
				mb = createMapBase({
					markerSelectionContext: msc,
					apiProvider: api
				});
			spyOn(api, "setDrawingMode");

			mb.init();
			simulateMarkerSelectionContextToolChanged(msc, msc.TOOL_PAN);

			expect(api.setDrawingMode).toHaveBeenCalledWith(null);
		});

		it("tells API provider to set point symbol when marker selector changes point symbol", function() {
			var api = createMapApiProviderBase(),
				msc = new MarkerSelectionContext(),
				mb = createMapBase({
					markerSelectionContext: msc,
					apiProvider: api
				});
			spyOn(api, "setPointSymbol");

			mb.init();
			simulateMarkerSelectionPointSymbolChanged(msc, POINT_SYMBOL);

			expect(api.setPointSymbol).toHaveBeenCalledWith(POINT_SYMBOL);
		});

		it("tells API provider to set polyline symbol when marker selector changes polyline symbol", function() {
			var api = createMapApiProviderBase(),
				msc = new MarkerSelectionContext(),
				mb = createMapBase({
					markerSelectionContext: msc,
					apiProvider: api
				});
			spyOn(api, "setPolylineSymbol");

			mb.init();
			simulateMarkerSelectionPolylineSymbolChanged(msc, POLYLINE_SYMBOL);

			expect(api.setPolylineSymbol).toHaveBeenCalledWith(POLYLINE_SYMBOL);
		});

		it("tells API provider to set polygon symbol when marker selector changes polygon symbol", function() {
			var api = createMapApiProviderBase(),
				msc = new MarkerSelectionContext(),
				mb = createMapBase({
					markerSelectionContext: msc,
					apiProvider: api
				});
			spyOn(api, "setPolygonSymbol");

			mb.init();
			simulateMarkerSelectionPolygonSymbolChanged(msc, POLYGON_SYMBOL);

			expect(api.setPolygonSymbol).toHaveBeenCalledWith(POLYGON_SYMBOL);
		});
	});

});

function createMapApiProviderBase() {
	var api = new MapApiProviderBase({});

	return api;
}
