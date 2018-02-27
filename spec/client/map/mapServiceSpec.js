require("../testUtils/init");
var loader = require("../testUtils/loader");

var MarkerInfoContext = loader.load("map/MarkerInfoContext"),
	MapService = loader.load("map/MapService"),
	MapBase = loader.load("map/MapBase"),
	EventBus = loader.load("events/EventBus"),
	CommsService = loader.load("utils/comms/CommsService"),
	ExtentUpdater = loader.load("map/ExtentUpdater"),
	SiteService = loader.load("state/SiteService"),
	MarkerPermissionsService = loader.load("security/MarkerPermissionsService"),
	MarkerDialogService = loader.load("ui/MarkerDialogService"),
	symbols = loader.load("map/symbols"),
	dm = loader.load("model/datamodel"),
	Location = dm.Location,
	MapExtent = dm.MapExtent,
	MapEvent = dm.MapEvent,
	PointMarker = dm.PointMarker,
	UserSettings = dm.UserSettings;

var MARKER_TYPES = MapBase.MARKER_TYPES;

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

var LOCATION1 = new Location(1, 1);
var LOCATION2 = new Location(2, 2);
var TWO_LOCATIONS = [LOCATION1, LOCATION2];

var EXTENT1 = new MapExtent(LOCATION1, LOCATION2);

var MARKER1 = new PointMarker(6, LOCATION1);

var POINT_SYMBOL = new symbols.PointSymbol(3);
var POLYLINE_SYMBOL = new symbols.PolylineSymbol(3, 5);
var POLYGON_SYMBOL = new symbols.PolygonSymbol(3, 8, 5);

var LAYOUT_LARGE = "large";
var LAYOUT_SMALL = "small";

