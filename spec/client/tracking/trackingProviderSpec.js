require("../testUtils/init");
var loader = require("../testUtils/loader");

var TrackingProviderBase = loader.load("tracking/TrackingProviderBase"),
	ValueError = loader.load("errors/ValueError");

var verifyMethodExists = function(methodName) {
	var tp = new TrackingProviderBase();
	expect(typeof tp[methodName]).toBe("function");
};

describe("A Tracking Provider", function() {

	it("throws a TypeError if provided a non-String in constructor", function() {
		expect(function() {
			// jshint unused: false
			var tp = new TrackingProviderBase(123);
		}).toThrowError(TypeError);
	});

	it("throws a ValueError if provided an empty String in constructor", function() {
		expect(function() {
			// jshint unused: false
			var tp = new TrackingProviderBase("");
		}).toThrowError(ValueError);
	});

	it("does not throw an error if provided with a non-empty String in constructor", function() {
		expect(function() {
			// jshint unused: false
			var tp = new TrackingProviderBase("abcdef");
		}).not.toThrow();
	});

	it("has a getTrackingName method", verifyMethodExists.bind(this, "getTrackingName"));

	it("has an injectTracking method", verifyMethodExists.bind(this, "injectTracking"));

	it("returns a String from its getTrackingName method", function() {
		var tp = new TrackingProviderBase();
		expect(typeof tp.getTrackingName()).toBe("string");
	});
});
