meshmap.namespace("meshmap.utils.logging");

meshmap.utils.logging.loggerFactory = (function() {

	// imports
	var Logger = meshmap.utils.logging.Logger,
		ConsoleLogProvider = meshmap.utils.logging.ConsoleLogProvider;

	var create = function() {
		return new Logger(Logger.levels.TRACE, new ConsoleLogProvider());
	};

	return {
		create: create
	};

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.logging.loggerFactory;
}
