meshmap.namespace("meshmap.utils.logging");

/* istanbul ignore next */
meshmap.utils.logging.ConsoleLogProvider = (function() {

	// imports
	var LogProviderBase = meshmap.utils.logging.LogProviderBase;

	var baseClass = LogProviderBase;
	var baseProto = baseClass.prototype;
	var ConsoleLogProvider = function() {

	};
	ConsoleLogProvider.prototype = Object.create(baseProto);
	ConsoleLogProvider.prototype.constructor = ConsoleLogProvider;

	var hasConsole = !!console;

	ConsoleLogProvider.prototype.error = function(message) {
		if(hasConsole) {
			console.error(message);
		}
	};
	ConsoleLogProvider.prototype.warn = function(message) {
		if(hasConsole) {
			console.warn(message);
		}
	};
	ConsoleLogProvider.prototype.info = function(message) {
		if(hasConsole) {
			console.info(message);
		}
	};
	ConsoleLogProvider.prototype.debug = function(message) {
		if(hasConsole) {
			console.debug(message);
		}
	};
	ConsoleLogProvider.prototype.trace = function(message) {
		this.debug(message);
	};

	return ConsoleLogProvider;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.logging.ConsoleLogProvider;
}