describe("A map service", function() {

	it("throws a TypeError if provided map is not a MapBase", function() {
		expect(function() {
			createMapServiceWithMap({});
		}).toThrowError(TypeError);
	});

	it("does not throw an Error if provided map is a MapBase", function() {
		var map = createMap();

		expect(function() {
			createMapServiceWithMap(map);
		}).not.toThrow();
	});

	it("passes marker icons to map when available",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "markerIconsSet", MARKER_ICONS, "setMarkerIcons"));

	it("passes marker colors to map when available",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "markerColorsSet", MARKER_COLORS, "setMarkerColors"));

	it("informs the map when markers are cleared",
		verifyPassthroughToMapOnEvent.bind(this, "markersCleared", "clearMarkers"));

	it("informs the map when map extent has changed",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "extentChanged", EXTENT1, "setExtent"));

	it("informs the map when marker is added",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "markerAdded", MARKER1, "addMarker"));

	it("informs the map when marker is removed",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "markerRemoved", MARKER1, "removeMarker"));

	it("informs the map when active marker type is changed",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "toolChanged", MARKER_TYPES.POLYLINE, "setActiveMarkerType"));

	it("informs the map when point symbol is changed",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "pointSymbolSet", POINT_SYMBOL, "setPointSymbol"));

	it("informs the map when polyline symbol is changed",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "polylineSymbolSet", POLYLINE_SYMBOL, "setPolylineSymbol"));

	it("informs the map when polyline symbol is changed",
		verifyPassthroughOfArgumentToMapOnEvent.bind(this, "polygonSymbolSet", POLYGON_SYMBOL, "setPolygonSymbol"));

	it("informs the map when API scripts are finished downloading", function(done) {
		var map = createMap(),
			scriptInjectionService = new MockScriptInjectionService(),
			mapService = createMapService({
				map: map,
				scriptInjectionService: scriptInjectionService
			});

		spyOn(scriptInjectionService, "injectIntoBody").and.callThrough();
		spyOn(map, "init");
		spyOn(map, "notifyApiAvailable").and.callFake(done);
		mapService.init();

		expect(scriptInjectionService.injectIntoBody).toHaveBeenCalled();
	});

	it("informs extent updater when map is moved", function() {
		// jshint unused: false
		var eu = new ExtentUpdater(),
			map = createMap(),
			mapService = createMapService({
				map: map,
				extentUpdater: eu
			});

		spyOn(eu, "setExtent");

		simulateMapMoveEventOnMap(map, EXTENT1);

		expect(eu.setExtent).toHaveBeenCalledWith(EXTENT1);
	});

	it("informs map when map height has changed", function() {
		// jshint unused: false
		var map = createMap(),
			eb = new EventBus(),
			mapService = createMapServiceWithMapAndEventBus(map, eb);

		spyOn(map, "setMapHeight");
		eb.publish("mapHeightChanged", 650);

		expect(map.setMapHeight).toHaveBeenCalledWith(650);
	});

	it("informs map when layout has changed", function() {
		// jshint unused: false
		var map = createMap(),
			eb = new EventBus(),
			mapService = createMapServiceWithMapAndEventBus(map, eb);

		eb.publish("layoutChanged", LAYOUT_LARGE);

		expect(map.setLayout).toHaveBeenCalledWith(LAYOUT_LARGE);
	});

	it("tells map to show marker info at clicked location if marker clicked while in large layout", function() {
		testInteractionWithMapWhenMarkerClicked(LAYOUT_LARGE, MARKER1, LOCATION1, function(map) {
			expect(map.showMarkerInfo).toHaveBeenCalledWith(jasmine.any(MarkerInfoContext), LOCATION1);
		});
	});

	it("tells map to show marker info for provided marker if marker clicked while in large layout", function() {
		testInteractionWithMapWhenMarkerClicked(LAYOUT_LARGE, MARKER1, LOCATION1, function(map) {
			var mostRecentCall = map.showMarkerInfo.calls.mostRecent();
			var markerInfoContext = mostRecentCall.args[0];

			expect(markerInfoContext.marker).toBe(MARKER1);
		});
	});

	it("tells map to show marker info with large layout if marker clicked while in large layout", function() {
		testInteractionWithMapWhenMarkerClicked(LAYOUT_LARGE, MARKER1, LOCATION1, function(map) {
			var markerInfoContext = getArgForMostRecentCall(map.showMarkerInfo, 0);

			expect(markerInfoContext.layoutIsLarge).toBe(true);
		});
	});

	it("does not tell map to show marker info if marker clicked while in small layout", function() {
		testInteractionWithMapWhenMarkerClicked(LAYOUT_SMALL, MARKER1, LOCATION1, function(map) {
			expect(map.showMarkerInfo).not.toHaveBeenCalled();
		});
	});

	it("tells marker dialog service to show marker info if marker clicked while in small layout", function() {
		testInteractionWithMarkerDialogServiceWhenMarkerClicked(LAYOUT_SMALL, MARKER1, LOCATION1, function(markerDialogService) {
			expect(markerDialogService.showMarkerInfoDialog).toHaveBeenCalledWith(jasmine.any(MarkerInfoContext));
		});
	});

	it("does not tell marker dialog service to show marker info if marker clicked while in large layout", function() {
		testInteractionWithMarkerDialogServiceWhenMarkerClicked(LAYOUT_LARGE, MARKER1, LOCATION1, function(markerDialogService) {
			expect(markerDialogService.showMarkerInfoDialog).not.toHaveBeenCalled();
		});
	});

	it("asks MarkerPermissionsService if user can edit marker when marker is clicked", function() {
		// jshint unused: false
		var mps = new MarkerPermissionsService(),
			map = createMap(),
			eb = new EventBus(),
			mapService = createMapServiceWithMapAndEventBusAndMarkerPermissionsService(map, eb, mps);

		spyOn(mps, "getUserCanEditMarker").and.returnValue(true);
		eb.publish("layoutChanged", LAYOUT_LARGE);
		map.trigger("markerClicked", MARKER1, LOCATION1);

		expect(mps.getUserCanEditMarker).toHaveBeenCalledWith(MARKER1);
	});

	it("provides map with userCanEditMarker=false when MarkerPermissionsService denies edit permission", function() {
		testMapIsProvidedWithCorrectUserCanEditMarkerValue(false);
	});

	it("provides map with userCanEditMarker=true when MarkerPermissionsService denies edit permission", function() {
		testMapIsProvidedWithCorrectUserCanEditMarkerValue(true);
	});

	it("gets user settings from SiteService when deleteMarkerRequested event is received from MarkerInfoContext", function() {
		var testOpts = {
			marker: MARKER1
		};
		testLogicWhenDeleteMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.siteService.getUserSettings).toHaveBeenCalled();
		});
	});

	it("calls showConfirmDeletionDialog on MarkerDialogService when deleteMarkerRequested event and confirmMarkerDeletion = true", function() {
		var testOpts = {
			marker: MARKER1,
			confirmMarkerDeletion: true
		};
		testLogicWhenDeleteMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.markerDialogService.showConfirmDeletionDialog).toHaveBeenCalledWith(MARKER1, jasmine.any(Function));
		});
	});

	it("calls showEditMarkerDialog on MarkerDialogService when editMarkerRequested event is received", function() {
		var testOpts = {
			marker: MARKER1
		};
		testLogicWhenEditMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.markerDialogService.showEditMarkerDialog).toHaveBeenCalled();
		});
	});

	it("calls showEditMarkerDialog on MarkerDialogService providing appropriate marker when editMarkerRequested event", function() {
		var testOpts = {
			marker: MARKER1
		};
		testLogicWhenEditMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.markerDialogService.showEditMarkerDialog).toHaveBeenCalledWith(testOpts.marker, jasmine.any(Function));
		});
	});

	it("calls dismissMarkerInfoDialog on MarkerDialogService when editMarkerRequested event", function() {
		var testOpts = {
			marker: MARKER1
		};
		testLogicWhenEditMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.markerDialogService.dismissMarkerInfoDialog).toHaveBeenCalled();
		});
	});

	it("does not call removeMarker on SiteService when deleteMarkerRequested event and confirmMarkerDeletion = true", function() {
		var testOpts = {
			marker: MARKER1,
			confirmMarkerDeletion: true
		};
		testLogicWhenDeleteMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.siteService.removeMarker).not.toHaveBeenCalled();
		});
	});

	it("calls removeMarker on SiteService when deleteMarkerRequested event and confirmMarkerDeletion = false", function() {
		var testOpts = {
			marker: MARKER1,
			confirmMarkerDeletion: false
		};
		testLogicWhenDeleteMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.siteService.removeMarker).toHaveBeenCalledWith(MARKER1.id);
		});
	});

	it("calls dismissMarkerInfoDialog on MarkerDialogService when deleteMarkerRequested event", function() {
		var testOpts = {
			marker: MARKER1,
			confirmMarkerDeletion: false
		};
		testLogicWhenDeleteMarkerRequested(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.markerDialogService.dismissMarkerInfoDialog).toHaveBeenCalled();
		});
	});

	it("calls updateMarker on SiteService when user finishes editing marker", function() {
		var marker = new PointMarker(12, LOCATION1);
		var testOpts = {
			marker: marker
		};

		testInteractionWithSiteServiceWhenMarkerEdited(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.siteService.updateMarker).toHaveBeenCalled();
		});
	});

	it("calls updateMarker on SiteService and provides marker when user finishes editing marker", function() {
		var marker = new PointMarker(12, LOCATION1);
		var testOpts = {
			marker: marker
		};

		testInteractionWithSiteServiceWhenMarkerEdited(testOpts, function(mapServiceDeps) {
			expect(mapServiceDeps.siteService.updateMarker).toHaveBeenCalledWith(marker);
		});
	});

	it("sends a mapEvent to server when point marker is created", function() {
		var testOpts = {
			location: LOCATION1,
			pointSymbol: POINT_SYMBOL
		};
		testInteractionWithCommsServiceWhenPointMarkerCreated(testOpts, function(mapServiceDeps) {
			var commsService = mapServiceDeps.commsService;
			expect(commsService.sendMessage).toHaveBeenCalledWith("mapEvent", jasmine.any(MapEvent));
		});
	});

	it("sends an addMarker map event when point marker is created", function() {
		var testOpts = {
			location: LOCATION1,
			pointSymbol: POINT_SYMBOL
		};
		testInteractionWithCommsServiceWhenPointMarkerCreated(testOpts, function(mapServiceDeps) {
			var commsService = mapServiceDeps.commsService;
			var mapEventArg = getArgForMostRecentCall(commsService.sendMessage, 1);
			var eventType = mapEventArg.type;
			expect(eventType).toBe("addMarker");
		});
	});

	it("sends a mapEvent to server when polyline marker is created", function() {
		var testOpts = {
			locations: TWO_LOCATIONS,
			polylineSymbol: POLYLINE_SYMBOL
		};
		testInteractionWithCommsServiceWhenPolylineMarkerCreated(testOpts, function(mapServiceDeps) {
			var commsService = mapServiceDeps.commsService;
			expect(commsService.sendMessage).toHaveBeenCalledWith("mapEvent", jasmine.any(MapEvent));
		});
	});

	it("sends an addMarker map event when polyline marker is created", function() {
		var testOpts = {
			locations: TWO_LOCATIONS,
			polylineSymbol: POLYLINE_SYMBOL
		};
		testInteractionWithCommsServiceWhenPolylineMarkerCreated(testOpts, function(mapServiceDeps) {
			var commsService = mapServiceDeps.commsService;
			var mapEventArg = getArgForMostRecentCall(commsService.sendMessage, 1);
			var eventType = mapEventArg.type;
			expect(eventType).toBe("addMarker");
		});
	});

	it("sends a mapEvent to server when polygon marker is created", function() {
		var testOpts = {
			locations: TWO_LOCATIONS,
			polygonSymbol: POLYGON_SYMBOL
		};
		testInteractionWithCommsServiceWhenPolygonMarkerCreated(testOpts, function(mapServiceDeps) {
			var commsService = mapServiceDeps.commsService;
			expect(commsService.sendMessage).toHaveBeenCalledWith("mapEvent", jasmine.any(MapEvent));
		});
	});

	it("sends an addMarker map event when polygon marker is created", function() {
		var testOpts = {
			locations: TWO_LOCATIONS,
			polygonSymbol: POLYGON_SYMBOL
		};
		testInteractionWithCommsServiceWhenPolygonMarkerCreated(testOpts, function(mapServiceDeps) {
			var commsService = mapServiceDeps.commsService;
			var mapEventArg = getArgForMostRecentCall(commsService.sendMessage, 1);
			var eventType = mapEventArg.type;
			expect(eventType).toBe("addMarker");
		});
	});

});

