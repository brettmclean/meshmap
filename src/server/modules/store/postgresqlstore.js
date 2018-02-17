var apiDm = require("../apidatamodel");
var cache = require("./cache");
var dm = require("../datamodel");
var os = require("os");
var pg = require("pg");
var copyFrom = require("pg-copy-streams").from;
var util = require("../util");
var loggingServiceFactory = require("../logging/factories/loggingServiceFactory");

var loggingService = loggingServiceFactory.create();

var siteCache = new cache.Cache();
siteCache.canRemoveItem = function(/* Site */ site) {
	"use strict";
	return !site || !site.clients || site.clients.length <= 0;
};

/*
 * ipAddress ->
 * {
 *    isBanned: Boolean
 * }
 */
var bannedIpCache = new cache.Cache();

var connectionString = null;

var markerIcons = null;
var markerColors = null;

var convertMapExtentToPsqlBoxString = function(/* MapExtent */ extent) {
	"use strict";

	if(!extent) {
		return null;
	}

	var min = extent.min;
	var max = extent.max;
	var boxStr = "(" + min.lng + "," + min.lat + "),(" + max.lng + "," + max.lat + ")";
	return boxStr;
};

var convertPsqlBoxStringToMapExtent = function(/* String */ boxStr) {
	"use strict";

	if(!boxStr) {
		return null;
	}

	boxStr = boxStr.replace(/\(|\)| /g, ""); // remove parentheses and spaces
	var nums = boxStr.split(",");

	for(var i = 0; i < nums.length; i++) {
		nums[i] = parseFloat(nums[i]);
	}

	var min = new dm.Location(nums[3], nums[2]);
	var max = new dm.Location(nums[1], nums[0]);
	var extent = new dm.MapExtent(min, max);

	return extent;
};

var convertLocationToPsqlPointString = function(/* Location */ location) {
	"use strict";

	if(!location) {
		return null;
	}

	return "(" + location.lng + "," + location.lat + ")";
};

var convertPsqlPointToLocation = function(/* Object */ point) {
	"use strict";

	if(!point) {
		return null;
	}

	return new dm.Location(point.y, point.x);
};

var convertLocationArrayToPsqlPathString = function(/* Location[] */ locations) {
	"use strict";

	if(!locations || !locations.length) {
		return null;
	}

	var pathStr = "[";
	var locationStrs = [];
	for(var i = 0; i < locations.length; i++) {
		locationStrs.push(convertLocationToPsqlPointString(locations[i]));
	}
	pathStr += locationStrs.join(",");
	pathStr += "]";

	return pathStr;
};

var convertPsqlPathStringToLocationArray = function(/* String */ pathStr) {
	"use strict";

	if(!pathStr) {
		return null;
	}

	pathStr = pathStr.replace(/\(|\)|\[|\]| /g, ""); // remove square brackets, parentheses and spaces
	var nums = pathStr.split(",");

	var locations = [];
	for(var i = 0; i < nums.length; i += 2) {
		locations.push(
			new dm.Location(
				parseFloat(nums[i + 1]),
				parseFloat(nums[i])
			)
		);
	}

	return locations;
};

var convertLocationArrayToPsqlPolygonString = function(/* Location[] */ locations) {
	"use strict";

	if(!locations || !locations.length) {
		return null;
	}

	var polygonStr = "(";
	var locationStrs = [];
	for(var i = 0; i < locations.length; i++) {
		locationStrs.push(convertLocationToPsqlPointString(locations[i]));
	}
	polygonStr += locationStrs.join(",");
	polygonStr += ")";

	return polygonStr;
};

var convertPsqlPolygonStringToLocationArray = function(/* String */ polygonStr) {
	"use strict";

	if(!polygonStr) {
		return null;
	}

	polygonStr = polygonStr.replace(/\(|\)| /g, ""); // remove parentheses and spaces
	var nums = polygonStr.split(",");

	var locations = [];
	for(var i = 0; i < nums.length; i += 2) {
		locations.push(
			new dm.Location(
				parseFloat(nums[i + 1]),
				parseFloat(nums[i])
			)
		);
	}

	return locations;
};

