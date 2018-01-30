meshmap.namespace("meshmap.utils.logging");

meshmap.utils.logging.LogProviderBase = (function() {

	var LogProviderBase = function() {

	};

	LogProviderBase.prototype.error = function() {};
	LogProviderBase.prototype.warn = function() {};
	LogProviderBase.prototype.info = function() {};
	LogProviderBase.prototype.debug = function() {};
	LogProviderBase.prototype.trace = function() {};

	return LogProviderBase;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.logging.LogProviderBase;
}