function createMapService(deps) {
	if(!deps.map) {
		deps.map = createMap();
	}
	if(!deps.eventBus) {
		deps.eventBus = new EventBus();
	}
	if(!deps.commsService) {
		deps.commsService = createCommsService();
	}
	if(!deps.markerPermissionsService) {
		deps.markerPermissionsService = new MarkerPermissionsService();
		spyOn(deps.markerPermissionsService, "getUserCanEditMarker").and.returnValue(true);
	}
	if(!deps.markerDialogService) {
		deps.markerDialogService = new MarkerDialogService();
	}
	if(!deps.scriptInjectionService) {
		deps.scriptInjectionService = new MockScriptInjectionService();
	}
	if(!deps.extentUpdater) {
		deps.extentUpdater = new ExtentUpdater();
	}
	if(!deps.siteService) {
		deps.siteService = new SiteService();
	}

	return new MapService(deps);
}

function createMapServiceWithMap(map) {
	return createMapService({
		map: map
	});
}

function createMapServiceWithMapAndEventBus(map, eventBus) {
	return createMapService({
		map: map,
		eventBus: eventBus
	});
}

function createMapServiceWithMapAndEventBusAndMarkerPermissionsService(map, eventBus, mps) {
	return createMapService({
		map: map,
		eventBus: eventBus,
		markerPermissionsService: mps
	});
}

