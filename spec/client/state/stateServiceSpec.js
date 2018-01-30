require("../testUtils/init");
var loader = require("../testUtils/loader");

var StateService = loader.load("state/StateService"),
	dm = loader.load("model/datamodel"),
	UserInfo = dm.UserInfo,
	Location = dm.Location,
	PointMarker = dm.PointMarker,
	PolylineMarker = dm.PolylineMarker,
	PolygonMarker = dm.PolygonMarker,
	MapExtent = dm.MapExtent,
	SiteSettings = dm.SiteSettings,
	UserSettings = dm.UserSettings;

var INVALID_STRING = 1234;
var INVALID_NUMBER = "657";

var USER_INFO1 = new UserInfo(8, "John");
var USER_INFO2 = new UserInfo(9, "Jane");
var USER_INFO3 = new UserInfo(10, "Jared");

var LOCATION1 = new Location(1, 1);
var LOCATION2 = new Location(2, 2);
var LOCATION3 = new Location(3, 3);

var MARKER1 = new PointMarker(1, LOCATION1);
var MARKER2 = new PolylineMarker(2, [LOCATION1, LOCATION2]);
var MARKER3 = new PolygonMarker(3, [LOCATION1, LOCATION2, LOCATION3]);

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

var getGetterMethodName = function(propName) {
	return "get" + propName;
};

var getSetterMethodName = function(propName) {
	return "set" + propName;
};

var verifyCanSetAndGetProperty = function(propName, storedValue) {
	var ss = new StateService();

	var setter = getSetterMethodName(propName);
	var getter = getGetterMethodName(propName);

	ss[setter](storedValue);
	var returnedValue = ss[getter]();

	expect(returnedValue).toBe(storedValue);
};

var verifyCanAddAndGetItems = function(propName, values) {
	var ss = new StateService();

	var addMethod = "add" + propName;
	for(var i = 0; i < values.length; i++) {
		ss[addMethod](values[i]);
	}

	var getMethod = "get" + propName + "s";
	var returnedValues = ss[getMethod]();
	verifyArrayContainsContentsOfArray(returnedValues, values);
};

var verifyCanRemoveItems = function(propName, values, removedItem) {
	var ss = new StateService();

	var addMethod = "add" + propName;
	var removeMethod = "remove" + propName;
	var getMethod = "get" + propName + "s";

	for(var i = 0; i < values.length; i++) {
		ss[addMethod](values[i]);
	}
	var removeReturnValue = ss[removeMethod](removedItem.id);
	expect(removeReturnValue).toBe(removedItem);

	var returnedValues = ss[getMethod]();
	expect(returnedValues.length).toBe(values.length - 1);

	values.splice(values.indexOf(removedItem), 1);

	verifyArrayContainsContentsOfArray(returnedValues, values);
};

var verifyArraySetter = function(propName, values, overwrittenValues) {
	var ss = new StateService();

	var addMethod = "add" + propName;
	var setMethod = "set" + propName + "s";
	var getMethod = "get" + propName + "s";

	for(var i = 0; i < overwrittenValues.length; i++) {
		ss[addMethod](overwrittenValues[i]);
	}

	ss[setMethod](values);
	var returnedValues = ss[getMethod]();

	expect(returnedValues.length).toBe(values.length);
	verifyArrayContainsContentsOfArray(returnedValues, values);
};

var verifySetterValidation = function(propName, invalidValue) {
	var ss = new StateService();
	var setter = getSetterMethodName(propName);

	expect(typeof ss[setter]).toBe("function");

	expect(function() {
		ss[setter](invalidValue);
	}).toThrowError(TypeError);
};

var verifyTypeErrorThrownWhenInvalidObjectProvidedToSetterMethod = function(propName) {
	var ss = new StateService();

	var methodName = "set" + propName;
	expect(function() {
		ss[methodName]({});
	}).toThrowError(TypeError);
};

var verifyTypeErrorThrownWhenInvalidObjectProvidedToAddMethod = function(propName) {
	var ss = new StateService();

	var methodName = "add" + propName;
	expect(function() {
		ss[methodName]({});
	}).toThrowError(TypeError);
};

