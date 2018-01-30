meshmap.namespace("meshmap.utils.logging");

meshmap.utils.logging.Logger = (function() {

	// imports
	var LogProviderBase = meshmap.utils.logging.LogProviderBase,
		ConsoleLogProvider = meshmap.utils.logging.ConsoleLogProvider,
		ValueError = meshmap.errors.ValueError,
		dateTimeFormatter = meshmap.utils.dateTimeFormatter;

	var Logger = function(logProvider, logLevel) {
		var logProviderIsString = typeof logProvider === "string";
		logLevel = logProviderIsString ? logProvider : logLevel;
		logProvider = logProviderIsString ? null : logProvider;

		validateLogProvider(logProvider);
		validateLogLevel(logLevel);

		this._logProvider = logProvider || new ConsoleLogProvider();
		this.setLogLevel(logLevel || Logger.levels.TRACE);
	};

	var validateLogProvider = function(provider) {
		if(provider && !(provider instanceof LogProviderBase)) {
			throw new TypeError("Supplied log provider must be of type LogProviderBase");
		}
	};

	var validateLogLevel = function(logLevel) {
		if(logLevel) {
			for(var prop in Logger.levels) {
				if(Logger.levels.hasOwnProperty(prop) && Logger.levels[prop] === logLevel) {
					return;
				}
			}
			throw new ValueError(logLevel + " is not a valid log level");
		}
	};

	Logger.instance = null;

	Logger.levels = {
		ERROR: "error",
		WARN: "warn",
		INFO: "info",
		DEBUG: "debug",
		TRACE: "trace"
	};

	var LOG_LEVELS = {};
	LOG_LEVELS[Logger.levels.ERROR] = 100;
	LOG_LEVELS[Logger.levels.WARN] = 200;
	LOG_LEVELS[Logger.levels.INFO] = 300;
	LOG_LEVELS[Logger.levels.DEBUG] = 400;
	LOG_LEVELS[Logger.levels.TRACE] = 500;

	Logger.prototype.setLogLevel = function(logLevel) {
		validateLogLevel(logLevel);
		this._logLevel = logLevel;
	};

	Logger.prototype.error = function(message) {
		this._logToLogProvider("error", Logger.levels.ERROR, message);
	};

	Logger.prototype.warn = function(message) {
		this._logToLogProvider("warn", Logger.levels.WARN, message);
	};

	Logger.prototype.info = function(message) {
		this._logToLogProvider("info", Logger.levels.INFO, message);
	};

	Logger.prototype.debug = function(message) {
		this._logToLogProvider("debug", Logger.levels.DEBUG, message);
	};

	Logger.prototype.trace = function(message) {
		this._logToLogProvider("trace", Logger.levels.TRACE, message);
	};

	Logger.prototype._logToLogProvider = function(methodName, logLevel, message) {
		if(this._shouldLog(logLevel)) {
			message = formatMessage(message);
			this._logProvider[methodName](message);
		}
	};

	Logger.prototype._shouldLog = function(level) {
		return LOG_LEVELS.hasOwnProperty(level) && LOG_LEVELS[level] <= LOG_LEVELS[this._logLevel];
	};

	Logger.prototype.setAsSingletonInstance = function() {
		Logger.instance = this;
	};

	var formatMessage = function(message) {
		var timestamp = dateTimeFormatter.formatDateAndTime();
		return "[" + timestamp + "] " + message;
	};

	return Logger;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.logging.Logger;
}
