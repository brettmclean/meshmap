var url = require("url");
var querystring = require("querystring");
var busy = require("./busy");
var logger = require("./logger");
var util = require("./util");
var sm = require("./sitemanager");
var store = require("./store");

var appConfigServiceFactory = require("./config/appConfigServiceFactory");
var appConfigService = appConfigServiceFactory.create();

function handleApiRequest(
	/* http.IncomingMessage */ request,
	/* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var appConfig = appConfigService.getAppConfig();

	var u = url.parse(request.url);
	var path = u.pathname.toLowerCase();
	var qs = querystring.parse(u.query);

	var validKey = false;
	var indent = 0;

	if(qs["key"] && qs["key"] === appConfig.apiKey) {
		validKey = true;
	} else {
		var ipAddress = util.getIpAddressFromHttpRequest(request);
		logger.warn("Incorrect or missing API key sent from " + ipAddress + ".");
	}

	if(qs["pretty"] && qs["pretty"].toLowerCase() === "true") {
		indent = 4;
	}

	if(validKey) {
		getApiResult(path, qs, function(err, result) {
			var resultStr = result ? JSON.stringify(result, null, indent) : null;
			callback(err, resultStr);
		});
	} else {
		var errMsg = "Invalid API endpoint or incorrect/missing API key.";
		var result = {
			error: "Invalid API endpoint or incorrect/missing API key."
		};
		var resultStr = JSON.stringify(result, null, indent);

		callback(errMsg, resultStr);
	}
}

function getApiResult(/* String */ apiPath, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	// /api/sites
	// /api/sites/{siteCode}
	// /api/users
	// /api/users/{userId}
	// /api/status
	// /api/activity?max={maxResults}
	// /api/ban?ip={ipAddress}
	// /api/unban?ip={ipAddress}
	// /api/reloadconfig
	var segments = apiPath.split("/");
	segments.shift(); // Remove first empty string due to leading slash
	segments.shift(); // Remove {apiPath} ("api" by default)

	if(segments.length > 0 && segments[0].length > 0) {
		switch(segments[0]) {
			case "sites":
				if(segments.length > 1 && util.isSiteCode(segments[1].trim())) {
					getSite(segments, queryString, callback);
				} else {
					getSites(segments, queryString, callback);
				}
				break;
			case "users":
				if(segments.length > 1 && /^([0-9]+)$/.test(segments[1].trim())) {
					getUser(segments, queryString, callback);
				} else {
					getUsers(segments, queryString, callback);
				}
				break;
			case "status":
				getStatus(segments, queryString, callback);
				break;
			case "activity":
				getUserActivity(segments, queryString, callback);
				break;
			case "ban":
			case "unban":
				banUnbanUser(segments, queryString, callback);
				break;
			case "reloadconfig":
				reloadConfig(segments, queryString, callback);
				break;
			default:
				var errMsg = "Invalid API endpoint.";
				var result = {
					error: errMsg
				};
				callback(errMsg, result);
				break;
		}
	} else {
		getDirectory(segments, queryString, callback);
	}
}

function getDirectory(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	var result = {
			apiEndpoints: [
				"/",
				"/sites",
				"/sites/{siteCode}",
				"/users",
				"/users/{userId}",
				"/status",
				"/activity?max={maxResults}",
				"/api/ban?ip={ipAddress}",
				"/api/unban?ip={ipAddress}",
				"/api/reloadconfig"
			]
	};

	callback(null, result);
}

function getSites(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	store.apiGetSites(function(err, apiSites) {
		if(err) {
			callback(err, null);
			return;
		}

		var result = {
			sites: apiSites,
			siteCount: apiSites.length
		};
		callback(err, result);
	});
}

function getSite(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	pathSegments.shift(); // Remove "sites"

	var siteCode = pathSegments[0].trim();

	store.apiGetSite(siteCode, function(err, apiSite) {
		if(err) {
			var errorObj = {
				error: "Site '" + siteCode + "' was not found."
			};
			callback(err, errorObj);
			return;
		}
		callback(err, apiSite);
	});
}

function getUsers(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	store.apiGetUsers(function(err, apiUsers) {
		if(err) {
			callback(err, null);
			return;
		}

		var result = {
			users: apiUsers,
			userCount: apiUsers.length
		};
		callback(err, result);
	});
}

function getUser(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	pathSegments.shift(); // Remove "users"

	var userId = parseInt(pathSegments[0].trim());

	store.apiGetUser(userId, function(err, apiUser) {
		if(err) {
			var errorObj = {
				error: "User with ID '" + userId + "' was not found."
			};
			callback(err, errorObj);
			return;
		}
		callback(err, apiUser);
	});
}

function getStatus(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	store.apiGetStatus(function(err, apiStatus) {
		if(err) {
			var errorObj = {
				error: "An error occurred while getting application status."
			};
			callback(err, errorObj);
			return;
		}

		callback(err, apiStatus);
	});
}

function getUserActivity(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	var options = {
		maxRecords: 100
	};

	if(queryString["max"] && !isNaN(queryString["max"])) {
		options.maxRecords = parseInt(queryString["max"]);
	}

	store.apiGetUserActivity(options, function(err, apiUserActivities) {
		if(err) {
			var errorObj = {
				error: "An error occurred while getting user activity."
			};
			callback(err, errorObj);
			return;
		}

		callback(err, apiUserActivities);
	});
}

function banUnbanUser(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	var operation = pathSegments[0];
	var isBanned = operation === "ban" ? true : false;

	var err = null;
	var ipAddress = queryString["ip"];

	if(!ipAddress) {
		var errorObj = {
			error: "An IP address was not provided. Append ip={ipAddress} to query string."
		};
		callback(err, errorObj);
		return;
	}

	store.updateIpAddressBanned(ipAddress, isBanned, function(err) {

		var resultObj = {};

		if(err) {
			resultObj["result"] = "Failed to " + (isBanned ? "ban" : "unban") + " IP address " + ipAddress + ".";
		} else {
			resultObj["result"] = "Successfully " + (isBanned ? "banned" : "unbanned") + " IP address " + ipAddress + ".";
		}

		callback(err, resultObj);
	});
}

function reloadConfig(/* String[] */ pathSegments, /* Object */ queryString, /* Function */ callback) {
	"use strict";

	var err = null;

	logger.info("Reloading config file.");

	var appConfig = appConfigService.reloadAppConfig();
	logger.loadConfig(appConfig);
	sm.loadConfig(appConfig);
	busy.loadConfig(appConfig);

	var resultObj = {
		result: "Successfully parsed config file."
	};

	callback(err, resultObj);
}

exports.handleApiRequest = handleApiRequest;
