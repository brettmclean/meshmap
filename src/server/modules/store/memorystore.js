var dm = require("../datamodel");
var apiDm = require("../apidatamodel");
var logger = require("../logger");
var cache = require("./cache");
var util = require("../util");

var siteCache = new cache.Cache();
siteCache.maxCacheTime = 7776000000; // 90 days
siteCache.canRemoveItem = function(/* Site */ site) {
	"use strict";
	return !site || !site.clients || site.clients.length <= 0;
};

/*
 * ipAddress -> true
 */
var bannedIpAddresses = {};

/*
 * id ->
 * {
 *	user: User
 *	sites: { siteCode: String, extent: MapExtent },
 *	connects: { connectDate: Date, ipAddress: String }[]
 * }
 */
var users = {};

/*
 * {
 *	date: Date,
 *	type: Number,
 *	userId: Number,
 *	siteCode: String,
 *	markerId: Number
 * }[]
 */
var userActivity = [];

var nextSiteId = 1;
var nextMarkerId = 1;
var nextUserId = 1;

var markerIcons = {
	1: "http://maps.google.com/mapfiles/marker.png",
	2: "http://maps.google.com/mapfiles/marker_black.png",
	3: "http://maps.google.com/mapfiles/marker_grey.png",
	4: "http://maps.google.com/mapfiles/marker_orange.png",
	5: "http://maps.google.com/mapfiles/marker_white.png",
	6: "http://maps.google.com/mapfiles/marker_yellow.png",
	7: "http://maps.google.com/mapfiles/marker_purple.png",
	8: "http://maps.google.com/mapfiles/marker_green.png"
};

var markerColors = {
	1: "#FF0000",
	2: "#00FF00",
	3: "#0000FF",
	4: "#FFFF00",
	5: "#FF00FF",
	6: "#00FFFF",
	7: "#800000",
	8: "#008000",
	9: "#000080",
	10: "#808000",
	11: "#800080",
	12: "#008080",
	13: "#FFFFFF",
	14: "#CCCCCC",
	15: "#999999",
	16: "#666666",
	17: "#333333",
	18: "#000000"
};

var createUserEntry = function(/* User */ user)
{
	"use strict";
	return {
		user: user,
		sites: {},
		connects: []
	};
};

function init(config) {
	"use strict";

	logger.warn("IMPORTANT! Using the in-memory data store. All data will be lost the next time this application is stopped. The in-memory data store should only be used for testing purposes.");

	loadConfig(config);
}

function shutdown() {

}

function loadConfig(config) {
	// jshint unused: false
	"use strict";
}

function getSite(/* String */ siteCode, /* Object */ options, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!siteCode) {
		callback(null, null);
	}

	if(!options) {
		options = {};
	}
	if(typeof options.updateSiteAccessDate === "undefined") {
		options.updateSiteAccessDate = true;
	}

	var site = siteCache.get(siteCode);

	if(site && options.updateSiteAccessDate) {
		site.lastAccessDate = new Date();
	}

	callback(null, site);
}

function getUser(/* String */ secret, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var user = null;
	var err = null;

	for(var prop in users) {
		if(users.hasOwnProperty(prop)) {
			if(users[prop].user.secret === secret) {
				user = users[prop].user;
				break;
			}
		}
	}

	callback(err, user);
}

function getUserSiteState(/* Number */ userId, /* Number */ siteId, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var err = null;

	var stateObj = {};

	if(users[userId] && users[userId].sites[siteId]) {
		stateObj.extent = users[userId].sites[siteId].extent;
	}

	var state = new dm.UserSiteState(stateObj);

	callback(err, state);
}

function getIpAddressBanned(/* String */ ipAddress, /* Function */ callback) {
	"use strict";

	var err = null;
	var isBanned = false;

	if(!ipAddress) {
		err = "IP Address was not provided.";
	}

	if(err) {
		callback(err, null);
		return;
	}

	if(bannedIpAddresses[ipAddress]) {
		isBanned = true;
	}

	callback(err, isBanned);
}

function getSitesWithClients(/* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var err = null;

	var sitesWithClients = [];

	var cachedSites = siteCache.getValues();
	for(var i = 0; i < cachedSites.length; i++) {
		if(cachedSites[i] && cachedSites[i].clients && cachedSites[i].clients.length > 0) {
			sitesWithClients.push(cachedSites[i]);
		}
	}

	callback(err, sitesWithClients);
}

function insertSite(/* Site */ site, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;
	if(site && site.siteCode) {
		siteCache.put(site.siteCode, site);
		if(!site.id) {
			site.id = nextSiteId++;
		}
	} else {
		err = !site ? "Site was not provided." : "Provided site does not have siteCode.";
	}

	callback(err);
}

