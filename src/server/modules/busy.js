// A wrapper for toobusy which allows us to control when we start the toobusy module.

var logger = require("./logger");

var toobusy = null;

var STARTUP_DELAY = 5000; // ms
var TOO_BUSY_REPORT_INTERVAL = 60000; // ms

var tooBusyDelayTimer = null; // Delay startup by several seconds; seems to avoid false toobusy flags
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

	tooBusyDelayTimer = setTimeout(function() {
		tooBusyDelayTimer = null;
		toobusy = require("toobusy-js");
		
		if(!tooBusyReportTimer) {
			tooBusyReportTimer = setInterval(reportTooBusyEvents, TOO_BUSY_REPORT_INTERVAL);
		}
		
		loadConfig(config);
	}, STARTUP_DELAY);
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
	if(tooBusyDelayTimer) {
		clearTimeout(tooBusyDelayTimer);
		tooBusyDelayTimer = null;
	}
}

function started() {
	"use strict";
	
	return !!toobusy;
}

function lag() {
	"use strict";
	
	if(toobusy) {
		return toobusy.lag();
	} else {
		return -1;
	}
}

function maxLag(/* Number */ lag) {
	"use strict";
	
	if(toobusy) {
		toobusy.maxLag(lag);
	}
}

function reportTooBusyEvents() {
	"use strict";

	if(tooBusyCount > 0) {
		logger.warn("In the last " + Math.round(TOO_BUSY_REPORT_INTERVAL / 1000) +
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
module.exports.lag = lag;
module.exports.maxLag = maxLag;
