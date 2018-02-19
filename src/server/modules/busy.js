var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");
var applicationLoadServiceFactory = require("./appload/applicationLoadServiceFactory");

var loggingService = loggingServiceFactory.create();
var applicationLoadService = applicationLoadServiceFactory.create();

var TOO_BUSY_REPORT_INTERVAL = 60000; // ms

var tooBusyReportTimer = null;
var tooBusyCount = 0;

function isTooBusy() {
	"use strict";

	var tb = applicationLoadService.appIsOverloaded();
	if(tb) {
		tooBusyCount++;
	}
	return tb;
}

function init(config) {
	"use strict";

	applicationLoadService.init(config.limits);

	if(!tooBusyReportTimer) {
		tooBusyReportTimer = setInterval(reportTooBusyEvents, TOO_BUSY_REPORT_INTERVAL);
	}

	loadConfig(config);
}

function loadConfig(config) {
	"use strict";

	applicationLoadService.setConfig(config.limits);
}

function shutdown() {
	"use strict";

	applicationLoadService.shutdown();

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
