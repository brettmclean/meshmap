require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteService = loader.load("state/SiteService"),
	EventBus = loader.load("events/EventBus"),
	StateService = loader.load("state/StateService"),
	ExtentUpdater = loader.load("map/ExtentUpdater"),
	CommsService = loader.load("utils/comms/CommsService"),
	dm = loader.load("model/datamodel"),
	MapEvent = dm.MapEvent,
	UserInfo = dm.UserInfo,
	SiteSettings = dm.SiteSettings,
	UserSettings = dm.UserSettings,
	Location = dm.Location,
	Marker = dm.Marker,
	PointMarker = dm.PointMarker,
	PolylineMarker = dm.PolylineMarker,
	PolygonMarker = dm.PolygonMarker,
	MapExtent = dm.MapExtent;

var USER_INFO1 = new UserInfo(8, "John");
var USER_INFO2 = new UserInfo(9, "Jane");

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
var LOCATION3 = new Location(3, 3);

var MARKER1 = new PointMarker(1, LOCATION1);
var MARKER2 = new PolylineMarker(2, [LOCATION1, LOCATION2]);
var MARKER3 = new PolygonMarker(3, [LOCATION1, LOCATION2, LOCATION3]);

var EXTENT1 = new MapExtent(LOCATION1, LOCATION2);
var EXTENT2 = new MapExtent(LOCATION2, LOCATION3);

var getGetterMethodName = function(propName) {
	return "get" + propName;
};

var getSetterMethodName = function(propName) {
	return "set" + propName;
};

var verifyCanSetAndGetProperty = function(propName, storedValue) {
	var ss = createSiteService();

	var setter = getSetterMethodName(propName);
	var getter = getGetterMethodName(propName);

	ss[setter](storedValue);
	var returnedValue = ss[getter]();

	expect(returnedValue).toBe(storedValue);
};

var verifyStateServiceCalledOnSetProperty = function(sitePropName, statePropName, storedValue) {
	var state = new StateService(),
		ss = createSiteServiceWithStateService(state),
		stateSetter = getSetterMethodName(statePropName),
		siteSetter = getSetterMethodName(sitePropName);

	spyOn(state, stateSetter);
	ss[siteSetter](storedValue);

	expect(state[stateSetter].calls.count()).toBeGreaterThan(0);
};

var verifyStateServiceCalledOnSetAndGetProperty = function(sitePropName, statePropName, storedValue) {
	var state = new StateService(),
		ss = createSiteServiceWithStateService(state),
		stateSetter = getSetterMethodName(statePropName),
		stateGetter = getGetterMethodName(statePropName),
		siteSetter = getSetterMethodName(sitePropName),
		siteGetter = getGetterMethodName(sitePropName);

	spyOn(state, stateSetter);
	spyOn(state, stateGetter);
	ss[siteSetter](storedValue);
	ss[siteGetter]();

	expect(state[stateSetter].calls.count()).toBeGreaterThan(0);
	expect(state[stateGetter].calls.count()).toBeGreaterThan(0);
};

var verifyEventFiredWhenPropertySet = function(propName, propValue, eventName, done) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb);

	eb.subscribe(eventName, function(eventArg) {
		expect(eventArg).toBe(propValue);
		done();
	});

	ss["set" + propName](propValue);
};

var verifyEventNotFiredWhenPropertySetWithUnchangedValue = function(propName, propValue, eventName) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb),
		setterMethod = "set" + propName;

	ss[setterMethod](propValue);
	eb.subscribe(eventName, function() {
		fail(eventName + " event should not fire if new value is identical");
	});

	ss[setterMethod](propValue);
};

var verifyCanAddAndGetItems = function(propName, values) {
	var ss = createSiteService();

	var addMethod = "add" + propName;
	for(var i = 0; i < values.length; i++) {
		ss[addMethod](values[i]);
	}

	var getMethod = "get" + propName + "s";
	var returnedValues = ss[getMethod]();
	verifyArraysAreSimilar(returnedValues, values);
};

