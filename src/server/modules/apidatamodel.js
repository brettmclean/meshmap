var store = null;
var os = require("os");
var ua = require("./useractivity");
var util = require("./util");
var version = require("./version");

/**
	A short summary about a particular site

	@constructor
	@this {ApiSiteSummary}
	@param {Site} site The Meshmap site
*/
var ApiSiteSummary = function(site) {
	"use strict";
	this.siteCode = site.siteCode; // String
	this.name = site.name; // String
	this.createDate = site.createDate.getTime();
	this.lastAccessDate = site.lastAccessDate.getTime();
	this.currentConnections = site.clients ? site.clients.length : 0;
};

/**
	Full information about a particular site

	@constructor
	@this {ApiSite}
	@param {Site} site The Meshmap site
*/
var ApiSite = function(site) {
	"use strict";

	if(!store) {
		store = require("./store");
	}

	this.siteCode = site.siteCode; // String
	this.name = site.name; // String
	this.ownerId = site.ownerId;

	if(site.settings && site.settings.initialExtent) {
		this.initialExtent = new ApiMapExtent(site.settings.initialExtent);
	}

	this.createDate = site.createDate.getTime();
	this.lastAccessDate = site.lastAccessDate.getTime();
	this.currentConnections = site.clients ? site.clients.length : 0;

	if(this.currentConnections > 0) {
		var connectedUsers = [];
		for(var i = 0; i < site.clients.length; i++) {
			connectedUsers.push(new ApiClient(site.clients[i]));
		}
		this.connectedUsers = connectedUsers;
	}

	var markers = [];
	for(var j = 0; j < site.markers.length; j++) {
		var marker = site.markers[j];
		var markerType = util.getMarkerType(marker);
		switch(markerType) {
			case util.MARKER_TYPE_POINT:
				markers.push(new ApiPointMarker(marker));
				break;
			case util.MARKER_TYPE_POLYLINE:
				markers.push(new ApiPolylineMarker(marker));
				break;
			case util.MARKER_TYPE_POLYGON:
				markers.push(new ApiPolygonMarker(marker));
				break;
			default:
				break;
		}
	}
	this.markers = markers;
	this.markerCount = markers.length;
};

/**
	Information about a particular connected client

	@constructor
	@this {ApiClient}
	@param {Client} client The client
*/
var ApiClient = function (client) {
	"use strict";

	this.id = client.user.id;
	this.name = client.user.name;
	this.ipAddress = client.ipAddress;
};

/**
	A short summary about a particular user

	@constructor
	@this {ApiUserSummary}
	@param {User} user The user
*/
var ApiUserSummary = function(user) {
	"use strict";

	this.id = user.id;
	this.name = user.name;
};

/**
	Information about a particular user

	@constructor
	@this {ApiUser}
	@param {User} user The user
	@param {String[]} siteCodes The set of site codes that this user is associated with
*/
var ApiUser = function(user, siteCodes) {
	"use strict";

	this.id = user.id;
	this.name = user.name;

	if(siteCodes) {
		this.siteCodes = siteCodes;
	}
};

/**
	Information about a particular point marker

	@constructor
	@this {ApiPointMarker}
	@param {PointMarker} marker The marker
*/
var ApiPointMarker = function(marker) {
	"use strict";

	this.id = marker.id;
	this.ownerId = marker.ownerId;
	this.name = marker.name;
	this.description = marker.description;
	this.location = new ApiLocation(marker.location);
	this.icon = store.markerIcons[marker.iconId];
};

/**
	Information about a particular polyline marker

	@constructor
	@this {ApiPolylineMarker}
	@param {PolylineMarker} marker The marker
*/
var ApiPolylineMarker = function(marker) {
	"use strict";

	var locations = [];
	for(var i = 0; i < marker.locations.length; i++) {
		locations.push(new ApiLocation(marker.locations[i]));
	}

	this.id = marker.id;
	this.ownerId = marker.ownerId;
	this.name = marker.name;
	this.description = marker.description;
	this.locations = locations;
	this.lineColor = store.markerColors[marker.lineColorId];
	this.width = marker.width;
};