function getConnection(/* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	pg.connect(connectionString, function(err, client, done) {
		if(err) {
			loggingService.error("Failed to connect to PostgreSQL database: " + err);
			callback(err, null, null);
		} else {
			callback(err, client, done);
		}
	});
}

function runQuery(sql, parameters, client, callback) {
	"use strict";

	var exec = function(sql, parameters, client, callback) {
		client.query(sql, parameters, function(err, result) {
			if(err) {
				loggingService.error("Error running query: " + sql +
					"\n\t" + "with parameters: " + parameters +
					"\n\t" + "Error message: " + err);
			}

			try {
				callback(err, result);
			} catch(e) {
				loggingService.error("An error occurred in query result handler: " + e);
			}
		});
	};

	if(client) {
		exec(sql, parameters, client, callback);
	} else {
		getConnection(function(err, client, done) {
			if(err) {
				callback(err, null);
			} else {
				exec(sql, parameters, client, function(err, result) {
					done();
					callback(err, result);
				});
			}
		});
	}
}

function init(config) {
	"use strict";

	loggingService.info("Using PostgreSQL data store.");

	loadConfig(config);

	var MAX_CONN_ATTEMPTS = 10;
	var connAttempts = 0;
	var connAttemptDelay = 1000; // ms

	var verifyConnection = function(successCallback) {
		getConnection(function(err, client, done) {
			connAttempts++;
			if(err) {
				if(connAttempts < MAX_CONN_ATTEMPTS) {
					setTimeout(verifyConnection, connAttemptDelay, successCallback);
					loggingService.error("Trying PostgreSQL connection again in " + connAttemptDelay + "ms.");
					connAttemptDelay *= 2;
				} else {
					loggingService.error("Giving up on PostgreSQL. Application will need to be restarted after PostgreSQL connectivity is resolved.");
				}
				return;
			}

			if(connAttempts > 1) {
				loggingService.error("Connected to PostgreSQL after " + connAttempts + " attempts.");
			}

			done(); // Release connection; we only wanted it to test connectivity
			if(successCallback) {
				successCallback();
			}
		});
	};

	verifyConnection(function() {
		populateMarkerSymbols();
	});
}

function shutdown() {

}

function loadConfig(config) {
	"use strict";
	if(config && config.store) {
		if(config.store.connectionString) {
			connectionString = config.store.connectionString;
		} else {
			loggingService.error("The store.connectionString property is not set in config. Application cannot connect to the PostgreSQL database. User data cannot be saved or loaded.");
			process.exit(1);
		}
		pg.defaults.poolSize = config.store.maxConnections;
	}
}

var populateMarkerSymbols = function() {
	"use strict";

	runQuery("SELECT id, url FROM marker_icons",
		[],
		null,
		function(err, iconResults) {

			if(err) {
				return loggingService.error("Failed to get marker icons from database: " + err);
			}

			if(iconResults) {
				markerIcons = {};
				for(var i = 0; i < iconResults.rowCount; i++) {
					markerIcons[iconResults.rows[i].id] = iconResults.rows[i].url;
				}

				exports.markerIcons = markerIcons;
			}
		}
	);

	runQuery("SELECT id, color FROM marker_colors",
		[],
		null,
		function(err, colorResults) {

			if(err) {
				return loggingService.error("Failed to get marker colors from database: " + err);
			}

			if(colorResults) {
				markerColors = {};
				for(var i = 0; i < colorResults.rowCount; i++) {
					markerColors[colorResults.rows[i].id] = colorResults.rows[i].color;
				}

				exports.markerColors = markerColors;
			}
		}
	);
};

function getSite(siteCode, options, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!options) {
		options = {};
	}
	if(typeof options.updateSiteAccessDate === "undefined") {
		options.updateSiteAccessDate = true;
	}

	if(!siteCode) {
		callback("SiteCode was not provided.", null);
	}

	var site = siteCache.get(siteCode);
	if(site) {
		if(options.updateSiteAccessDate) {
			updateSiteAccessDate(site);
		}
		callback(null, site);
		return;
	}

	var getSiteSql = "SELECT s.id, s.name, s.description, s.owner_id, s.creation_date, s.last_access_date, ss.only_owner_can_edit, ss.initial_extent " +
		"FROM sites s " +
		"LEFT JOIN site_settings ss ON s.id = ss.site_id " +
		"WHERE s.site_code = $1";

	runQuery(getSiteSql,
		[siteCode],
		null,
		function(err, siteResult) {

			var site = null;

			if(siteResult && siteResult.rowCount > 0) {
				var row = siteResult.rows[0];
				site = new dm.Site();
				site.id = row.id;
				site.siteCode = siteCode;
				site.name = row.name;
				site.description = row.description;
				site.ownerId = row.owner_id;
				site.createDate = row.creation_date;
				site.lastAccessDate = row.last_access_date;
				site.settings.onlyOwnerCanEdit = row.only_owner_can_edit;
				site.settings.initialExtent = convertPsqlBoxStringToMapExtent(row.initial_extent);

				if(err) {
					callback(err, site);
				} else {
					getMarkers(site.id, function(err, markers) {
						if(!err) {
							site.markers = markers;
						}
						callback(err, site);
					});
				}
			}

			if(site) {
				siteCache.put(siteCode, site);
				if(options.updateSiteAccessDate) {
					updateSiteAccessDate(site);
				}
			} else {
				callback("Site " + siteCode + " not found.", null);
			}
		});
}

function getUser(secret, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!secret) {
		callback("Secret was not provided.", null);
	}

	var getUserSql = "SELECT u.id, u.name, us.confirm_marker_deletion " +
		"FROM users u " +
		"LEFT JOIN user_settings us ON u.id = us.user_id " +
		"WHERE u.secret = $1";

	runQuery(getUserSql,
		[secret],
		null,
		function(err, userResult) {

			if(err) {
				callback(err, null);
				return;
			}

			var user = null;

			if(userResult && userResult.rowCount > 0) {
				var row = userResult.rows[0];
				user = new dm.User(secret);
				user.id = row.id;
				user.name = row.name;
				user.settings.confirmMarkerDeletion = row.confirm_marker_deletion;
			}

			callback(err, user);
		});
}

function getUserSiteState(userId, siteId, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	runQuery("SELECT extent FROM user_sites WHERE user_id = $1 AND site_id = $2;",
		[userId, siteId],
		null,
		function(err, result) {
			if(err) {
				return callback(err, null);
			}

			var stateObj = {};

			if(result && result.rowCount > 0) {
				stateObj.extent = convertPsqlBoxStringToMapExtent(result.rows[0].extent);
			}

			callback(err, new dm.UserSiteState(stateObj));
		}
	);
}

function getIpAddressBanned(ipAddress, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var err = null;

	if(!ipAddress) {
		err = "IP Address was not provided.";
	}

	if(err) {
		callback(err, null);
		return;
	}

	var cachedIp = bannedIpCache.get(ipAddress);
	if(cachedIp) {
		callback(err, cachedIp.isBanned);
		return;
	}

	runQuery("SELECT is_banned FROM ip_addresses WHERE ip_address = $1",
		[ipAddress],
		null,
		function(err, result) {
			if(err) {
				callback(err, null);
				return;
			}

			var isBanned = false;

			if(result && result.rowCount > 0) {
				isBanned = result.rows[0].is_banned;
			}

			bannedIpCache.put(ipAddress, { isBanned: isBanned });

			callback(err, isBanned);
		}
	);
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

function getMarkers(siteId, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!siteId) {
		callback("SiteId was not provided.", null);
	}

	runQuery("SELECT id, name, description, point, polyline, polygon, symbol, owner_id, description FROM markers WHERE site_id = $1",
		[siteId],
		null,
		function(err, markersResult) {

			var markers = [];

			if(markersResult && markersResult.rowCount > 0) {
				for(var i = 0; i < markersResult.rowCount; i++) {
					var row = markersResult.rows[i];
					var markerId = row.id;

					var iconId = null;
					var lineColorId = null;
					var fillColorId = null;
					var lineWidth = null;
					var symbolParts = (row.symbol && row.symbol.split(";")) || [];
					for(var j = 0; j < symbolParts.length; j++) {
						var symbolPart = symbolParts[j];
						if(symbolPart.match(/^ico=/)) {
							iconId = parseInt(symbolPart.replace("ico=", ""));
						} else if(symbolPart.match(/^lncl=/)) {
							lineColorId = parseInt(symbolPart.replace("lncl=", ""));
						} else if(symbolPart.match(/^flcl=/)) {
							fillColorId = parseInt(symbolPart.replace("flcl=", ""));
						} else if(symbolPart.match(/^lnwd=/)) {
							lineWidth = parseInt(symbolPart.replace("lnwd=", ""));
						}
					}

					var marker = null;
					var location = null;
					var locations = null;
					if(row.point) {
						location = convertPsqlPointToLocation(row.point);
						marker = new dm.PointMarker(markerId, location, parseInt(iconId));
					} else if(row.polyline) {
						locations = convertPsqlPathStringToLocationArray(row.polyline);
						marker = new dm.PolylineMarker(markerId, locations, lineColorId, lineWidth);
					} else if(row.polygon) {
						locations = convertPsqlPolygonStringToLocationArray(row.polygon);
						marker = new dm.PolygonMarker(markerId, locations, lineColorId, fillColorId, lineWidth);
					}

					if(marker) {
						marker.name = row.name;
						marker.description = row.description;
						marker.ownerId = row.owner_id;
						markers.push(marker);
					}
				}
			}

			callback(err, markers);
		}
	);
}

function insertSite(site, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	if(site && site.siteCode) {
		siteCache.put(site.siteCode, site);

		getConnection(function(err, dbClient, dbDone) {
			if(err) {
				callback(err);
				return;
			}

			var dbCallback = function(err) {
				dbDone();
				callback(err);
			};

			runQuery("INSERT INTO sites (site_code, owner_id, name, description, creation_date, last_access_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
				[site.siteCode, site.ownerId, site.name, site.description, site.createDate, site.lastAccessDate],
				dbClient,
				function(err, result) {
					if(result && result.rowCount > 0 && result.rows[0].id) {
						site.id = result.rows[0].id;
					}

					if(err) {
						return dbCallback(err);
					}

					var boxStr = convertMapExtentToPsqlBoxString(site.settings.initialExtent);

					runQuery("INSERT INTO site_settings (site_id, only_owner_can_edit, initial_extent) VALUES ($1, $2, $3)",
						[site.id, site.settings.onlyOwnerCanEdit, boxStr],
						dbClient,
						function(err) {
							dbCallback(err);
						}
					);
				}
			);

		});
	} else {
		var err = !site ? "Site was not provided." : "Provided site does not have siteCode.";
		callback(err);
	}
}

function insertUser(user, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(user && user.secret) {
		getConnection(
			function(err, dbClient, dbDone) {
				if(err) {
					callback(err);
					return;
				}

				var dbCallback = function(err) {
					dbDone();
					callback(err);
				};

				runQuery("INSERT INTO users (name, secret) VALUES ($1, $2) RETURNING id",
					[user.name, user.secret],
					dbClient,
					function(err, result) {
						if(result && result.rowCount > 0 && result.rows[0].id) {
							user.id = result.rows[0].id;
						}

						if(err) {
							return dbCallback(err);
						}

						runQuery("INSERT INTO user_settings (user_id, confirm_marker_deletion) VALUES ($1, $2)",
							[user.id, user.settings.confirmMarkerDeletion],
							dbClient,
							function(err) {
								dbCallback(err);
							}
						);
					}
				);
			}
		);
	} else {
		err = !user ? "User was not provided." : "Provided user does not have secret.";
		callback(err);
	}
}

function insertMarker(site, marker, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	if(site && site.id && marker) {

		site.markers.push(marker);

		var location = marker.location;
		var pointStr = null;
		var polylineStr = null;
		var polygonStr = null;
		var symbol = null;

		var markerType = util.getMarkerType(marker);
		switch(markerType) {
			case util.MARKER_TYPE_POINT:
				pointStr = convertLocationToPsqlPointString(location);
				symbol = "ico=" + marker.iconId;
				break;
			case util.MARKER_TYPE_POLYLINE:
				polylineStr = convertLocationArrayToPsqlPathString(marker.locations);
				symbol = "lncl=" + marker.lineColorId + ";lnwd=" + marker.width;
				break;
			case util.MARKER_TYPE_POLYGON:
				polygonStr = convertLocationArrayToPsqlPolygonString(marker.locations);
				symbol = "lncl=" + marker.lineColorId + ";flcl=" + marker.fillColorId + ";lnwd=" + marker.width;
				break;
			default:
				break;
		}

		runQuery("INSERT INTO markers (site_id, name, description, point, polyline, polygon, symbol, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
			[site.id, marker.name, marker.description, pointStr, polylineStr, polygonStr, symbol, marker.ownerId],
			null,
			function(err, result) {

				if(result.rowCount > 0 && result.rows[0].id) {
					marker.id = result.rows[0].id;
				}

				callback(err);
			}
		);
	} else {

		var err = "Unknown error.";

		if(!site) {
			err = "Site was not provided.";
		} else if(!site.id) {
			err = "Provided site does not have id.";
		} else {
			err = "Marker was not provided.";
		}

		callback(err);
	}
}

function insertUserSiteAssociation(client, site, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	if(site && site.id && client && client.user && client.user.id) {

		getConnection(function(err, dbClient, dbDone) {
			if(err) {
				callback(err);
				return;
			}

			runQuery("SELECT count(*)::integer AS count FROM user_sites WHERE site_id = $1 AND user_id = $2",
				[site.id, client.user.id],
				dbClient,
				function(err, result) {

					var dbCallback = function(err) {
						dbDone();
						callback(err);
					};

					if(err) {
						dbCallback(err);
						return;
					}

					if(result && result.rowCount > 0) {
						if(result.rows[0].count <= 0) {
							runQuery("INSERT INTO user_sites (site_id, user_id) VALUES ($1, $2)",
								[site.id, client.user.id],
								dbClient,
								function(err) {
									dbCallback(err);
								}
							);
						} else {
							dbCallback(null);
						}
					} else {
						dbCallback("No results returned from user_sites.");
					}
				}
			);
		});

	} else {
		var err = null;
		if(!site) {
			err = "Site was not provided.";
		} else if(!site.siteCode) {
			err = "Provided site does not have siteCode.";
		} else if(!client) {
			err = "Client was not provided.";
		} else if(!client.user) {
			err = "Provided client does not have user.";
		} else if(!client.user.id) {
			err = "Provided user does not have id.";
		}
		callback(err);
	}
}

function insertConnectionLog(client, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(client) {

		getConnection(function(err, dbClient, dbDone) {

			if(err) {
				callback(err);
				return;
			}

			var dbCallback = function(err) {
				dbDone();
				callback(err);
			};

			var checkIpAddressExists = function(ipAddress) {
				runQuery("SELECT id FROM ip_addresses WHERE ip_address = $1",
					[ipAddress],
					dbClient,
					function(err, result) {

						if(err) {
							dbCallback(err);
							return;
						}

						if(result && result.rowCount > 0) {
							var ipId = result.rows[0].id;
							insertUserConnection(ipId);
						} else {
							insertIpAddress(ipAddress);
						}
					}
				);
			};

			var insertIpAddress = function(ipAddress) {
				runQuery("INSERT INTO ip_addresses (ip_address, is_banned) VALUES ($1, $2) RETURNING id",
					[ipAddress, false],
					dbClient,
					function(err, result) {
						if(err) {
							dbCallback(err);
							return;
						}

						var ipId = result.rows[0].id;
						insertUserConnection(ipId);
					}
				);
			};

			var insertUserConnection = function(ipId) {
				runQuery("INSERT INTO user_connections (user_id, ip_id, connect_date) VALUES ($1, $2, $3)",
					[client.user.id, ipId, new Date()],
					dbClient,
					function(err) {
						dbCallback(err);
					}
				);
			};

			checkIpAddressExists(client.ipAddress);
		});

	} else {
		err = "Client was not provided.";
		callback(err);
	}
}

function insertUserActivity(
	activityId,
	userId,
	siteId,
	markerId,
	callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(activityId) {

		userId = userId ? userId : null;
		siteId = siteId ? siteId : null;
		markerId = markerId ? markerId : null;

		runQuery("INSERT INTO user_activity (activity_date, activity_type, user_id, site_id, marker_id) VALUES ($1, $2, $3, $4, $5)",
			[new Date(), activityId, userId, siteId, markerId],
			null,
			function(err) {
				callback(err);
			}
		);

	} else {
		if(!activityId) {
			err = "Activity ID was not provided.";
		}
		callback(err);
	}
}

function updateSite(site, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(!site) {
		err = "Site was not provided.";
	}

	if(err) {
		callback(err);
		return;
	}

	getConnection(function(err, dbClient, dbDone) {
		if(err) {
			callback(err, null);
			return;
		}

		var dbCallback = function(err) {
			dbDone();
			callback(err);
		};

		runQuery("UPDATE sites SET owner_id = $1, name = $2, description = $3 WHERE id = $4",
			[site.ownerId, site.name, site.description, site.id],
			dbClient,
			function(err) {
				if(err) {
					return dbCallback(err);
				}

				var settings = site.settings;

				runQuery("UPDATE site_settings SET only_owner_can_edit = $1, initial_extent = $2 WHERE site_id = $3",
					[settings.onlyOwnerCanEdit, convertMapExtentToPsqlBoxString(settings.initialExtent), site.id],
					dbClient,
					function(err) {
						dbCallback(err);
					}
				);
			}
		);
	});
}

function updateUser(user, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	getConnection(function(err, dbClient, dbDone) {
		if(err) {
			callback(err, null);
			return;
		}

		var dbCallback = function(err) {
			dbDone();
			callback(err);
		};

		runQuery("UPDATE users SET name = $1 WHERE id = $2",
			[user.name, user.id],
			null,
			function(err) {
				if(err) {
					return dbCallback(err);
				}

				var settings = user.settings;
				runQuery("UPDATE user_settings SET confirm_marker_deletion = $1 WHERE user_id = $2",
					[settings.confirmMarkerDeletion, user.id],
					dbClient,
					function(err) {
						dbCallback(err);
					}
				);
			}
		);
	});
}

function updateMarker(
	site,
	marker,
	callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	runQuery("UPDATE markers SET name = $1, description = $2 WHERE id = $3",
		[marker.name, marker.description, marker.id],
		null,
		function(err) {
			callback(err);
		}
	);
}

function updateUserExtents(userSiteExtents, callback) {
	"use strict";

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(!userSiteExtents) {
		err = "UserSiteExtents was not provided.";
	}

	if(err) {
		callback(err);
		return;
	}

	getConnection(function(err, dbClient, dbDone) {
		if(err) {
			callback(err, null);
			return;
		}

		var dbCallback = function(err) {
			dbDone();
			callback(err);
		};

		var rollback = function(err) {
			dbClient.query("ROLLBACK",
				function(err) {
					if(err) {
						loggingService.error("Error while rolling back update user extent transaction: " + err);
					}
				}
			);
			dbCallback(err);
		};

		dbClient.query("BEGIN",
			[],
			function(err) {
				if(err) {
					return rollback(err);
				}

				dbClient.query("CREATE TEMP TABLE user_sites_temp (LIKE user_sites INCLUDING ALL) ON COMMIT DROP",
					[],
					function(err) {
						if(err) {
							return rollback("Error while creating temp table user_sites_temp: " + err);
						}

						var stream = dbClient.query(copyFrom("COPY user_sites_temp (site_id, user_id, extent) FROM STDIN WITH CSV"));

						var streamError = false;
						stream.on("error", function(err) {
							streamError = true;
							return rollback("There was a stream error while copying data to user_sites_temp: " + err);
						});

						var csvData = "";
						for(var i = 0; i < userSiteExtents.length; i++) {
							var use = userSiteExtents[i];
							var boxStr = convertMapExtentToPsqlBoxString(use.extent);
							var boxStrCsv = boxStr ? "\"" + boxStr + "\"" : "";
							csvData += use.siteId + "," + use.userId + "," + boxStrCsv + os.EOL;
						}
						stream.write(csvData);
						stream.end();

						stream.on("close", function() {

							if(streamError) {
								return;
							}

							dbClient.query(
								"UPDATE user_sites us " +
								"SET extent = ust.extent " +
								"FROM user_sites_temp ust " +
								"WHERE us.site_id = ust.site_id AND us.user_id = ust.user_id",
								[],
								function(err) {

									if(err) {
										return rollback("Error while updating user_sites from user_sites_temp: " + err);
									}

									dbClient.query("COMMIT", function(err) {
										if(err) {
											return rollback("Error occurred while committing extent updates to user_sites: " + err);
										}

										dbCallback(null);
									});
								}
							);
						});
					}
				);
			}
		);
	});
}

function updateSiteAccessDate(site, date, callback) {
	"use strict";

	if(!date) {
		date = new Date();
	}

	if(!callback) {
		callback = function() {};
	}

	var err = null;

	if(!site) {
		err = "Site was not provided.";
	}

	if(err) {
		callback(err);
		return;
	}

	// Don't bother updating last access date in database if it has been less
	// than 60 seconds since last update.
	if(site.lastAccessDate && site.lastAccessDate > date - 60000) {
		callback(null);
		return;
	}

	site.lastAccessDate = date;
	runQuery("UPDATE sites SET last_access_date = $1 WHERE id = $2",
			[date, site.id],
			null,
			function(err) {
				callback(err);
			}
	);
}

function updateIpAddressBanned(ipAddress, isBanned, callback) {
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

	bannedIpCache.put(ipAddress, { isBanned: isBanned });

	runQuery("UPDATE ip_addresses SET is_banned = $1 WHERE ip_address = $2",
		[isBanned, ipAddress],
		null,
		function(err) {
			callback(err);
		}
	);

	if(isBanned) {
		util.disconnectUsersFromIpAddress(ipAddress, siteCache.getValues());
	}
}

function deleteMarker(site, markerId, callback) {
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
			markers.splice(i, 1);
			break;
		}
	}

	runQuery("DELETE FROM markers WHERE id = $1",
		[markerId],
		null,
		function(err) {
			callback(err);
		}
	);
}

function apiGetSites(callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var results = [];

	runQuery("SELECT site_code, name, creation_date, last_access_date FROM sites",
		[],
		null,
		function(err, sitesResult) {

			var site = null;

			if(err) {
				callback(err, null);
				return;
			}

			if(sitesResult && sitesResult.rowCount > 0) {
				for(var i = 0; i < sitesResult.rowCount; i++) {
					var row = sitesResult.rows[i];

					// Use cached site so we can see if there are any connected
					// users.
					var cachedSite = siteCache.get(row.site_code);

					if(cachedSite) {
						site = cachedSite;
					} else {
						site = new dm.Site();
						site.siteCode = row.site_code;
						site.name = row.name;
						site.createDate = row.creation_date;
						site.lastAccessDate = row.last_access_date;
					}

					var apiSite = new apiDm.ApiSiteSummary(site);
					results.push(apiSite);
				}

				callback(err, results);
			}
		}
	);
}

function apiGetSite(siteCode, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!siteCode) {
		callback("siteCode was not provided.", null);
		return;
	}

	getSite(siteCode, { updateSiteAccessDate: false }, function(err, site) {

		if(!site) {
			callback("Site " + siteCode + " not found.", null);
			return;
		}

		callback(err, new apiDm.ApiSite(site));
	});
}

function apiGetUsers(callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var results = [];

	runQuery("SELECT id, name FROM users",
		[],
		null,
		function(err, usersResult) {

			var user = null;

			if(err) {
				callback(err, null);
				return;
			}

			if(usersResult && usersResult.rowCount > 0) {
				for(var i = 0; i < usersResult.rowCount; i++) {
					var row = usersResult.rows[i];
					user = new dm.User();
					user.id = row.id;
					user.name = row.name;

					var apiUser = new apiDm.ApiUserSummary(user);
					results.push(apiUser);
				}

				callback(err, results);
			}
		}
	);
}

function apiGetUser(userId, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	if(!userId) {
		callback("userId was not provided.", null);
		return;
	}

	runQuery("SELECT name FROM users WHERE id = $1",
		[userId],
		null,
		function(err, userResult) {

			if(err) {
				callback(err, null);
				return;
			}

			if(userResult && userResult.rowCount > 0) {
				var row = userResult.rows[0];
				var user = new dm.User();
				user.id = userId;
				user.name = row.name;

				runQuery("SELECT s.site_code FROM user_sites us INNER JOIN sites s ON us.site_id = s.id WHERE us.user_id = $1",
					[userId],
					null,
					function(err, siteCodesResult) {

						if(err) {
							callback(err, null);
							return;
						}

						var siteCodes = [];

						if(siteCodesResult) {
							for(var i = 0; i < siteCodesResult.rowCount; i++) {
								if(siteCodesResult.rows[i] && siteCodesResult.rows[i].site_code) {
									siteCodes.push(siteCodesResult.rows[i].site_code);
								}
							}
						}

						callback(null, new apiDm.ApiUser(user, siteCodes));
					}
				);
			} else {
				callback("User with ID " + userId + " not found.", null);
			}
		}
	);
}

function apiGetStatus(callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var statusResult = new apiDm.ApiStatus();
	statusResult.sitesInMemory = siteCache.size;

	var completedTotalSitesQuery = false;
	var completedTotalMarkersQuery = false;
	var completedTotalUsersQuery = false;
	var completedTotalConnectsQuery = false;

	// All sites with active connections are in the site cache.
	var sites = siteCache.getValues();
	statusResult.totalCurrentConnections = 0;

	for(var i = 0; i < sites.length; i++) {
		if(sites[i]) {
			var site = sites[i];
			if(site) {
				if(site.clients) {
					statusResult.totalCurrentConnections += site.clients.length;
				}
			}
		}
	}

	getConnection(function(err, dbClient, dbDone) {

		if(err) {
			callback(err, null);
			return;
		}

		var dbCallback = function(err, statusResult) {
			dbDone();
			callback(err, statusResult);
		};

		var checkAllQueriesDone = function() {
			if(completedTotalSitesQuery &&
			completedTotalMarkersQuery &&
			completedTotalUsersQuery &&
			completedTotalConnectsQuery) {
				statusResult.populateAverages();
				dbCallback(null, statusResult);
			}
		};

		var getTotalFromTable = function(tableName, totalCallback) {
			runQuery("SELECT count(*)::integer AS count FROM " + tableName,
				[],
				dbClient,
				function(err, result) {
					if(err) {
						dbCallback(err, null);
						return;
					}

					if(result && result.rowCount > 0 && result.rows[0].count) {
						totalCallback(result.rows[0].count);
					} else {
						totalCallback(0);
					}
					checkAllQueriesDone();
				}
			);
		};

		// Total sites
		getTotalFromTable("sites", function(total) {
			completedTotalSitesQuery = true;
			statusResult.totalSites = total;
		});

		// Total markers
		getTotalFromTable("markers", function(total) {
			completedTotalMarkersQuery = true;
			statusResult.totalMarkers = total;
		});

		// Total users
		getTotalFromTable("users", function(total) {
			completedTotalUsersQuery = true;
			statusResult.totalUsers = total;
		});

		// Total connects
		getTotalFromTable("user_connections", function(total) {
			completedTotalConnectsQuery = true;
			statusResult.totalConnects = total;
		});

	});
}

function apiGetUserActivity(options, callback) {
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

	runQuery("SELECT ua.activity_date, ua.activity_type, ua.user_id, ua.marker_id, s.site_code FROM user_activity ua INNER JOIN sites s ON ua.site_id = s.id ORDER BY activity_date DESC LIMIT $1;",
		[options.maxRecords],
		null,
		function(err, activityResult) {
			if(err) {
				callback(err, null);
				return;
			}

			if(activityResult && activityResult.rowCount > 0) {

				var activity = [];

				for(var i = 0; i < activityResult.rowCount; i++) {
					var row = activityResult.rows[i];

					activity.push(new apiDm.ApiUserActivity(
						row.activity_date,
						row.activity_type,
						row.user_id,
						row.site_code,
						row.marker_id));
				}

				var result = {
					activity: activity
				};

				callback(err, result);
			} else {
				callback("No results returned from user_activity.", null);
			}
		}
	);
}

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
