require("../testUtils/init");
var loader = require("../testUtils/loader");

var TrackingProviderBase = loader.load("tracking/TrackingProviderBase"),
	TrackingService = loader.load("tracking/TrackingService");

describe("A Tracking Service", function() {

	it("throws a TypeError if not provided any constructor arguments", function() {
		expect(function() {
			// jshint unused: false
			var ts = new TrackingService();
		}).toThrowError(TypeError);
	});

	it("throws a TypeError if provided a non-TrackingProviderBase in constructor", function() {
		expect(function() {
			// jshint unused: false
			var ts = new TrackingService(123);
		}).toThrowError(TypeError);
	});

	it("calls its tracking provider's injectTracking method with provided object", function() {
		var obj = {
			name: "value"
		};
		var tp = new TrackingProviderBase();
		var ts = new TrackingService(tp);

		spyOn(tp, "injectTracking");
		ts.injectTracking(obj);

		var funcCalls = tp.injectTracking.calls;
		expect(funcCalls.count()).toBe(1);

		var firstCall = funcCalls.first();
		var firstArg = firstCall.args[0];
		expect(firstArg).toBe(obj);
	});

});
