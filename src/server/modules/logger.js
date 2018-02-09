var consoleLogProviderFactory = require("./logging/consoleLogProviderFactory");
var fileLogProviderFactory = require("./logging/fileLogProviderFactory");
var LogBufferService = require("./logging/LogBufferService");
var LogEntry = require("./logging/LogEntry");

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

		if(logToConsole) {
			logOutputToConsole(new LogEntry(level, message));
		}

		if(fileLogProvider || !initialized) {
			logBufferService.queueEntry(level, message);
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
			logEntries.forEach(function(logEntry) {
				logOutputToFile(logEntry);
			});
		}
	}
}

function logOutputToFile(logEntry) {
	logOutputToProvider(fileLogProvider, logEntry);
}

function logOutputToConsole(logEntry) {
	logOutputToProvider(consoleLogProvider, logEntry);
}

function logOutputToProvider(logProvider, logEntry) {
	switch(logEntry.level) {
		case "error":
			logProvider.error(logEntry);
			break;
		case "warn":
			logProvider.warn(logEntry);
			break;
		case "info":
			logProvider.info(logEntry);
			break;
		case "debug":
			logProvider.debug(logEntry);
			break;
		case "trace":
			logProvider.trace(logEntry);
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
