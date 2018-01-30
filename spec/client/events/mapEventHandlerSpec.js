require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteService = loader.load("state/SiteService"),
	MapEventHandler = loader.load("events/messageHandlers/MapEventHandler"),
	dm = loader.load("model/datamodel"),
	MapEvent = dm.MapEvent,
	Location = dm.Location,
	PointMarker = dm.PointMarker;

var createMapEventHandler = function() {
	return new MapEventHandler();
};

var createMapEventHandlerWithSiteService = function(siteService) {
	return new MapEventHandler({
		siteService: siteService
	});
};

var toUntypedObj = function(o) {
	return JSON.parse(JSON.stringify(o));
};

var LOCATION1 = new Location(1, 1);
var LOCATION2 = new Location(2, 2);

var MARKER1 = new PointMarker(6, LOCATION1);
var MARKER2 = new PointMarker(7, LOCATION2);

var ADD_MARKER_MAP_EVENT = toUntypedObj(new MapEvent(MapEvent.ADD_MARKER, MARKER1));

var REMOVE_MARKER_MAP_EVENT = toUntypedObj(new MapEvent(MapEvent.REMOVE_MARKER, 35));

var UPDATE_MARKER_MAP_EVENT = toUntypedObj(new MapEvent(MapEvent.UPDATE_MARKER, MARKER2));

describe("A map event handler", function() {

	it("does not throw error if site service is not provided", function() {
		var meh = createMapEventHandler();

		expect(function() {
			meh.handle(ADD_MARKER_MAP_EVENT);
			meh.handle(REMOVE_MARKER_MAP_EVENT);
			meh.handle(UPDATE_MARKER_MAP_EVENT);
		}).not.toThrow();
	});

	it("passes added markers to site service", function() {
		var ss = new SiteService(),
			meh = createMapEventHandlerWithSiteService(ss);

		spyOn(ss, "addMarker");

		meh.handle(ADD_MARKER_MAP_EVENT);

		var firstArg = ss.addMarker.calls.first().args[0];
		expect(ss.addMarker).toHaveBeenCalledWith(jasmine.any(PointMarker));
		expect(firstArg.id).toBe(MARKER1.id);
		expect(firstArg.location.lat).toBe(LOCATION1.lat);
	});

	it("passes removed marker IDs to site service", function() {
		var ss = new SiteService(),
			meh = createMapEventHandlerWithSiteService(ss);

		spyOn(ss, "removeMarker");
		meh.handle(REMOVE_MARKER_MAP_EVENT);

		expect(ss.removeMarker).toHaveBeenCalledWith(REMOVE_MARKER_MAP_EVENT.data);
	});

	it("passes updated markers to site service", function() {
		var ss = new SiteService(),
			meh = createMapEventHandlerWithSiteService(ss);

		spyOn(ss, "updateMarkerFromRemoteChange");
		meh.handle(UPDATE_MARKER_MAP_EVENT);

		expect(ss.updateMarkerFromRemoteChange).toHaveBeenCalled();
		var firstArg = ss.updateMarkerFromRemoteChange.calls.first().args[0];
		expect(firstArg.id).toBe(MARKER2.id);
		expect(firstArg.location.lat).toBe(LOCATION2.lat);
	});

	it("does not throw error when given invalid map event", function() {
		var meh = createMapEventHandlerWithSiteService(new SiteService());

		expect(function() {
			meh.handle(new MapEvent("notAValidEventType", null));
		}).not.toThrow();
	});

});
