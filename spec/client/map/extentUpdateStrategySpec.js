require("../testUtils/init");
var loader = require("../testUtils/loader");

var ExtentUpdateStrategy = loader.load("map/ExtentUpdateStrategy"),
	dm = loader.load("model/datamodel"),
	MapExtent = dm.MapExtent,
	Location = dm.Location;

var createStrategy = function() {
	return new ExtentUpdateStrategy();
};

var verifyMethodExists = function(methodName) {
	var eus = createStrategy();
	expect(typeof eus[methodName]).toBe("function");
};

var createExtent = function() {
	return new MapExtent(
		new Location(0, 0),
		new Location(1, 1)
	);
};

var createSlightlyDifferentExtent = function() {
	return new MapExtent(
		new Location(0.1, 0.1),
		new Location(1.1, 1.1)
	);
};

var createSignificantlyDifferentExtent = function() {
	return new MapExtent(
		new Location(1, 1),
		new Location(2, 2)
	);
};

var getLongTimeInMs = function() {
	return 10000;
};

describe("An Extent Update Strategy", function() {

	it("has an extentIsOutdated method", verifyMethodExists.bind(this, "extentIsOutdated"));

	it("should throw a TypeError if extentIsOutdated is given an invalid MapExtent", function() {
		expect(function() {
			createStrategy().extentIsOutdated({}, null);
		}).toThrowError(TypeError);

		expect(function() {
			createStrategy().extentIsOutdated(null, {});
		}).toThrowError(TypeError);
	});

	it("should throw a TypeError if extentIsOutdated is given a non-Number as number of milliseconds", function() {
		expect(function() {
			createStrategy().extentIsOutdated(null, null, "Not a number");
		}).toThrowError(TypeError);
	});

	it("should throw a RangeError if extentIsOutdated is given a negative number of milliseconds", function() {
		expect(function() {
			createStrategy().extentIsOutdated(null, null, -5);
		}).toThrowError(RangeError);
	});

	it("should not throw an error if extentIsOutdated is given zero milliseconds", function() {
		expect(function() {
			createStrategy().extentIsOutdated(null, null, 0);
		}).not.toThrow();
	});

	it("should not consider a null extent to be outdated", function() {
		var eus = createStrategy();
		expect(eus.extentIsOutdated(null, null)).toBe(false);
	});

	it("should always consider the first extent to be outdated", function() {
		var extent = createExtent();
		var eus = createStrategy();
		expect(eus.extentIsOutdated(null, extent)).toBe(true);
	});

	it("should not consider a slightly different extent to be outdated", function() {
		var extent = createExtent();
		var slightlyDifferentExtent = createSlightlyDifferentExtent();
		var eus = createStrategy();

		expect(eus.extentIsOutdated(extent, slightlyDifferentExtent)).toBe(false);
	});

	it("should consider a significantly different extent to be outdated", function() {
		var extent = createExtent();
		var significantlyDifferentExtent = createSignificantlyDifferentExtent();
		var eus = createStrategy();

		expect(eus.extentIsOutdated(extent, significantlyDifferentExtent)).toBe(true);
	});

	it("should consider a slightly different extent to be outdated when a long time has elapsed since last update", function() {
		var extent = createExtent();
		var slightlyDifferentExtent = createSlightlyDifferentExtent();
		var longTime = getLongTimeInMs();
		var eus = createStrategy();

		expect(eus.extentIsOutdated(extent, slightlyDifferentExtent, longTime)).toBe(true);
	});

});