function createMapServiceWithMapAndEventBusAndMarkerPermissionsServiceAndMarkerDialogService(map, eventBus, mps, mds) {
	return createMapService({
		map: map,
		eventBus: eventBus,
		markerPermissionsService: mps,
		markerDialogService: mds
	});
}

function createMap() {
	var map = new MapBase({}, {});
	spyOn(map, "setLayout");

	return map;
}

function createCommsService() {
	return new CommsService({});
}

function setupMapAndEventBusInMapService(callback) {
	// jshint unused: false
	var map = createMap(),
		eb = new EventBus(),
		mapService = createMapServiceWithMapAndEventBus(map, eb);

	callback(map, eb);
}

function createUserSettings(confirmMarkerDeletion) {
	return new UserSettings({
		confirmMarkerDeletion: confirmMarkerDeletion
	});
}

function simulateMapMoveEventOnMap(map, newExtent) {
	map.trigger("mapMoved", newExtent);
}

function simulatePointMarkerCreatedEventOnMap(map, location, pointSymbol) {
	map.trigger("pointMarkerCreated", location, pointSymbol);
}

function simulatePolylineMarkerCreatedEventOnMap(map, locations, polylineSymbol) {
	map.trigger("polylineMarkerCreated", locations, polylineSymbol);
}

