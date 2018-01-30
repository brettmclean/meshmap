meshmap.namespace("meshmap.tracking");

meshmap.tracking.trackingProviderFactory = (function() {

	// imports
	var GoogleAnalyticsTrackingProvider = meshmap.tracking.GoogleAnalyticsTrackingProvider,
		ValueError = meshmap.errors.ValueError;

	var GOOGLE_ANALYTICS = "googleAnalytics";

	var create = function(trackingType, trackingId) {
		var trackingProvider = null;

		switch(trackingType) {
			case GOOGLE_ANALYTICS:
				trackingProvider = new GoogleAnalyticsTrackingProvider(trackingId);
				break;
			default:
				throw new ValueError("Invalid tracking type: " + trackingType);
		}

		return trackingProvider;
	};

	return {
		create: create
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.tracking.trackingProviderFactory;
}
