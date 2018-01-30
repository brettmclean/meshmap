meshmap.namespace("meshmap.tracking");

meshmap.tracking.TrackingService = (function() {

	// imports
	var TrackingProviderBase = meshmap.tracking.TrackingProviderBase;

	var TrackingService = function(trackingProvider) {
		validateTrackingProvider(trackingProvider);
		this._trackingProvider = trackingProvider;
	};

	var validateTrackingProvider = function(trackingProvider) {
		var isUndefined = typeof trackingProvider === "undefined";
		var isNotTrackingProvider = !(trackingProvider instanceof TrackingProviderBase);

		if(isUndefined || isNotTrackingProvider) {
			throw new TypeError("Must provide a tracking provider");
		}
	};

	TrackingService.prototype.injectTracking = function(domElement) {
		this._trackingProvider.injectTracking(domElement);
	};

	return TrackingService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.tracking.TrackingService;
}