function simulatePolygonMarkerCreatedEventOnMap(map, locations, polygonSymbol) {
	map.trigger("polygonMarkerCreated", locations, polygonSymbol);
}

function verifyPassthroughToMapOnEvent(eventName, mapMethod) {
	setupMapAndEventBusInMapService(function(map, eb) {
		spyOn(map, mapMethod);
		eb.publish(eventName);

		expect(map[mapMethod]).toHaveBeenCalled();
	});
}

function verifyPassthroughOfArgumentToMapOnEvent(eventName, eventArg, mapMethod) {
	setupMapAndEventBusInMapService(function(map, eb) {
		spyOn(map, mapMethod);
		eb.publish(eventName, eventArg);

		expect(map[mapMethod]).toHaveBeenCalledWith(eventArg);
	});
}

function testInteractionWithMapWhenMarkerClicked(layout, marker, clickedLocation, callback) {
	// jshint unused: false
	var map = createMap(),
		eb = new EventBus(),
		mps = new MarkerPermissionsService(),
		mds = new MarkerDialogService(),
		mapService = createMapServiceWithMapAndEventBusAndMarkerPermissionsServiceAndMarkerDialogService(map, eb, mps, mds);

	spyOn(mps, "getUserCanEditMarker").and.returnValue(true);
	spyOn(map, "showMarkerInfo");
	spyOn(mds, "showMarkerInfoDialog");
	eb.publish("layoutChanged", layout);
	map.trigger("markerClicked", marker, clickedLocation);

	callback(map);
}

function testInteractionWithMarkerDialogServiceWhenMarkerClicked(layout, marker, clickedLocation, callback) {
	// jshint unused: false
	var map = createMap(),
		eb = new EventBus(),
		mps = new MarkerPermissionsService(),
		mds = new MarkerDialogService(),
		mapService = createMapServiceWithMapAndEventBusAndMarkerPermissionsServiceAndMarkerDialogService(map, eb, mps, mds);

	spyOn(mps, "getUserCanEditMarker").and.returnValue(true);
	spyOn(map, "showMarkerInfo");
	spyOn(mds, "showMarkerInfoDialog");
	eb.publish("layoutChanged", layout);
	map.trigger("markerClicked", marker, clickedLocation);

	callback(mds);
}

function testMapIsProvidedWithCorrectUserCanEditMarkerValue(userCanEditMarkerValue) {
	// jshint unused: false
	var mps = new MarkerPermissionsService(),
		map = createMap(),
		eb = new EventBus(),
		mapService = createMapServiceWithMapAndEventBusAndMarkerPermissionsService(map, eb, mps);

	spyOn(map, "showMarkerInfo");
	spyOn(mps, "getUserCanEditMarker").and.returnValue(userCanEditMarkerValue);
	eb.publish("layoutChanged", LAYOUT_LARGE);

	map.trigger("markerClicked", MARKER1, LOCATION1);

	var markerInfoContext = getArgForMostRecentCall(map.showMarkerInfo, 0);
	expect(markerInfoContext.userCanEditMarker).toBe(userCanEditMarkerValue);
}

