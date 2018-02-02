var path = require("path");
var fs = require("fs");
var os = require("os");
var consoleLogProviderFactory = require("./logging/consoleLogProviderFactory");
var FileWriteService = require("./utils/FileWriteService");
var LogBufferService = require("./logging/LogBufferService");

var LOG_LEVELS = {
	"error": 100,
	"warn": 200,
	"info": 300,
	"debug": 400,
	"trace": 500
};

var initialized = false;

var currentLogLevel = "info";
var logDirectory = null;
var logToConsole = true;

var consoleLogProvider = consoleLogProviderFactory.create();
var fileWriteService = new FileWriteService();
var logBufferService = new LogBufferService();

// Batch writes to log file to ensure we don't have several handles
// to log file open at once.
var writingToLog = false;

function init(config) {
	"use strict";

	loadConfig(config);
	initialized = true;
}

function loadConfig(config) {
	"use strict";

	var appBase = path.resolve(__dirname, "../");
	logDirectory = path.resolve(appBase, "logs");

	var loggingCfg = config.logging;

	if(loggingCfg) {
		if(loggingCfg.level && LOG_LEVELS[loggingCfg.level]) {
			currentLogLevel = loggingCfg.level;
		}

		// loggingCfg.directory can be null (in cases where log
		// files shouldn't be kept at all).
		logDirectory = !loggingCfg.directory ? null : path.resolve(appBase, loggingCfg.directory);
	}

	// Check that config didn't override logDirectory with null
	if(logDirectory) {

		// Create log directory if it doesn't exist
		if(!fs.existsSync(logDirectory)) {
			fs.mkdirSync(logDirectory);
			info("Created log file directory at " + logDirectory);
		} else {
			info("Log files will be stored in " + logDirectory);
		}
	}

	if(loggingCfg) {
		logToConsole = typeof loggingCfg.logToConsole === "boolean" ? loggingCfg.logToConsole : logToConsole;
	}
}

function shutdown() {
	"use strict";

	// Flush the last bit to log file
	if(logDirectory && initialized && logBufferService.hasEntries()) {
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

		if(logDirectory || !initialized) {
			logBufferService.queueEntry(level, output);
		}

		if(!writingToLog && logDirectory) {
			flushBufferToFile();
		}
	}
}

function flushBufferToFile() {
	"use strict";

	if(logBufferService.hasEntries()) {
		var logPath = getLogFilePath();
		if(logPath) {

			var logEntries = logBufferService.dequeueAndClearEntries();
			var logLines = logEntries.map(function(entry) {
				return entry.message + os.EOL;
			}).join("");

			writingToLog = true;
			fileWriteService.appendUtf8StringToFile(logPath, logLines, function(err) {
				writingToLog = false;
				if(err) {
					consoleLogProvider.error("Failed to write to log file: " + JSON.stringify(err));
				} else if(logBufferService.hasEntries()) {
					flushBufferToFile();
				}
			});
		}
	}
}

function getTimestamp() {
	"use strict";

	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	month = month > 9 ? month : "0" + month;
	var dayOfMonth = now.getDate();
	dayOfMonth = dayOfMonth > 9 ? dayOfMonth : "0" + dayOfMonth;
	var hour = now.getHours() > 9 ? now.getHours() : "0" + now.getHours();
	var minutes = now.getMinutes() > 9 ? now.getMinutes() : "0" + now.getMinutes();
	var seconds = now.getSeconds() > 9 ? now.getSeconds() : "0" + now.getSeconds();
	var milliseconds = now.getMilliseconds();
	milliseconds = milliseconds > 99 ? milliseconds :
		(milliseconds > 9 ? "0" + milliseconds : "00" + milliseconds);

	var dateStr = year + "-" + month + "-" + dayOfMonth +
		" " + hour + ":" + minutes + ":" + seconds +
		"." + milliseconds;

	return dateStr;
}

function getLogFilePath() {
	"use strict";

	if(!logDirectory) {
		return null;
	}

	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	month = month > 9 ? month : "0" + month;
	var dayOfMonth = now.getDate();
	dayOfMonth = dayOfMonth > 9 ? dayOfMonth : "0" + dayOfMonth;
	var filename = year + "-" + month + "-" + dayOfMonth + ".log";
	return path.join(logDirectory, filename);
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