var verifyEventFiredWhenItemAdded = function(propName, propValue, eventName, done) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb);

	eb.subscribe(eventName, function(eventArg) {
		expect(eventArg).toBe(propValue);
		done();
	});

	var addMethod = "add" + propName;
	ss[addMethod](propValue);
};

var verifyCanSetItemList = function(propName, values) {
	var ss = createSiteService(),
		setMethod = "set" + propName + "s",
		getMethod = "get" + propName + "s";

	ss[setMethod](values);
	var returnedValues = ss[getMethod]();

	verifyArraysAreSimilar(values, returnedValues);
};

var verifyEventFiredWhenItemListSet = function(propName, propList, eventName, done) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb);

	eb.subscribe(eventName, done);

	var setMethod = "set" + propName + "s";
	ss[setMethod](propList);
};

var verifyEventFiredForEachItemWhenItemListSet = function(propName, propList, eventName, done) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb);

	var eventCount = 0;
	eb.subscribe(eventName, function(eventArg) {
		expect(eventArg).toBe(propList[eventCount]);

		eventCount++;
		if(eventCount === propList.length) {
			done();
		}
	});

	var setMethod = "set" + propName + "s";
	ss[setMethod](propList);
};

var verifyCanRemoveItems = function(propName, values, removedItem) {
	var ss = createSiteService();
	var setMethod = "set" + propName + "s";
	var removeMethod = "remove" + propName;
	var getMethod = "get" + propName + "s";

	ss[setMethod](values);
	ss[removeMethod](removedItem.id);
	var returnedValues = ss[getMethod]();

	expect(returnedValues.length).toBe(values.length - 1);

	values.splice(values.indexOf(removedItem), 1);
	verifyArraysAreSimilar(values, returnedValues);
};

var verifyEventFiredWhenItemRemoved = function(propName, propValue, eventName, done) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb),
		setMethod = "set" + propName + "s",
		removeMethod = "remove" + propName;

	ss[setMethod]([propValue]);

	eb.subscribe(eventName, function(eventArg) {
		expect(eventArg).toBe(propValue);
		done();
	});

	ss[removeMethod](propValue.id);
};

var verifyEventNotFiredWhenRemovedItemNotPresent = function(propName, propValue, eventName) {
	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb),
		removeMethod = "remove" + propName;

	eb.subscribe(eventName, function() {
		fail(eventName + " event should not fire if removed value was not present");
	});

	ss[removeMethod](propValue);
};

var verifyPropertyIsUpdated = function(itemName, itemType, oldItem, newItem, propName, newPropValue) {
	var ss = createSiteService(),
		setMethod = "set" + itemName + "s",
		updateMethod = "update" + itemName,
		getMethod = "get" + itemName + "s";

	oldItem = cloneItem(oldItem, itemType);
	ss[setMethod]([oldItem]);
	ss[updateMethod](newItem);

	var allItems = ss[getMethod]();
	expect(allItems.length).toBe(1);
	expect(allItems[0][propName]).toBe(newPropValue);
};

var verifyEventFiredWhenItemUpdated = function(
	eventName, itemName, itemType, oldItem,
	newItem, itemProp, itemPropValue, done) {

	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb),
		setMethod = "set" + itemName + "s",
		updateMethod = "update" + itemName;

	oldItem = cloneItem(oldItem, itemType);
	ss[setMethod]([oldItem]);

	eb.subscribe(eventName, function(updatedItem) {
		expect(updatedItem[itemProp]).toBe(itemPropValue);
		done();
	});

	ss[updateMethod](newItem);
};

var verifyEventNotFiredWhenUpdatedItemNotPresent = function(
	eventName, itemName, item, differentItem) {

	var eb = new EventBus(),
		ss = createSiteServiceWithEventBus(eb),
		setMethod = "set" + itemName + "s",
		updateMethod = "update" + itemName;

	ss[setMethod]([item]);

	eb.subscribe(eventName, function() {
		fail(eventName + " event should not fire if updated value was not present");
	});

	ss[updateMethod](differentItem);
};