var verifySameItemWillNotBeAddedTwice = function(propName, item) {
	var ss = new StateService(),
	addMethod = "add" + propName,
	getMethod = "get" + propName + "s";

	ss[addMethod](item);
	ss[addMethod](item);

	var items = ss[getMethod]();
	expect(items.length).toBe(1);
	expect(items[0]).toBe(item);
};

var verifyTypeErrorThrownWhenInvalidObjectProvidedToArraySetterMethod = function(propName, validValues) {
	var ss = new StateService();

	var arr = validValues.concat({});

	var methodName = "set" + propName + "s";
	expect(function() {
		ss[methodName](arr);
	}).toThrowError(TypeError);
};

var verifyCanGetAndSetObject = function(propName, value) {
	var ss = new StateService();
	var setMethod = "set" + propName;
	var getMethod = "get" + propName;

	ss[setMethod](value);
	var returnedValue = ss[getMethod]();

	expect(returnedValue).toBe(value);
};

var verifyArrayContainsContentsOfArray = function(supersetArray, subsetArray) {
	for(var i = 0; i < subsetArray.length; i++) {
		verifyArrayContainsObject(supersetArray, subsetArray[i]);
	}
};

var verifyArrayContainsObject = function(array, obj) {
	expect(array).toContain(obj);
};

