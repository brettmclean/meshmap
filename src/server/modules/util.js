var mm = require("./meshmap");
var appConfigServiceFactory = require("./config/appConfigServiceFactory");

var MARKER_TYPE_POINT = "point";
var MARKER_TYPE_POLYLINE = "polyline";
var MARKER_TYPE_POLYGON = "polygon";

var SITE_CODE_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
var SITE_CODE_CHARS_REGEX = /^[0-9a-z]+$/;
var WEB_DIRECTORIES_REGEX = /^(css|js|images|html)$/;

var createSiteCode = function() {
	"use strict";

	var appConfig = appConfigServiceFactory.create().getAppConfig();

	// A site code is {siteCodeLength} characters from the SITE_CODE_CHARS array.
	var code = [];
	for(var i = 0; i < appConfig.siteCodeLength; i++) {
		code.push(SITE_CODE_CHARS.charAt(Math.floor(Math.random() * SITE_CODE_CHARS.length)));
	}

	return code.join("");
};

var isSiteCode = function(code) {
	"use strict";

	// Ensure site code has value and is a string
	if(!code || typeof code !== "string") {
		return false;
	}

	// Ensure site code doesn't match any reserved web directories
	if(WEB_DIRECTORIES_REGEX.test(code)) {
		return false;
	}

	// Ensure site code has only valid characters
	if(!SITE_CODE_CHARS_REGEX.test(code)) {
		return false;
	}

	return true;
};

var getMarkerType = function(marker) {
	"use strict";
	var result = null;

	if(marker) {
		if(marker.hasOwnProperty("fillColorId")) {
			result = MARKER_TYPE_POLYGON;
		} else if(marker.hasOwnProperty("lineColorId")) {
			result = MARKER_TYPE_POLYLINE;
		} else if(marker.hasOwnProperty("iconId")) {
			result = MARKER_TYPE_POINT;
		}
	}

	return result;
};

var getIpAddressFromHttpRequest = function(request) {
	"use strict";

	var ipAddress = null;

	if(request) {
		ipAddress = request.connection.remoteAddress;
		if(request &&
			request.headers &&
			request.headers["x-forwarded-for"]) {

			ipAddress = request.headers["x-forwarded-for"].split(",")[0];
		}
	}

	return ipAddress;
};

var getIpAddressFromSocketIoRequest = function(socket) {
	"use strict";

	var ipAddress = null;

	if(socket && socket.handshake) {
		ipAddress = socket.handshake.address.address;
		if(socket.handshake.headers && socket.handshake.headers["x-forwarded-for"]) {
			ipAddress = socket.handshake.headers["x-forwarded-for"].split(",")[0];
		}
	}

	return ipAddress;
};

var disconnectUsersFromIpAddress = function(ipAddress, possibleSites) {
	"use strict";

	var clientsFromIp = [];

	for(var i = 0; i < possibleSites.length; i++) {
		var site = possibleSites[i];
		for(var j = 0; j < site.clients.length; j++) {
			var client = site.clients[j];
			if(client.ipAddress === ipAddress) {
				clientsFromIp.push(client);
			}
		}
	}

	for(i = 0; i < clientsFromIp.length; i++) {
		mm.sendErrorMessage(clientsFromIp[i].connection, "You have been banned.");
		clientsFromIp[i].connection.disconnect();
	}
};

var isUserConnectedToSite = function(site, user) {
	"use strict";

	var userConnectedToSite = false;
	for(var i = 0; i < site.clients.length; i++) {
		if(site.clients[i].user.id === user.id &&
			site.clients[i].connection &&
			!site.clients[i].connection.disconnected) {
			userConnectedToSite = true;
			break;
		}
	}
	return userConnectedToSite;
};

var isUserSiteOwner = function(site, user) {
	"use strict";

	return site.ownerId && site.ownerId === user.id;
};

var canUserEditMarker = function(site, user, marker) {
	"use strict";

	var canEditMarker = !site.settings.onlyOwnerCanEdit;

	if(!canEditMarker) {
		var userId = user.id;
		canEditMarker = userId === marker.ownerId || userId === site.ownerId;
	}

	return canEditMarker;
};

var getNodeUptimeDisplay = function() {
	"use strict";

	var seconds = Math.floor(process.uptime());
	var days = Math.floor(seconds / 86400);
	seconds -= days * 86400;
	var hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	var minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;

	var result = "";

	result += days > 0 ? days + " days, " : "";
	result += result !== "" || hours > 0 ? hours + " hours, " : "";
	result += result !== "" || minutes > 0 ? minutes + " minutes, " : "";
	result += seconds + " seconds";

	return result;
};

exports.MARKER_TYPE_POINT = MARKER_TYPE_POINT;
exports.MARKER_TYPE_POLYLINE = MARKER_TYPE_POLYLINE;
exports.MARKER_TYPE_POLYGON = MARKER_TYPE_POLYGON;

exports.createSiteCode = createSiteCode;
exports.isSiteCode = isSiteCode;
exports.getMarkerType = getMarkerType;
exports.getIpAddressFromHttpRequest = getIpAddressFromHttpRequest;
exports.getIpAddressFromSocketIoRequest = getIpAddressFromSocketIoRequest;
exports.disconnectUsersFromIpAddress = disconnectUsersFromIpAddress;
exports.isUserConnectedToSite = isUserConnectedToSite;
exports.isUserSiteOwner = isUserSiteOwner;
exports.canUserEditMarker = canUserEditMarker;
exports.getNodeUptimeDisplay = getNodeUptimeDisplay;