function testLogicWhenDeleteMarkerRequested(testOpts, callback) {
	var markerInfoContext = new MarkerInfoContext(testOpts.marker),
		siteService = new SiteService(),
		markerDialogService = new MarkerDialogService(),
		mapServiceDeps = {
			markerDialogService: markerDialogService,
			siteService: siteService
		},
		mapService = createMapService(mapServiceDeps);
	spyOn(siteService, "removeMarker");
	spyOn(siteService, "getUserSettings").and.returnValue(createUserSettings(testOpts.confirmMarkerDeletion));
	spyOn(markerDialogService, "showConfirmDeletionDialog");
	spyOn(markerDialogService, "dismissMarkerInfoDialog");

	mapService.setMarkerInfoContext(markerInfoContext);
	markerInfoContext.trigger("deleteMarkerRequested", testOpts.marker);

	callback(mapServiceDeps);
}

function testLogicWhenEditMarkerRequested(testOpts, callback) {
	var markerInfoContext = new MarkerInfoContext(testOpts.marker),
		markerDialogService = new MarkerDialogService(),
		mapServiceDeps = {
			markerDialogService: markerDialogService
		},
		mapService = createMapService(mapServiceDeps);
	spyOn(markerDialogService, "showEditMarkerDialog");
	spyOn(markerDialogService, "dismissMarkerInfoDialog");

	mapService.setMarkerInfoContext(markerInfoContext);
	markerInfoContext.trigger("editMarkerRequested", testOpts.marker);

	callback(mapServiceDeps);
}

function testInteractionWithSiteServiceWhenMarkerEdited(testOpts, callback) {
	var marker = testOpts.marker,
		markerInfoContext = new MarkerInfoContext(marker),
		markerDialogService = new MarkerDialogService(),
		siteService = new SiteService(),
		mapServiceDeps = {
			markerDialogService: markerDialogService,
			siteService: siteService
		},
		mapService = createMapService(mapServiceDeps);

	spyOn(markerDialogService, "showEditMarkerDialog").and.callFake(function(marker, callback) {
		callback();
	});
	spyOn(siteService, "updateMarker");

	mapService.setMarkerInfoContext(markerInfoContext);
	markerInfoContext.trigger("editMarkerRequested", marker);

	callback(mapServiceDeps);
}

function testInteractionWithCommsServiceWhenPointMarkerCreated(testOpts, callback) {
	// jshint unused: false
	var map = createMap(),
		commsService = createCommsService(),
		mapServiceDeps = {
			map: map,
			commsService: commsService
		},
		mapService = createMapService(mapServiceDeps);
	spyOn(commsService, "sendMessage");

	simulatePointMarkerCreatedEventOnMap(map, testOpts.location, testOpts.pointSymbol);

	callback(mapServiceDeps);
}

function testInteractionWithCommsServiceWhenPolylineMarkerCreated(testOpts, callback) {
	// jshint unused: false
	var map = createMap(),
		commsService = createCommsService(),
		mapServiceDeps = {
			map: map,
			commsService: commsService
		},
		mapService = createMapService(mapServiceDeps);
	spyOn(commsService, "sendMessage");

	simulatePolylineMarkerCreatedEventOnMap(map, testOpts.locations, testOpts.polylineSymbol);

	callback(mapServiceDeps);
}

function testInteractionWithCommsServiceWhenPolygonMarkerCreated(testOpts, callback) {
	// jshint unused: false
	var map = createMap(),
		commsService = createCommsService(),
		mapServiceDeps = {
			map: map,
			commsService: commsService
		},
		mapService = createMapService(mapServiceDeps);
	spyOn(commsService, "sendMessage");

	simulatePolygonMarkerCreatedEventOnMap(map, testOpts.locations, testOpts.polygonSymbol);

	callback(mapServiceDeps);
}

function getArgForMostRecentCall(spy, argIndex) {
	var mostRecentCall = spy.calls.mostRecent();
	var arg = mostRecentCall.args[argIndex];
	return arg;
}

function MockScriptInjectionService() {
}
MockScriptInjectionService.prototype = {
	injectIntoBody: function(scriptUrls, callback) {
		// jshint unused: false
		setTimeout(callback, 0);
	}
};