function insertUser(/* User */ user, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(user && user.secret) {

		getUser(user.secret, function(err, foundUser) {
			if(!foundUser) {
				if(!user.id) {
					user.id = nextUserId++;
				}
				users[user.id] = createUserEntry(user);
			} else {
				err = "User already exists. Not inserting new user.";
			}
			callback(err);
		});
	} else {
		err = !user ? "User was not provided." : "Provided user does not have secret.";
		callback(err);
	}
}

function insertMarker(/* Site */ site, /* PointMarker */ marker, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(site && marker) {
		site.markers.push(marker);
		marker.id = nextMarkerId++;

	} else {
		if(!site) {
			err = "Site was not provided.";
		} else {
			err = "Marker was not provided.";
		}
	}

	callback(err);
}

function insertUserSiteAssociation(/* Client */ client, /* Site */ site, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(site && site.id && client && client.user) {

		var userEntry = users[client.user.id];

		if(!userEntry) {
			users[client.user.id] = userEntry = createUserEntry(client.user);
		}

		userEntry.sites[site.id] = {siteCode: site.siteCode, extent: client.state.extent};

	} else {
		if(!site) {
			err = "Site was not provided.";
		} else if(!site.id) {
			err = "Provided site does not have id.";
		} else if(!client) {
			err = "Client was not provided.";
		} else if(!client.user) {
			err = "Provided client does not have user.";
		}
	}

	callback(err);
}

function insertConnectionLog(/* Client */ client, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(client && client.user) {

		var userEntry = users[client.user.id];

		if(!userEntry) {
			users[client.user.id] = createUserEntry(client.user);
		}
		userEntry.connects.push({connectDate: new Date(), ipAddress: client.ipAddress});
	} else {
		err = !client ? "Client was not provided." : "Provided client does not have user.";
	}

	callback(err);
}

function insertUserActivity(
	/* Number */ activityId,
	/* Number */ userId,
	/* Number */ siteId,
	/* Number */ markerId,
	/* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(activityId) {

		var entry = {
			date: new Date(),
			type: activityId
		};

		if(userId) {
			entry.userId = userId;
		}
		if(siteId) {
			entry.siteId = siteId;
		}
		if(markerId) {
			entry.markerId = markerId;
		}

		userActivity.push(entry);

	} else {
		if(!activityId) {
			err = "Activity ID was not provided.";
		}
	}

	callback(err);
}

function updateSite(/* Site */ site, /* Function */ callback) {
	"use strict";

	if(callback) {
		callback(null);
	}
}

function updateUser(/* User */ user, /* Function */ callback) {
	"use strict";

	if(callback) {
		callback(null);
	}
}

function updateMarker(
	/* Site */ site,
	/* PointMarker|PolylineMarker|PolygonMarker */ marker,
	/* Function */ callback) {
	"use strict";

	if(callback) {
		callback(null);
	}
}

function updateUserExtents(/* { userId: Number, siteId: Number, extent: MapExtent }[] */ userSiteExtents, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(!userSiteExtents) {
		err = "UserSiteExtents was not provided.";
	} else {
		for(var i = 0; i < userSiteExtents.length; i++) {
			var use = userSiteExtents[i];
			if(use && use.siteId && use.userId && use.extent) {
				if(users[use.userId] && users[use.userId].sites[use.siteId]) {
					users[use.userId].sites[use.siteId].extent = use.extent;
				}
			}
		}
	}

	callback(err);
}

function updateIpAddressBanned(/* String */ ipAddress, /* Boolean */ isBanned, /* Function */ callback) {
	"use strict";

	var err = null;

	if(!ipAddress) {
		err = "IP Address was not provided.";
	} else if(typeof isBanned !== "boolean") {
		err = "IsBanned was not provided or is not a boolean.";
	}

	if(err) {
		callback(err);
		return;
	}

	if(isBanned) {
		bannedIpAddresses[ipAddress] = true;
		util.disconnectUsersFromIpAddress(ipAddress, siteCache.getValues());
	} else {
		delete bannedIpAddresses[ipAddress];
	}

	callback(err);
}

function deleteMarker(/* Site */ site, /* Number */ markerId, /* Function */ callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	if(!site) {
		callback("Site was not provided.");
		return;
	}

	if(!markerId) {
		callback("Marker ID was not provided.");
		return;
	}

	var markers = site.markers;
	for(var i = 0; i < markers.length; i++) {
		if(markers[i].id === markerId) {
			markers.splice(i,1);
			break;
		}
	}

	callback(null);
}

