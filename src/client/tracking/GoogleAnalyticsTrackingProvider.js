meshmap.namespace("meshmap.tracking");

/* istanbul ignore next */
meshmap.tracking.GoogleAnalyticsTrackingProvider = (function() {

	// imports
	var TrackingProviderBase = meshmap.tracking.TrackingProviderBase;

	var baseClass = TrackingProviderBase;
	var baseProto = baseClass.prototype;
	var GoogleAnalyticsTrackingProvider = function(trackingId) {
		baseClass.call(this, trackingId);
	};
	GoogleAnalyticsTrackingProvider.prototype = Object.create(baseProto);
	GoogleAnalyticsTrackingProvider.prototype.constructor = GoogleAnalyticsTrackingProvider;

	GoogleAnalyticsTrackingProvider.prototype.getTrackingName = function() {
		return "Google Analytics";
	};

	GoogleAnalyticsTrackingProvider.prototype.injectTracking = function(domElement) {
		baseProto.injectTracking.call(this, domElement);

		this._setupGlobalVar();
		domElement.appendChild(createInjectableScriptElement());
	};

	GoogleAnalyticsTrackingProvider.prototype._setupGlobalVar = function() {
		window._gaq = window._gaq || [];
		window._gaq.push(["_setAccount", this._trackingId]);
		window._gaq.push(["_setDomainName", document.location.hostname]);
		window._gaq.push(["_trackPageview"]);
	};

	var createInjectableScriptElement = function() {
		var ga = document.createElement("script");
		ga.type = "text/javascript";
		ga.async = true;
		ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
		return ga;
	};

	return GoogleAnalyticsTrackingProvider;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.tracking.GoogleAnalyticsTrackingProvider;
}
