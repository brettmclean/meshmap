var toobusy = require("toobusy-js");
var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");

var loggingService = loggingServiceFactory.create();

var TOO_BUSY_REPORT_INTERVAL = 60000; // ms

var tooBusyReportTimer = null;
var tooBusyCount = 0;

function isTooBusy() {
	"use strict";

	var tb = toobusy();
	if(tb) {
		tooBusyCount++;
	}
	return tb;
}

function init(config) {
	"use strict";

	if(!tooBusyReportTimer) {
		tooBusyReportTimer = setInterval(reportTooBusyEvents, TOO_BUSY_REPORT_INTERVAL);
	}

	loadConfig(config);
}

function loadConfig(config) {
	"use strict";

	// Set maximum allowable event loop lag (in ms) before we start rejecting requests
	toobusy.maxLag(config.limits.allowedEventLoopLagMs);
}

function shutdown() {
	"use strict";

	toobusy.shutdown();

	if(tooBusyReportTimer) {
		clearInterval(tooBusyReportTimer);
		tooBusyReportTimer = null;
	}
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
