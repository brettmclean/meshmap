var os = require("os");
var consoleLogProviderFactory = require("./logging/consoleLogProviderFactory");
var fileLogProviderFactory = require("./logging/fileLogProviderFactory");
var LogBufferService = require("./logging/LogBufferService");
var TimestampFormatService = require("./logging/TimestampFormatService");

var LOG_LEVELS = {
	"error": 100,
	"warn": 200,
	"info": 300,
	"debug": 400,
	"trace": 500
};

var initialized = false;

var currentLogLevel = "info";
var logToConsole = true;

var consoleLogProvider = consoleLogProviderFactory.create();
var fileLogProvider = null;
var logBufferService = new LogBufferService();
var timestampFormatService = new TimestampFormatService();

function init(config) {
	"use strict";

	loadConfig(config);
	initialized = true;
}

function loadConfig(config) {
	"use strict";

	var loggingCfg = config.logging;

	if(loggingCfg) {
		if(loggingCfg.level && LOG_LEVELS[loggingCfg.level]) {
			currentLogLevel = loggingCfg.level;
		}

		logToConsole = loggingCfg.logToConsole;

		fileLogProvider = fileLogProviderFactory.create(loggingCfg.directory);
		fileLogProvider.init();
	}
}

function shutdown() {
	"use strict";

	// Flush the last bit to log file
	if(fileLogProvider && initialized && logBufferService.hasEntries()) {
		flushBufferToFile();
	}

	initialized = false;
}

function error(/* String */ message) {
	"use strict";
	log("error", message);
}

function warn(/* String */ message) {
	"use strict";
	log("warn", message);
}

function info(/* String */ message) {
	"use strict";
	log("info", message);
}

function debug(/* String */ message) {
	"use strict";
	log("debug", message);
}

function trace(/* String */ message) {
	"use strict";
	log("trace", message);
}

function log(level, message) {
	"use strict";
	if(LOG_LEVELS[level] && LOG_LEVELS[level] <= LOG_LEVELS[currentLogLevel]) {

		if(typeof message !== "string") {
			message = JSON.stringify(message);
		}

		var output = "[" + getTimestamp() + "] " + level.toUpperCase() + ": " + message;

		if(logToConsole) {
			logOutputToConsole(level, output);
		}

		if(fileLogProvider || !initialized) {
			logBufferService.queueEntry(level, output);
		}

		if(fileLogProvider) {
			flushBufferToFile();
		}
	}
}

function flushBufferToFile() {
	"use strict";

	if(logBufferService.hasEntries()) {
		if(fileLogProvider) {

			var logEntries = logBufferService.dequeueAndClearEntries();
			logEntries.forEach(function(entry) {
				var logLine = entry.message + os.EOL;
				logOutputToFile(entry.level, logLine);
			});
		}
	}
}

function getTimestamp() {
	"use strict";

	var now = new Date();
	return timestampFormatService.formatAsIso8601UtcTimestamp(now);
}

function logOutputToFile(level, output) {
	switch(level) {
		case "error":
			fileLogProvider.error(output);
			break;
		case "warn":
			fileLogProvider.warn(output);
			break;
		case "info":
			fileLogProvider.info(output);
			break;
		case "debug":
			fileLogProvider.debug(output);
			break;
		case "trace":
			fileLogProvider.trace(output);
			break;
	}
}

function logOutputToConsole(level, output) {
	switch(level) {
		case "error":
			consoleLogProvider.error(output);
			break;
		case "warn":
			consoleLogProvider.warn(output);
			break;
		case "info":
			consoleLogProvider.info(output);
			break;
		case "debug":
			consoleLogProvider.debug(output);
			break;
		case "trace":
			consoleLogProvider.trace(output);
			break;
	}
}

exports.init = init;
exports.shutdown = shutdown;
exports.loadConfig = loadConfig;
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.debug = debug;
exports.trace = trace;
