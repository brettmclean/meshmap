require("../testUtils/init");
var loader = require("../testUtils/loader");

var ExtentUpdater = loader.load("map/ExtentUpdater"),
	dm = loader.load("model/datamodel"),
	MapExtent = dm.MapExtent,
	Location = dm.Location,
	ExtentUpdateStrategy = loader.load("map/ExtentUpdateStrategy"),
	CommsService = loader.load("utils/comms/CommsService");

var verifyMethodExists = function(methodName) {
	var eu = createExtentUpdater();
	expect(typeof eu[methodName]).toBe("function");
};

var createExtentUpdater = function(strategy, commsService) {
	strategy = strategy || createStrategy();
	commsService = commsService || createCommsService();
	return new ExtentUpdater(strategy, commsService);
};

var createStrategy = function() {
	return new ExtentUpdateStrategy();
};

var createCommsService = function() {
	return new CommsService({});
};

var createMapExtent = function() {
	return new MapExtent(
		new Location(0,0),
		new Location(1,1)
	);
};

var createDifferentMapExtent = function() {
	return new MapExtent(
		new Location(2,2),
		new Location(3,3)
	);
};

var verifyExtentPushed = function(commsService, pushedExtent, expectedCallCount) {
	var funcCalls = commsService.sendMessage.calls;
	expect(funcCalls.count()).toBe(expectedCallCount);

	var call = funcCalls.mostRecent();
	var messageType = call.args[0];
	expect(messageType).toBe("mapEvent");

	var mapEvent = call.args[1];
	expect(mapEvent.type).toBe("changeExtent");
	expect(mapEvent.data).toBe(pushedExtent);
};

describe("An Extent Updater", function() {

	it("does not throw an error when provided with a valid ExtentUpdateStrategy and CommsService", function() {
		expect(function() {
			// jshint unused: false
			var eu = new ExtentUpdater(createStrategy(), createCommsService());
		}).not.toThrow();
	});

	it("has a watchExtentChanges method", verifyMethodExists.bind(this, "watchExtentChanges"));

	it("has an setExtent method", verifyMethodExists.bind(this, "setExtent"));

	it("throws a TypeError when setExtent is not given a MapExtent", function() {
		var eu = createExtentUpdater();
		expect(function() {
			eu.setExtent({});
		}).toThrowError(TypeError);
	});

	it("does not throw an error when setExtent is given a MapExtent", function() {
		var eu = createExtentUpdater();
		expect(function() {
			eu.setExtent(createMapExtent());
		}).not.toThrow();
	});

	it("throws a TypeError if push is called without providing a CommsService dependency", function() {
		var eu = new ExtentUpdater(createStrategy(), null);

		eu.setExtent(createMapExtent());
		expect(function() {
			eu.push();
		}).toThrowError(TypeError);
	});

	it("has a push method", verifyMethodExists.bind(this, "push"));

	it("will push the extent after it has been set", function() {
		var cs = createCommsService();
		var eu = createExtentUpdater(null, cs);
		var extent = createMapExtent();

		spyOn(cs, "sendMessage");
		eu.setExtent(extent);
		eu.push();

		verifyExtentPushed(cs, extent, 1);
	});

	it("will not push an extent if one has not been set", function() {
		var cs = createCommsService();
		var eu = createExtentUpdater(null, cs);

		spyOn(cs, "sendMessage");
		eu.push();

		var funcCalls = cs.sendMessage.calls;
		expect(funcCalls.count()).toBe(0);
	});

	it("will not push the same extent twice", function() {
		var cs = createCommsService();
		var eu = createExtentUpdater(null, cs);
		var extent = createMapExtent();

		spyOn(cs, "sendMessage");
		var funcCalls = cs.sendMessage.calls;

		eu.setExtent(extent);
		eu.push();
		expect(funcCalls.count()).toBe(1);

		eu.push();
		expect(funcCalls.count()).toBe(1);
	});

	it("will push different extents", function() {
		var cs = createCommsService();
		var eu = createExtentUpdater(null, cs);
		var extent = createMapExtent();
		var extent2 = createDifferentMapExtent();

		spyOn(cs, "sendMessage");

		eu.setExtent(extent);
		eu.push();
		verifyExtentPushed(cs, extent, 1);

		eu.setExtent(extent2);
		eu.push();
		verifyExtentPushed(cs, extent2, 2);
	});

	it("can share singleton instance", function() {
		var eu = createExtentUpdater();
		eu.setAsSingletonInstance();

		expect(ExtentUpdater.instance).toBe(eu);
	});

});