var verifyArraysAreSimilar = function(first, second) {
	expect(first.length).toBe(second.length);
	verifyArrayContainsContentsOfArray(first, second);
};

var verifyArrayContainsContentsOfArray = function(supersetArray, subsetArray) {
	for(var i = 0; i < subsetArray.length; i++) {
		verifyArrayContainsObject(supersetArray, subsetArray[i]);
	}
};

var verifyArrayContainsObject = function(array, obj) {
	expect(array).toContain(obj);
};

var createSiteService = function() {
	return createSiteServiceWithStateService(new StateService());
};

var createExtentUpdater = function() {
	return new ExtentUpdater();
};

var createSiteServiceWithStateService = function(state) {
	return new SiteService({
		state: state
	});
};

var createSiteServiceWithEventBus = function(eventBus) {
	return new SiteService({
		eventBus: eventBus
	});
};

var createSiteServiceWithExtentUpdater = function(extentUpdater) {
	return new SiteService({
		extentUpdater: extentUpdater
	});
};

var createSiteServiceWithCommsService = function(comms) {
	return new SiteService({
		comms: comms
	});
};

var cloneItem = function(item, type) {
	return type.parse(item);
};

describe("A Site Service", function() {

	describe("setName method", function() {
		it("stores the site name in the provided state service",
			verifyStateServiceCalledOnSetProperty.bind(this, "Name", "SiteName", "My Map"));

		it("fires siteNameChanged event when site name is changed", function(done) {
			verifyEventFiredWhenPropertySet("Name", "My Map", "siteNameChanged", done);
		});

		it("does not fire siteNameChanged event if site name is unchanged",
			verifyEventNotFiredWhenPropertySetWithUnchangedValue.bind(this, "Name", "My Map", "siteNameChanged"));
	});

	describe("setDescription method", function() {
		it("stores the site description in the provided state service",
			verifyStateServiceCalledOnSetProperty.bind(this, "Description", "SiteDescription", "This is my map."));

		it("fires siteDescriptionChanged event when site description is changed", function(done) {
			verifyEventFiredWhenPropertySet("Description", "This is my map.", "siteDescriptionChanged", done);
		});

		it("does not fire siteDescriptionChanged event if site description is unchanged",
			verifyEventNotFiredWhenPropertySetWithUnchangedValue.bind(this, "Description", "This is my map.", "siteDescriptionChanged"));
	});

	describe("user method(s)", function() {
		it("can add and retrieve users",
			verifyCanAddAndGetItems.bind(this, "User", [USER_INFO1, USER_INFO2]));

		it("fires userAdded event when user is added", function(done) {
			verifyEventFiredWhenItemAdded("User", USER_INFO1, "userAdded", done);
		});

		it("can explicitly set users list",
			verifyCanSetItemList.bind(this, "User", [USER_INFO1, USER_INFO2]));

		it("fires usersCleared event when users list is set", function(done) {
			verifyEventFiredWhenItemListSet("User", [USER_INFO1, USER_INFO2], "usersCleared", done);
		});

		it("fires userAdded event for each user when users list is set", function(done) {
			verifyEventFiredForEachItemWhenItemListSet("User", [USER_INFO1, USER_INFO2], "userAdded", done);
		});

		it("can remove a user",
			verifyCanRemoveItems.bind(this, "User", [USER_INFO1, USER_INFO2], USER_INFO2));

		it("fires userRemoved event when user is removed", function(done) {
			verifyEventFiredWhenItemRemoved("User", USER_INFO1, "userRemoved", done);
		});

		it("does not fire userRemoved event if removed user was not present", function() {
			verifyEventNotFiredWhenRemovedItemNotPresent("User", USER_INFO1, "userRemoved");
		});

		it("can update an existing user's name",
			verifyPropertyIsUpdated.bind(this, "User", UserInfo, USER_INFO1,
				new UserInfo(USER_INFO1.id, "Melinda"), "name", "Melinda"));

		it("fires userUpdated when user is updated", function(done) {
			verifyEventFiredWhenItemUpdated("userUpdated", "User", UserInfo, USER_INFO2,
				new UserInfo(USER_INFO2.id, "Melinda"), "name", "Melinda", done);
		});

		it("does not fire userUpdated if updated user was not present", function() {
			verifyEventNotFiredWhenUpdatedItemNotPresent("userUpdated", "User",
				USER_INFO1,	USER_INFO2);
		});

		it("fires systemMessageRequested event when user is updated", function(done) {
			var eb = new EventBus(),
				ss = createSiteServiceWithEventBus(eb),
				originalUser = cloneItem(USER_INFO1, UserInfo),
				oldName = originalUser.name,
				newName = "Melinda";

			ss.setUsers([originalUser]);

			eb.subscribe("systemMessageRequested", function(sysMsg) {
				expect(sysMsg).toContain(oldName);
				expect(sysMsg).toContain(newName);
				done();
			});

			ss.updateUser(new UserInfo(originalUser.id, newName));
		});
	});

	describe("setCurrentUserId method", function() {
		it("can set and retrieve the current user id",
			verifyCanSetAndGetProperty.bind(this, "CurrentUserId", 7));

		it("stores the current user id in the provided state service",
			verifyStateServiceCalledOnSetAndGetProperty.bind(this, "CurrentUserId", "CurrentUserId", 13));

		it("fires currentUserIdSet event when current user id is changed", function(done) {
			verifyEventFiredWhenPropertySet("CurrentUserId", 53687, "currentUserIdSet", done);
		});
	});

	describe("setOwnerUserId method", function() {
		it("can set and retrieve the owner user id",
			verifyCanSetAndGetProperty.bind(this, "OwnerUserId", 653));

		it("stores the owner user id in the provided state service",
			verifyStateServiceCalledOnSetAndGetProperty.bind(this, "OwnerUserId", "SiteOwnerId", 3547));

		it("fires siteOwnerIdSet event when owner user id is changed", function(done) {
			verifyEventFiredWhenPropertySet("OwnerUserId", 987, "siteOwnerIdSet", done);
		});
	});

	describe("setSiteSettings method", function() {
		it("can set and retrieve the site settings",
			verifyCanSetAndGetProperty.bind(this, "SiteSettings", new SiteSettings()));

		it("stores the site settings in the provided state service",
			verifyStateServiceCalledOnSetAndGetProperty.bind(this, "SiteSettings", "SiteSettings", new SiteSettings()));
	});

	describe("onlyOwnerCanEdit methods", function() {

		it("get whether a marker can only be edited by its owner from state service", function() {
			var siteSettings = new SiteSettings(),
				state = new StateService(),
				ss = createSiteServiceWithStateService(state);

			state.setSiteSettings(siteSettings);
			spyOn(state, "getSiteSettings").and.callThrough();
			ss.getOnlyOwnerCanEdit();

			expect(state.getSiteSettings).toHaveBeenCalled();
		});

		it("set whether a marker can only be edited by its owner via state service", function() {
			var expected = true,
				siteSettings = new SiteSettings(),
				state = new StateService(),
				ss = createSiteServiceWithStateService(state);

			state.setSiteSettings(siteSettings);
			spyOn(state, "getSiteSettings").and.callThrough();
			ss.setOnlyOwnerCanEdit(expected);
			var actual = state.getSiteSettings().onlyOwnerCanEdit;

			expect(state.getSiteSettings).toHaveBeenCalled();
			expect(actual).toBe(expected);
		});
	});

	describe("setUserSettings method", function() {
		it("can set and retrieve the user settings",
			verifyCanSetAndGetProperty.bind(this, "UserSettings", new UserSettings()));

		it("stores the user settings in the provided state service",
			verifyStateServiceCalledOnSetAndGetProperty.bind(this, "UserSettings", "UserSettings", new UserSettings()));
	});

	describe("setMarkerIcons method", function() {
		it("stores the marker icons in the provided state service",
			verifyStateServiceCalledOnSetProperty.bind(this, "MarkerIcons", "MarkerIcons", MARKER_ICONS));

		it("fires markerIconsSet event when marker icons are set", function(done) {
			verifyEventFiredWhenPropertySet("MarkerIcons", MARKER_ICONS, "markerIconsSet", done);
		});
	});

	describe("setMarkerColors method", function() {
		it("stores the marker colors in the provided state service",
			verifyStateServiceCalledOnSetProperty.bind(this, "MarkerColors", "MarkerColors", MARKER_COLORS));

		it("fires markerColorsSet event when marker colors are set", function(done) {
			verifyEventFiredWhenPropertySet("MarkerColors", MARKER_COLORS, "markerColorsSet", done);
		});
	});

	describe("setInitialExtent method", function() {

		it("passes extent to setExtent method", function() {
			var ss = createSiteService();

			spyOn(ss, "setExtent");
			ss.setInitialExtent(EXTENT1);

			var funcCalls = ss.setExtent.calls;
			expect(funcCalls.count()).toBe(1);

			var callArgs = funcCalls.mostRecent().args;
			expect(callArgs[0]).toBe(EXTENT1);
		});

		it("provides reasonable default to setExtent if no extent provided", function() {
			var ss = createSiteService();

			spyOn(ss, "setExtent");
			ss.setInitialExtent();

			var funcCalls = ss.setExtent.calls;
			expect(funcCalls.count()).toBe(1);

			var callArgs = funcCalls.mostRecent().args;
			expect(callArgs[0]).toEqual(jasmine.any(MapExtent));
			expect(callArgs[0].min).toEqual(jasmine.any(Location));
			expect(callArgs[0].max).toEqual(jasmine.any(Location));
		});

		it("does not call setExtent if an extent is already set", function() {
			var state = new StateService(),
				ss = createSiteServiceWithStateService(state);

			ss.setInitialExtent(EXTENT1);
			spyOn(ss, "setExtent");
			ss.setInitialExtent(EXTENT2);

			var funcCalls = ss.setExtent.calls;
			expect(funcCalls.count()).toBe(0);

			expect(state.getExtent()).toBe(EXTENT1);
		});

	});

	describe("setExtent method", function() {
		it("stores the extent in the provided state service",
			verifyStateServiceCalledOnSetProperty.bind(this, "Extent", "Extent", EXTENT1));

		it("calls setExtent on the ExtentUpdater when extent is set", function() {
			var eu = createExtentUpdater(),
				ss = createSiteServiceWithExtentUpdater(eu);

			spyOn(eu, "setExtent");
			ss.setExtent(EXTENT1);

			var funcCalls = eu.setExtent.calls;
			expect(funcCalls.count()).toBe(1);
			expect(funcCalls.mostRecent().args[0]).toBe(EXTENT1);
		});

		it("fires extentChanged event when extent is set", function(done) {
			verifyEventFiredWhenPropertySet("Extent", EXTENT1, "extentChanged", done);
		});
	});

	describe("marker method(s)", function() {

		it("can add and retrieve markers",
			verifyCanAddAndGetItems.bind(this, "Marker", [MARKER1, MARKER2]));

		it("fires markerAdded event when marker is added", function(done) {
			verifyEventFiredWhenItemAdded("Marker", MARKER1, "markerAdded", done);
		});

		it("can explicitly set markers list",
			verifyCanSetItemList.bind(this, "Marker", [MARKER1, MARKER2]));

		it("fires markersCleared event when markers list is set", function(done) {
			verifyEventFiredWhenItemListSet("Marker", [MARKER1, MARKER2], "markersCleared", done);
		});

		it("fires markerAdded event for each marker when markers list is set", function(done) {
			verifyEventFiredForEachItemWhenItemListSet("Marker", [MARKER1, MARKER2], "markerAdded", done);
		});

		it("can remove a marker",
			verifyCanRemoveItems.bind(this, "Marker", [MARKER1, MARKER2, MARKER3], MARKER2));

		it("fires markerRemoved event when marker is removed", function(done) {
			verifyEventFiredWhenItemRemoved("Marker", MARKER3, "markerRemoved", done);
		});

		it("does not fire markerRemoved event if removed marker was not present", function() {
			verifyEventNotFiredWhenRemovedItemNotPresent("Marker", MARKER2, "markerRemoved");
		});

		it("sends mapEvent-removeMarker message when marker is removed", function() {
			var cs = new CommsService(),
				ss = createSiteServiceWithCommsService(cs);

			ss.addMarker(MARKER1);
			spyOn(cs, "sendMessage");
			ss.removeMarker(MARKER1.id);

			var funcCalls = cs.sendMessage.calls;
			expect(funcCalls.count()).toBe(1);

			var call = funcCalls.mostRecent();
			expect(call.args[0]).toBe("mapEvent");

			var mapEvent = call.args[1];
			expect(mapEvent).toEqual(jasmine.any(MapEvent));
			expect(mapEvent.type).toBe("removeMarker");
			expect(mapEvent.data).toBe(MARKER1.id);
		});

		it("does not send comms message when removed marker was not present", function() {
			var cs = new CommsService(),
				ss = createSiteServiceWithCommsService(cs);

			spyOn(cs, "sendMessage");
			ss.removeMarker(MARKER1);

			var funcCalls = cs.sendMessage.calls;
			expect(funcCalls.count()).toBe(0);
		});

		(function() {

			var oldMarker = new PointMarker(7, LOCATION1),
				updatedMarker = new PointMarker(7, LOCATION1);
			oldMarker.name = "Orlando";
			updatedMarker.name = "Detroit";

			it("can update an existing marker's name", function() {
				verifyPropertyIsUpdated("Marker", PointMarker, oldMarker, updatedMarker, "name", "Detroit");
			});

			it("sends mapEvent-updateMarker message when marker is updated", function() {
				var cs = new CommsService(),
					ss = createSiteServiceWithCommsService(cs);

				ss.setMarkers([cloneItem(oldMarker, Marker)]);

				spyOn(cs, "sendMessage");
				ss.updateMarker(updatedMarker);

				var funcCalls = cs.sendMessage.calls;
				expect(funcCalls.count()).toBe(1);

				var call = funcCalls.mostRecent();
				expect(call.args[0]).toBe("mapEvent");

				var mapEvent = call.args[1];
				expect(mapEvent).toEqual(jasmine.any(MapEvent));
				expect(mapEvent.type).toBe("updateMarker");
				expect(mapEvent.data.id).toBe(updatedMarker.id);
				expect(mapEvent.data.name).toBe(updatedMarker.name);
			});

			it("does not send comms message when update was made remotely", function() {
				var cs = new CommsService(),
					ss = createSiteServiceWithCommsService(cs);

				ss.setMarkers([cloneItem(oldMarker, Marker)]);

				spyOn(cs, "sendMessage");
				ss.updateMarkerFromRemoteChange(updatedMarker);

				var funcCalls = cs.sendMessage.calls;
				expect(funcCalls.count()).toBe(0);
			});

		}());

		it("does not send comms message when updated marker was not present", function() {
			var cs = new CommsService(),
				ss = createSiteServiceWithCommsService(cs);

			spyOn(cs, "sendMessage");
			ss.updateMarker(MARKER2);

			var funcCalls = cs.sendMessage.calls;
			expect(funcCalls.count()).toBe(0);
		});

	});

	it("can share singleton instance", function() {
		var ss = createSiteService();
		ss.setAsSingletonInstance();

		expect(SiteService.instance).toBe(ss);
	});

});
