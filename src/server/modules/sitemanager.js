var dm = require("./datamodel");
var logger = require("./logger");
var mm = require("./meshmap");
var store = require("./store");
var sw = require("./stopwatch");
var ua = require("./useractivity");
var util = require("./util");

var appConfigServiceFactory = require("./config/appConfigServiceFactory");

var PRUNE_DISCONNECTED_CLIENTS_INTERVAL = 600000; // Every 10 minutes
var STORE_EXTENTS_INTERVAL = 10000; // Delay writing extent updates to store by up to 10 seconds

var decrementSiteCreationCountsTimer = null;

// Remember most recent extent change for each user-site pair so that we don't
// need to write to the store so frequently.
var pendingExtentUpdates = {};

/*
 * Used to ensure one IP address can't flood the /new endpoint with requests.
 * ipAddress -> Number
 *
 */
var siteCreationByIp = {};

function init(config) {
	"use strict";

	loadConfig(config);

	setInterval(pruneDisconnectedClients, PRUNE_DISCONNECTED_CLIENTS_INTERVAL);
	setInterval(writePendingUserExtentsToStore, STORE_EXTENTS_INTERVAL);
}

function loadConfig(config) {
	"use strict";

	if(decrementSiteCreationCountsTimer) {
		clearInterval(decrementSiteCreationCountsTimer);
	}
	decrementSiteCreationCountsTimer = setInterval(
		decrementSiteCreationCounts,
		Math.floor(3600000 / config.limits.newSitesPerIpPerHour));

}

function shutdown() {
	"use strict";

	writePendingUserExtentsToStore();
	if(decrementSiteCreationCountsTimer) {
		clearInterval(decrementSiteCreationCountsTimer);
	}
}

function pruneDisconnectedClients() {
	"use strict";

	logger.debug("Pruning disconnected clients from sites.");
	var stopwatch = new sw.Stopwatch("Prune disconnected clients from sites");

	store.getSitesWithClients(function(err, sites) {
		if(err) {
			logger.error("Failed to get sites with connected clients: " + err);
			return;
		}

		var clientsPruned = 0;
		for(var i = 0; i < sites.length; i++) {
			var site = sites[i];
			for(var j = site.clients.length - 1; j >= 0; j--) {
				var client = site.clients[j];
				if(client.connection && client.connection.disconnected) {
					mm.handleUserDisconnect(client, site);
					clientsPruned++;
				}
			}
		}

		if(clientsPruned > 0) {
			logger.info("Pruned " + clientsPruned + " disconnected clients from sites.");
		}

		stopwatch.stop();
	});
}

function createNewSite(/* String */ ipAddress, /* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var appConfig = appConfigServiceFactory.create().getAppConfig();

	if(typeof siteCreationByIp[ipAddress] === "undefined") {
		siteCreationByIp[ipAddress] = 0;
	}

	if(siteCreationByIp[ipAddress] >= appConfig.limits.newSitesPerIpPerHour) {
		callback(null, true, null);
		return;
	}

	var newSiteCode = util.createSiteCode();

	var site = new dm.Site();
	site.name = "My Map";
	site.description = "Map Description";
	site.siteCode = newSiteCode;
	site.createDate = new Date();
	site.lastAccessDate = site.createDate;
	site.settings = new dm.SiteSettings(appConfig.siteDefaults);

	store.insertSite(site, function(err) {
		if(err) {
			callback(err, false, null);
		} else {
			siteCreationByIp[ipAddress]++;
			callback(null, false, newSiteCode);

			store.insertUserActivity(ua.activityTypes["create_site"].id,
				null,
				site.id,
				null,
				function(err) {
					if(err) {
						logger.error("Failed to log user's create_site activity: " + err);
					}
				}
			);

			logger.debug("Created site " + newSiteCode + " from IP address " + ipAddress);
		}
	});
}

function decrementSiteCreationCounts() {
	"use strict";
	for(var key in siteCreationByIp) {
		if(siteCreationByIp.hasOwnProperty(key) && typeof siteCreationByIp[key] === "number") {
			siteCreationByIp[key]--;
			if(siteCreationByIp[key] <= 0) {
				delete siteCreationByIp[key];
			}
		}
	}
}

function writePendingUserExtentsToStore() {
	"use strict";

	if(pendingExtentUpdates) {

		var userSiteExtents = [];
		for(var userId in pendingExtentUpdates) {
			if(pendingExtentUpdates.hasOwnProperty(userId)) {
				var userSites = pendingExtentUpdates[userId];
				if(userSites) {
					for(var siteCode in userSites) {
						if(userSites.hasOwnProperty(siteCode) && userSites[siteCode]) {
							userSiteExtents.push({
								userId: userId,
								siteCode: siteCode,
								siteId: userSites[siteCode].siteId,
								extent: userSites[siteCode].extent
							});
						}
					}
				}
			}
		}

		if(userSiteExtents.length > 0) {
			var stopwatch = new sw.Stopwatch("Write " + userSiteExtents.length + " user extents to store");
			store.updateUserExtents(userSiteExtents, function(err) {
				if(err) {
					logger.error("Failed to write set of user extents to store: " + err);
				} else {
					logger.debug("Wrote " + userSiteExtents.length + " user extents to store.");
					stopwatch.stop();
				}
			});
		}

		pendingExtentUpdates = {};
	}
}

function getSite(/* String */ siteCode, /* Function */ callback) {
	"use strict";

	store.getSite(siteCode, null, callback);
}

function ensureUserIsAssociatedWithSite(/* Client */ client, /* Site */ site, /* Function */ callback) {
	"use strict";

	store.insertUserSiteAssociation(client, site, callback);
}

function changeUserExtent(/* Client */ client, /* MapExtent */ extent, /* Site */ site) {
	"use strict";

	client.state.extent = extent;

	if(!pendingExtentUpdates[client.user.id]) {
		pendingExtentUpdates[client.user.id] = {};
	}

	pendingExtentUpdates[client.user.id][site.siteCode] = {
		siteId: site.id,
		extent: extent
	};
}

exports.init = init;
exports.loadConfig = loadConfig;
exports.shutdown = shutdown;

exports.createNewSite = createNewSite;
exports.getSite = getSite;
exports.ensureUserIsAssociatedWithSite = ensureUserIsAssociatedWithSite;
exports.changeUserExtent = changeUserExtent;