function apiGetSites(/* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var sites = siteCache.getValues();

	var results = [];

	for(var i = 0; i < sites.length; i++) {
		if(sites[i]) {
			var site = sites[i];
			var apiSite = new apiDm.ApiSiteSummary(site);
			results.push(apiSite);
		}
	}

	callback(null, results);
}

function apiGetSite(/* String */ siteCode, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!siteCode) {
		callback("siteCode was not provided.", null);
		return;
	}

	var site = siteCache.get(siteCode);

	if(site) {
		callback(null, new apiDm.ApiSite(site));
	} else {
		callback("Site " + siteCode + " not found.", null);
	}
}

function apiGetUsers(/* Function */ callback) {
	"use strict";

	var results = [];

	for(var prop in users) {
		if(users.hasOwnProperty(prop) && users[prop] && users[prop].user) {
			results.push(new apiDm.ApiUserSummary(users[prop].user));
		}
	}

	callback(null, results);
}

function apiGetUser(/* Number */ userId, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!userId) {
		callback("userId was not provided.", null);
		return;
	}

	var userEntry = users[userId];

	var siteCodes = [];
	for(var siteId in userEntry.sites) {
		if(userEntry.sites.hasOwnProperty(siteId)) {
			siteCodes.push(userEntry.sites[siteId].siteCode);
		}
	}

	if(userEntry) {
		callback(null, new apiDm.ApiUser(userEntry.user, siteCodes));
	} else {
		callback("User with ID " + userId + " not found.", null);
	}
}

function apiGetStatus(/* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var err = null;
	var result = new apiDm.ApiStatus();

	var sites = siteCache.getValues();
	result.sitesInMemory = siteCache.size;

	var totalCurrentConnections = 0;
	var totalSites = 0;
	var totalMarkers = 0;
	var totalUsers = 0;
	var totalConnects = 0;

	for(var i = 0; i < sites.length; i++) {
		if(sites[i]) {
			var site = sites[i];
			if(site) {
				totalSites++;
				if(site.clients) {
					totalCurrentConnections += site.clients.length;
				}
				if(site.markers) {
					totalMarkers += site.markers.length;
				}
			}
		}
	}

	for(var prop in users) {
		if(users.hasOwnProperty(prop)) {
			var userEntry = users[prop];
			if(userEntry) {
				totalUsers++;
				if(userEntry.connects) {
					totalConnects += userEntry.connects.length;
				}
			}
		}
	}

	result.totalCurrentConnections = totalCurrentConnections;
	result.totalSites = totalSites;
	result.totalMarkers = totalMarkers;
	result.totalUsers = totalUsers;
	result.totalConnects = totalConnects;

	result.populateAverages();

	callback(err, result);
}

function apiGetUserActivity(/* Object */ options, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!options) {
		options = {};
	}
	if(typeof options.maxRecords === "undefined") {
		options.maxRecords = 100;
	}

	var err = null;

	var activity = [];

	var start = userActivity.length - options.maxRecords;
	if(start < 0) {
		start = 0;
	}

	for(var i = userActivity.length - 1; i >= start; i--) {
		var entry = userActivity[i];
		var ua = new apiDm.ApiUserActivity(
			entry.date,
			entry.type,
			entry.userId,
			entry.siteCode,
			entry.markerId
		);
		activity.push(ua);
	}

	var result = {
		activity: activity
	};

	callback(err, result);
}

exports.markerIcons = markerIcons;
exports.markerColors = markerColors;

exports.init = init;
exports.shutdown = shutdown;
exports.getSite = getSite;
exports.getUser = getUser;
exports.getUserSiteState = getUserSiteState;
exports.getIpAddressBanned = getIpAddressBanned;
exports.getSitesWithClients = getSitesWithClients;
exports.insertSite = insertSite;
exports.insertUser = insertUser;
exports.insertMarker = insertMarker;
exports.insertUserSiteAssociation = insertUserSiteAssociation;
exports.insertConnectionLog = insertConnectionLog;
exports.insertUserActivity = insertUserActivity;
exports.updateSite = updateSite;
exports.updateUser = updateUser;
exports.updateMarker = updateMarker;
exports.updateUserExtents = updateUserExtents;
exports.updateIpAddressBanned = updateIpAddressBanned;
exports.deleteMarker = deleteMarker;

exports.apiGetSites = apiGetSites;
exports.apiGetSite = apiGetSite;
exports.apiGetUsers = apiGetUsers;
exports.apiGetUser = apiGetUser;
exports.apiGetStatus = apiGetStatus;
exports.apiGetUserActivity = apiGetUserActivity;