/**
	Information about a particular polygon marker

	@constructor
	@this {ApiPolygonMarker}
	@param {PolygonMarker} marker The marker
*/
var ApiPolygonMarker = function(marker) {
	"use strict";

	var locations = [];
	for(var i = 0; i < marker.locations.length; i++) {
		locations.push(new ApiLocation(marker.locations[i]));
	}

	this.id = marker.id;
	this.ownerId = marker.ownerId;
	this.name = marker.name;
	this.description = marker.description;
	this.locations = locations;
	this.lineColor = store.markerColors[marker.lineColorId];
	this.fillColor = store.markerColors[marker.fillColorId];
	this.width = marker.width;
};

/**
	Information about a particular location on a map

	@constructor
	@this {ApiLocation}
	@param {Location} location The location
*/
var ApiLocation = function(location) {
	"use strict";

	this.lat = location.lat;
	this.lng = location.lng;
};

/**
	Information about a particular rectangle (extent) on a map

	@constructor
	@this {ApiMapExtent}
	@param {MapExtent} extent The map extent
*/
var ApiMapExtent = function(extent) {
	"use strict";

	this.min = new ApiLocation(extent.min);
	this.max = new ApiLocation(extent.max);
};

/**
	Information about the state of the Meshmap application

	@constructor
	@this {ApiStatus}
*/
var ApiStatus = function() {
	"use strict";

	this.totalCurrentConnections = null;
	this.totalSites = null;
	this.totalMarkers = null;
	this.totalUsers = null;
	this.totalConnects = null;

	this.avgMarkersPerSite = null;
	this.avgMarkersPerUser = null;

	this.sitesInMemory = null;

	this.heapUsedMb = Math.round((process.memoryUsage().heapUsed / 1048576));
	this.systemFreeMemMb = Math.round((os.freemem() / 1048576));
	this.systemTotalMemMb = Math.round((os.totalmem() / 1048576));

	if(os.platform() !== "win32") { // loadavg not supported on Windows
		var la = os.loadavg();
		this.systemLoad = la[0].toFixed(2) + ", " + la[1].toFixed(2) + ", " + la[2].toFixed(2);
	}

	this.appUptime = util.getNodeUptimeDisplay();

	if(version) {
		this.version = version;
	}
};

ApiStatus.prototype.populateAverages = function() {
	"use strict";

	var getAvg = function(a, b) {

		if(!a || !b) {
			return 0;
		}

		return parseFloat(( a / b ).toFixed(2));
	};

	this.avgMarkersPerSite = getAvg(this.totalMarkers, this.totalSites);
	this.avgMarkersPerUser = getAvg(this.totalMarkers, this.totalUsers);
};

/**
	Information about a particular logged activity

	@constructor
	@this {ApiUserActivity}
	@param {Date} date The date/time of the activity
	@param {Number} activityId The ID of the activity type
	@param {Number} userId The ID of the user involved in the activity
	@param {String} siteCode The code of the site the activity was associated width
	@param {Number} markerId The ID of the marker involved in the activity
*/
var ApiUserActivity = function(date, activityId, userId, siteCode, markerId) {
	"use strict";

	this.date = date.getTime();

	if(userId) {
		this.userId = userId;
	}

	this.activity = ua.getActivityCode(activityId);

	if(siteCode) {
		this.siteCode = siteCode;
	}
	if(markerId) {
		this.markerId = markerId;
	}
};

exports.ApiSiteSummary = ApiSiteSummary;
exports.ApiSite = ApiSite;
exports.ApiUserSummary = ApiUserSummary;
exports.ApiUser = ApiUser;
exports.ApiStatus = ApiStatus;
exports.ApiUserActivity = ApiUserActivity;
