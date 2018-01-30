require("../testUtils/init");
var loader = require("../testUtils/loader");

var GoogleAnalyticsTrackingProvider = loader.load("tracking/GoogleAnalyticsTrackingProvider"),
	ValueError = loader.load("errors/ValueError"),
	trackingProviderFactory = loader.load("tracking/trackingProviderFactory");

describe("A Tracking Provider Factory", function() {

	it("throws a ValueError when given an invalid tracking type", function() {
		expect(function() {
			trackingProviderFactory.create("invalidTrackingType");
		}).toThrowError(ValueError);
	});

	it("returns a GoogleAnalyticsTrackingProvider when appropriate", function() {
		var tp = trackingProviderFactory.create("googleAnalytics");
		expect(tp instanceof GoogleAnalyticsTrackingProvider).toBe(true);
	});

});
