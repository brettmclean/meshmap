require("../testUtils/init");
var loader = require("../testUtils/loader");

var MarkerPermissionsService = loader.load("security/MarkerPermissionsService"),
	SiteService = loader.load("state/SiteService"),
	dm = loader.load("model/datamodel"),
	Location = dm.Location,
	PointMarker = dm.PointMarker;

var LOCATION1 = new Location(1, 1);
var MARKER1 = new PointMarker(6, LOCATION1);

var USER_ID1 = 12;
var USER_ID2 = 13;

describe("A Marker Permissions Service", function() {

	it("has an userCanEditMarker method",
		verifyMethodExists.bind(this, "getUserCanEditMarker"));

	describe("getUserCanEditMarker method", function() {

		it("throws a TypeError when given a null marker", function() {
			var mps = createMarkerPermissionsService();
			expect(function() {
				mps.getUserCanEditMarker(null);
			}).toThrowError(TypeError);
		});

		it("throws a TypeError when given an invalid marker object", function() {
			var mps = createMarkerPermissionsService();
			expect(function() {
				mps.getUserCanEditMarker({});
			}).toThrowError(TypeError);
		});

		it("does not throw an error when given a valid marker object", function() {
			var mps = createMarkerPermissionsService();
			expect(function() {
				mps.getUserCanEditMarker(MARKER1);
			}).not.toThrow();
		});

		it("throws a TypeError when marker permissions service was given a null SiteService", function() {
			var mps = createMarkerPermissionsServiceWithSiteService(null);
			expect(function() {
				mps.getUserCanEditMarker(MARKER1);
			}).toThrowError(TypeError);
		});

		it("calls getOnlyOwnerCanEdit on SiteService", function() {
			var siteService = createSiteService(false, USER_ID1);
			var mps = createMarkerPermissionsServiceWithSiteService(siteService);

			mps.getUserCanEditMarker(MARKER1);

			expect(siteService.getOnlyOwnerCanEdit).toHaveBeenCalled();
		});

		it("calls getCurrentUserId on SiteService when only marker owners can edit markers", function() {
			var siteService = createSiteService(true, USER_ID1);
			var mps = createMarkerPermissionsServiceWithSiteService(siteService);

			mps.getUserCanEditMarker(MARKER1);

			expect(siteService.getCurrentUserId).toHaveBeenCalled();
		});

		it("returns true when onlyOwnerCanEdit is false", function() {
			var siteService = createSiteService(false, USER_ID1);
			var mps = createMarkerPermissionsServiceWithSiteService(siteService);

			var userCanEditMarker = mps.getUserCanEditMarker(MARKER1);

			expect(userCanEditMarker).toBe(true);
		});

		it("returns false when onlyOwnerCanEdit is true and marker owner does not match current user", function() {
			var siteService = createSiteService(true, USER_ID1);
			var marker = createPointMarkerWithOwnerId(USER_ID2);
			var mps = createMarkerPermissionsServiceWithSiteService(siteService);

			var userCanEditMarker = mps.getUserCanEditMarker(marker);

			expect(userCanEditMarker).toBe(false);
		});

		it("returns true when onlyOwnerCanEdit is true and marker owner matches current user", function() {
			var siteService = createSiteService(true, USER_ID1);
			var marker = createPointMarkerWithOwnerId(USER_ID1);
			var mps = createMarkerPermissionsServiceWithSiteService(siteService);

			var userCanEditMarker = mps.getUserCanEditMarker(marker);

			expect(userCanEditMarker).toBe(true);
		});

	});

});

function verifyMethodExists(methodName) {
	var mps = createMarkerPermissionsService();
	expect(typeof mps[methodName]).toBe("function");
}

function createPointMarkerWithOwnerId(ownerId) {
	var marker = new PointMarker(10, LOCATION1);
	marker.ownerId = ownerId;
	return marker;
}

function createMarkerPermissionsService() {
	var siteService = createSiteService(false, USER_ID1);
	return createMarkerPermissionsServiceWithSiteService(siteService);
}

function createMarkerPermissionsServiceWithSiteService(siteService) {
	return new MarkerPermissionsService(siteService);
}

function createSiteService(onlyOwnerCanEditValue, currentUserId) {
	var siteService = new SiteService();
	spyOn(siteService, "getOnlyOwnerCanEdit").and.returnValue(onlyOwnerCanEditValue);
	spyOn(siteService, "getCurrentUserId").and.returnValue(currentUserId);
	return siteService;
}
