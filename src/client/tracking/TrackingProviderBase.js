meshmap.namespace("meshmap.tracking");

meshmap.tracking.TrackingProviderBase = (function() {

	// imports
	var ValueError = meshmap.errors.ValueError;

	var TrackingProviderBase = function(trackingId) {
		validateTrackingId(trackingId);
		this._trackingId = trackingId;
	};

	var validateTrackingId = function(trackingId) {
		if(typeof trackingId === "undefined") {
			return;
		}

		if(typeof trackingId !== "string") {
			throw new TypeError("Provided tracking ID is not a String");
		}

		if(trackingId.length === 0) {
			throw new ValueError("Provided tracking ID is empty");
		}
	};

	TrackingProviderBase.prototype.getTrackingName = function() {
		return "Tracking";
	};

	/* istanbul ignore next */
	TrackingProviderBase.prototype.injectTracking = function(domElement) {
		validateDomElement(domElement);
	};

	/* istanbul ignore next */
	var validateDomElement = function(domElement) {
		if(!(domElement instanceof HTMLElement)) {
			throw new TypeError("Provided element must be an HTMLElement");
		}
	};

	return TrackingProviderBase;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.tracking.TrackingProviderBase;
}