describe("A State Service", function() {

	it("can set and retrieve a site's name",
		verifyCanSetAndGetProperty.bind(this, "SiteName", "Name of My Map"));

	it("throws a TypeError if given a non-String site name",
		verifySetterValidation.bind(this, "SiteName", INVALID_STRING));

	it("can set and retrieve a site's description",
		verifyCanSetAndGetProperty.bind(this, "SiteDescription", "Description for My Map"));

	it("throws a TypeError if given a non-String site description",
		verifySetterValidation.bind(this, "SiteDescription", INVALID_STRING));

	it("can set and retrieve current user's ID",
		verifyCanSetAndGetProperty.bind(this, "CurrentUserId", 3));

	it("throws a TypeError if given a non-Number current user ID",
		verifySetterValidation.bind(this, "CurrentUserId", INVALID_NUMBER));

	it("can set and retrieve site owner's ID",
		verifyCanSetAndGetProperty.bind(this, "SiteOwnerId", 7));

	it("throws a TypeError if given a non-Number site owner ID",
		verifySetterValidation.bind(this, "SiteOwnerId", INVALID_NUMBER));

	it("can set and retrieve site owner's ID",
		verifyCanSetAndGetProperty.bind(this, "SiteOwnerId", 7));

	it("can add and retrieve users",
		verifyCanAddAndGetItems.bind(this, "User", [USER_INFO1, USER_INFO2]));

	it("throws a TypeError if addUser is given a non-UserInfo",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToAddMethod.bind(this, "User"));

	it("prevents the same UserInfo from being added twice",
		verifySameItemWillNotBeAddedTwice.bind(this, "User", USER_INFO1));

	it("can remove a user",
		verifyCanRemoveItems.bind(this, "User", [USER_INFO1, USER_INFO2], USER_INFO2));

	it("can update an existing user's name", function() {
		var ss = new StateService();
		var u = new UserInfo(8, "John");

		ss.setUsers([u]);

		u = new UserInfo(8, "Joel");
		ss.updateUser(u);

		var allUsers = ss.getUsers();
		expect(allUsers.length).toBe(1);
		expect(allUsers[0].name).toBe("Joel");
	});

	it("returns update results when a user's name is updated", function() {
		var ss = new StateService();
		var u = new UserInfo(8, "John"),
			u2 = new UserInfo(8, "Joel");

		ss.setUsers([u]);
		var updateResults = ss.updateUser(u2);

		expect(updateResults.updatedObj).toEqual(u2);
		var changedFields = updateResults.changedFields;
		expect(changedFields.length).toBe(1);
		expect(changedFields[0].name).toBe("name");
		expect(changedFields[0].oldValue).toBe("John");
		expect(changedFields[0].newValue).toBe("Joel");
	});

	it("does not return changed fields when updated user is unchanged", function() {
		var ss = new StateService();
		var u = new UserInfo(8, "John");

		ss.setUsers([u]);
		var updateResults = ss.updateUser(u);

		expect(updateResults.updatedObj).toEqual(u);
		expect(updateResults.changedFields.length).toBe(0);
	});

	it("does not throw an error when updateUser is given non-existent user", function() {
		var ss = new StateService();
		ss.setUsers([USER_INFO1]);

		expect(function() {
			ss.updateUser(new UserInfo(1234, "Doesn't exist"));
		}).not.toThrow();
	});

	it("can explicitly set the list of users",
		verifyArraySetter.bind(this, "User", [USER_INFO2, USER_INFO3], [USER_INFO1]));

	it("throws a TypeError if setUsers is given an array containing a non-UserInfo",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToArraySetterMethod.bind(this, "User", [USER_INFO1]));

	it("can add and retrieve markers",
		verifyCanAddAndGetItems.bind(this, "Marker", [MARKER1, MARKER2]));

	it("throws a TypeError if addMarker is given a non-Marker",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToAddMethod.bind(this, "Marker"));

	it("prevents the same Marker from being added twice",
		verifySameItemWillNotBeAddedTwice.bind(this, "Marker", MARKER2));

	it("can remove a marker",
		verifyCanRemoveItems.bind(this, "Marker", [MARKER1, MARKER2], MARKER1));

	it("can update an existing marker's name", function() {
		var ss = new StateService();
		var m = new PointMarker(1, LOCATION1);
		m.name = "Seattle";

		ss.setMarkers([m]);

		m = new PointMarker(1, LOCATION1);
		m.name = "Des Moines";
		ss.updateMarker(m);

		var allMarkers = ss.getMarkers();
		expect(allMarkers.length).toBe(1);
		expect(allMarkers[0].name).toBe("Des Moines");
	});

	it("returns update results when a marker's name is updated", function() {
		var ss = new StateService();
		var m = new PointMarker(1, LOCATION1);
		m.name = "Seattle";
		var m2 = new PointMarker(1, LOCATION1);
		m2.name = "Des Moines";

		ss.setMarkers([m]);
		var updateResults = ss.updateMarker(m2);

		expect(updateResults.updatedObj).toEqual(m2);
		var changedFields = updateResults.changedFields;
		expect(changedFields.length).toBe(1);
		expect(changedFields[0].name).toBe("name");
		expect(changedFields[0].oldValue).toBe("Seattle");
		expect(changedFields[0].newValue).toBe("Des Moines");
	});

	it("does not return changed fields when updated marker is unchanged", function() {
		var ss = new StateService();
		var m = new PointMarker(1, LOCATION1);
		m.name = "Seattle";

		ss.setMarkers([m]);
		var updateResults = ss.updateMarker(m);

		expect(updateResults.updatedObj).toEqual(m);
		expect(updateResults.changedFields.length).toBe(0);
	});

	it("does not throw an error when updateMarker is given non-existent marker", function() {
		var ss = new StateService();
		ss.setMarkers([MARKER1]);

		expect(function() {
			ss.updateMarker(new PointMarker(1234, LOCATION2));
		}).not.toThrow();
	});

	it("can explicitly set the list of markers",
		verifyArraySetter.bind(this, "Marker", [MARKER1, MARKER3], [MARKER2]));

	it("throws a TypeError if setMarkers is given an array containing a non-Marker",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToArraySetterMethod.bind(this, "Marker", [MARKER1]));

	it("can set and retrieve available marker icons",
		verifyCanGetAndSetObject.bind(this, "MarkerIcons", MARKER_ICONS));

	it("can set and retrieve available marker colors",
		verifyCanGetAndSetObject.bind(this, "MarkerColors", MARKER_COLORS));

	it("can set and retrieve extent",
		verifyCanGetAndSetObject.bind(this, "Extent", EXTENT1));

	it("throws a TypeError if setExtent is given a non-MapExtent",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToSetterMethod.bind(this, "Extent"));

	it("can set and retrieve site settings",
		verifyCanGetAndSetObject.bind(this, "SiteSettings", new SiteSettings()));

	it("throws a TypeError if setSiteSettings is given a non-SiteSettings",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToSetterMethod.bind(this, "SiteSettings"));

	it("can set and retrieve user settings",
		verifyCanGetAndSetObject.bind(this, "UserSettings", new UserSettings()));

	it("throws a TypeError if setUserSettings is given a non-UserSettings",
		verifyTypeErrorThrownWhenInvalidObjectProvidedToSetterMethod.bind(this, "UserSettings"));

});
