// A wrapper for toobusy which allows us to control when we start the toobusy module.

var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");

var loggingService = loggingServiceFactory.create();

var toobusy = null;

var TOO_BUSY_REPORT_INTERVAL = 60000; // ms

var tooBusyReportTimer = null;
var tooBusyCount = 0;

function isTooBusy() {
	"use strict";

	if(toobusy) {
		var tb = toobusy();
		if(tb) {
			tooBusyCount++;
		}
		return tb;
	} else {
		return false;
	}
}

function init(config) {
	"use strict";

	toobusy = require("toobusy-js");

	if(!tooBusyReportTimer) {
		tooBusyReportTimer = setInterval(reportTooBusyEvents, TOO_BUSY_REPORT_INTERVAL);
	}

	loadConfig(config);
}

function loadConfig(config) {
	"use strict";

	if(toobusy) {
		// Set maximum allowable event loop lag (in ms) before we start rejecting requests
		toobusy.maxLag(config.limits.allowedEventLoopLagMs);
	}
}

function shutdown() {
	"use strict";

	if(toobusy) {
		toobusy.shutdown();
		toobusy = null;
	}
	if(tooBusyReportTimer) {
		clearInterval(tooBusyReportTimer);
		tooBusyReportTimer = null;
	}
}

function started() {
	"use strict";

	return !!toobusy;
}

function reportTooBusyEvents() {
	"use strict";

	if(tooBusyCount > 0) {
		loggingService.warn("In the last " + Math.round(TOO_BUSY_REPORT_INTERVAL / 1000) +
			" seconds, the server was forced to reject " + tooBusyCount +
			" requests/connections because it was too busy.");
	}
	tooBusyCount = 0;
}

module.exports = isTooBusy;

module.exports.init = init;
module.exports.loadConfig = loadConfig;
module.exports.shutdown = shutdown;
module.exports.started = started;
