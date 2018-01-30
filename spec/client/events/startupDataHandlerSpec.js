require("../testUtils/init");
var loader = require("../testUtils/loader");

var StartupDataHandler = loader.load("events/messageHandlers/StartupDataHandler"),
	dm = loader.load("model/datamodel"),
	StartupData = dm.StartupData,
	Location = dm.Location,
	PointMarker = dm.PointMarker,
	PolylineMarker = dm.PolylineMarker,
	PolygonMarker = dm.PolygonMarker,
	UserInfo = dm.UserInfo,
	MapExtent = dm.MapExtent,
	SiteSettings = dm.SiteSettings,
	UserSettings = dm.UserSettings,
	UserSiteState = dm.UserSiteState;

var SITE_NAME = "My Map";
var SITE_DESCRIPTION = "This is my map.";

var LOCATION1 = new Location(1, 1);
var LOCATION2 = new Location(2, 2);
var LOCATION3 = new Location(3, 3);

var MARKER1 = new PointMarker(1, LOCATION1);
var MARKER2 = new PolylineMarker(2, [LOCATION1, LOCATION2]);
var MARKER3 = new PolygonMarker(3, [LOCATION1, LOCATION2, LOCATION3]);

var USER_INFO1 = new UserInfo(8, "John");
var USER_INFO2 = new UserInfo(9, "Jane");

var CURRENT_USER_ID = 12;

var SITE_OWNER_ID = 17;

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

var EXTENT1 = new MapExtent(LOCATION1, LOCATION2);
var EXTENT2 = new MapExtent(LOCATION2, LOCATION3);

var SITE_SETTINGS = new SiteSettings({
	onlyOwnerCanEdit: true,
	initialExtent: EXTENT1
});

var USER_SETTINGS = new UserSettings({
	confirmMarkerDeletion: false
});

var USER_SITE_STATE = new UserSiteState({
	extent: EXTENT2
});

var STARTUP_DATA = (function() {
	var sd = new StartupData(
		[MARKER1, MARKER2, MARKER3],
		[USER_INFO1, USER_INFO2],
		CURRENT_USER_ID,
		SITE_OWNER_ID,
		MARKER_ICONS,
		MARKER_COLORS,
		SITE_SETTINGS,
		USER_SETTINGS,
		USER_SITE_STATE
	);
	sd.siteName = SITE_NAME;
	sd.siteDescription = SITE_DESCRIPTION;

	return sd;
}());

var createStartupDataHandler = function() {
	return new StartupDataHandler();
};

var createStartupDataHandlerWithSiteService = function(siteService) {
	return new StartupDataHandler({
		siteService: siteService
	});
};

var verifySiteServiceSetterIsCalled = function(setterName, expectedValue) {
	var ss = new MockSiteService(),
		sdh = createStartupDataHandlerWithSiteService(ss);

	spyOn(ss, setterName);
	sdh.handle(STARTUP_DATA);

	expect(ss[setterName]).toHaveBeenCalledWith(expectedValue);
};

var MockSiteService = function() {};
MockSiteService.prototype = {
	setName: function() {},
	setDescription: function() {},
	setMarkers: function() {},
	setUsers: function() {},
	setCurrentUserId: function() {},
	setOwnerUserId: function() {},
	setMarkerIcons: function() {},
	setMarkerColors: function() {},
	setInitialExtent: function() {},
	setSiteSettings: function() {},
	setUserSettings: function() {}
};

describe("A Startup Data Handler", function() {

	it("does not throw an error if site service is not provided", function() {
		var sdh = createStartupDataHandler();

		expect(function() {
			sdh.handle(STARTUP_DATA);
		}).not.toThrow();
	});

	it("sets site name on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setName", SITE_NAME));

	it("sets site description on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setDescription", SITE_DESCRIPTION));

	it("sets markers on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setMarkers", [MARKER1, MARKER2, MARKER3]));

	it("sets users on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setUsers", [USER_INFO1, USER_INFO2]));

	it("sets current user ID on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setCurrentUserId", CURRENT_USER_ID));

	it("sets site owner ID on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setOwnerUserId", SITE_OWNER_ID));

	it("sets user-site state extent as initial extent on site service when available in startup data",
		verifySiteServiceSetterIsCalled.bind(this, "setInitialExtent", EXTENT2));

	it("sets site initial extent as initial extent on site service user-site state extent is unavailable", function() {
		var ss = new MockSiteService(),
			sdh = createStartupDataHandlerWithSiteService(ss);

		var sd = new StartupData(null, null, null,	null,	null,	null,	SITE_SETTINGS, null, null);

		spyOn(ss, "setInitialExtent");
		sdh.handle(sd);

		expect(ss.setInitialExtent).toHaveBeenCalledWith(EXTENT1);
	});

	it("sets marker icons on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setMarkerIcons", MARKER_ICONS));

	it("sets marker colors on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setMarkerColors", MARKER_COLORS));

	it("sets site settings on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setSiteSettings", SITE_SETTINGS));

	it("sets user settings on site service when startup data is given",
		verifySiteServiceSetterIsCalled.bind(this, "setUserSettings", USER_SETTINGS));

});
