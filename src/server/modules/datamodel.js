var dm = {};

/* Server objects */

/**
	A Meshmap site

	@constructor
	@this {Site}
*/
dm.Site = function() {
	"use strict";

	this.id = null; // Number
	this.siteCode = null; // String
	this.name = null; // String
	this.description = null; // String
	this.ownerId = null; // Number
	this.markers = []; // (PointMarker|PolylineMarker|PolygonMarker)[]
	this.clients = []; // Tracks clients which are currently connected.

	this.settings = new dm.SiteSettings();

	this.createDate = null; /* Date */
	this.lastAccessDate = null; /* Date */
};

/**
	Information about a user in relation to a specific site they are currently connected to

	@constructor
	@this {Client}
	@param {Socket} socket The socket the user is connected through
	@param {String} ipAddress The IP address the user is connecting from
	@param {User} user User information
	@param {UserSiteState} state Information about the user in this particular site
*/
dm.Client = function(socket, ipAddress, user, state) {
	"use strict";

	this.connection = socket;
	this.ipAddress = ipAddress;
	this.extent = null;
	this.user = user;
	this.state = state;
};

/**
	Information about a specific user

	@constructor
	@this {User}
	@param {String} secret The secret string which identifies this user
*/
dm.User = function(secret) {
	"use strict";

	this.id = 0; /* Number */
	this.name = null; /* String */
	this.secret = secret; /* String */
	this.email = null; /* String */

	this.settings = new dm.UserSettings();

	this.toUserInfo = function() {
		return new dm.UserInfo(this.id, this.name);
	};
};

/**
	A message between the client and server

	@constructor
	@this {Message}
	@param {String} messageType The type of message being sent
	@param {(ConnectInfo|MapEvent|UserEvent|ChatMessage|String)} messageData The data being sent
*/
dm.Message = function(messageType, messageData) {
	"use strict";
	// Possible values: connectInfo, mapEvent, userEvent, chatMessage, error, updateSiteSetting, updateUserSetting
	this.type = messageType;
	this.data = messageData;
};

/**
	Information used to connect a user to a site

	@constructor
	@this {ConnectInfo}
	@param {String} siteCode The site code the user wants to connect to
	@param {String} secret The secret string which identifies this user
*/
dm.ConnectInfo = function(siteCode, secret) {
	"use strict";
	this.siteCode = siteCode || null;
	this.secret = secret || null;
};

/**
	Information used when a new user connects for the first time
	@this {NewUserInfo}
	@param {String} name The user's displayed name
	@param {String} [email] The user's email
*/
dm.NewUserInfo = function(name, email) {
	"use strict";
	this.name = name;
	this.email = email || null;
};

/**
	Information used when creating a new site
	@this {NewSiteInfo}
	@param {String} siteName The name of the new site
*/
dm.NewSiteInfo = function(siteName) {
	"use strict";
	this.name = siteName;
};

/**
	Information sent to a user when they connect to a site
	@this {StartupData}
	@param {(PointMarker|PolylineMarker|PolygonMarker)[]} markers The set of markers in the site
	@param {UserInfo[]} userInfos Info about all currently connected users
	@param {Number} currUserId The ID of the connecting user
	@param {Number} siteOwnerId The ID of the user who owns this site
	@param {Object} markerIcons A dictionary of icon IDs and image URLs
	@param {Object} markerColors A dictionary of line/fill colors IDs and their hex color codes
	@param {SiteSettings} siteSettings This site's settings
	@param {UserSettings} userSettings The user's settings
	@param {UserSiteState} state The user's state on this particular site
*/
dm.StartupData = function(
	markers,
	userInfos,
	currUserId,
	siteOwnerId,
	markerIcons,
	markerColors,
	siteSettings,
	userSettings,
	state) {
	"use strict";
	this.siteName = null;
	this.siteDescription = null;
	this.createDate = null;
	this.markers = markers;
	this.users = userInfos || [];
	this.currUserId = currUserId;
	this.siteOwnerId = siteOwnerId;
	this.markerIcons = markerIcons || {};
	this.markerColors = markerColors || {};
	this.siteSettings = siteSettings || new dm.SiteSettings();
	this.userSettings = userSettings || new dm.UserSettings();
	this.state = state || new dm.UserSiteState();
};

/**
	Settings for this particular site
	@this {SiteSettings}
	@param {Object} [settings] The settings object
	@param {Boolean} [settings.onlyOwnerCanEdit] Whether only the owner/creator of a marker can remove or edit it
	@param {MapExtent} [settings.initialExtent] The initial extent of the map for new users
*/
dm.SiteSettings = function(settings) {
	"use strict";

	this.onlyOwnerCanEdit = false; // If true, only the owner/creator of a marker can remove or edit its properties
	this.initialExtent = null; // MapExtent

	if(settings) {
		this.onlyOwnerCanEdit = typeof settings.onlyOwnerCanEdit === "undefined" ? this.onlyOwnerCanEdit : settings.onlyOwnerCanEdit;
		this.initialExtent = typeof settings.initialExtent === "undefined" ? this.initialExtent : settings.initialExtent;
	}
};

/**
	Settings for this user
	@this {UserSettings}
	@param {Object} [settings] The settings object
	@param {Boolean} [settings.confirmMarkerDeletion] Whether to confirm before deleting a marker
*/
dm.UserSettings = function(settings) {
	"use strict";

	this.confirmMarkerDeletion = true;

	if(settings) {
		this.confirmMarkerDeletion = typeof settings.confirmMarkerDeletion === "undefined" ? this.confirmMarkerDeletion : settings.confirmMarkerDeletion;
	}
};

/**
	The user's state on a particular site
	@this {UserSiteState}
	@param {Object} [state] The state object
	@param {MapExtent} [state.extent] The user's extent on this map
*/
dm.UserSiteState = function(state) {
	"use strict";

	this.extent = null;

	if(state) {
		this.extent = typeof state.extent === "undefined" ? this.extent : state.extent;
	}
};

/**
	Used to communicate that something about a user has changed/happened
	@this {UserEvent}
	@param {String} eventType The type of user event
	@param {UserInfo} eventData User-related information
*/
dm.UserEvent = function(eventType, eventData) {
	"use strict";

	// Possible values: userConnect, userDisconnect, userUpdate
	this.type = eventType;
	this.data = eventData;
};

/**
	Basic information about a user
	@this {UserInfo}
	@param {Number} id The user's ID
	@param {String} name The user's display name
*/
dm.UserInfo = function(/* Number */ id, /* String */ name) {
	"use strict";
	this.id = id;
	this.name = name || "User " + this.id;
};

/**
	Used to communicate that something about the map has changed/happened
	@this {MapEvent}
	@param {String} eventType The type of map event
	@param {(MapExtent|PointMarker|PolylineMarker|PolygonMarker|Number)} eventData Event-related information
*/
dm.MapEvent = function(eventType, eventData) {
	"use strict";

	// Possible values: changeExtent, addMarker, removeMarker, updateMarker
	this.type = eventType;
	this.data = eventData;
};

/**
	A rectangular area on a map
	@this {MapExtent}
	@param {Location} min The minimum corner of this rectangle
	@param {Location} max The maximum corner of this rectangle
*/
dm.MapExtent = function(min, max) {
	"use strict";
	this.min = min || new dm.Location();
	this.max = max || new dm.Location();
};

dm.MapExtent.parse = function(obj) {
	"use strict";
	return new dm.MapExtent(
		new dm.Location(obj.min.lat, obj.min.lng),
		new dm.Location(obj.max.lat, obj.max.lng)
	);
};

/**
	A marker at a single point on a map
	@this {PointMarker}
	@param {Number} id The ID of this marker
	@param {Location} location The point on the map this marker occupies
	@param {Number} iconId The ID of the icon to display for this point
*/
dm.PointMarker = function(id, location, iconId) {
	"use strict";
	this.id = id || null;
	this.ownerId = null;
	this.name = null;
	this.description = null;
	this.location = location || new dm.Location();
	this.iconId = iconId || 1;
};

/**
	A multi-segment line on a map
	@this {PolylineMarker}
	@param {Number} id The ID of this marker
	@param {Location[]} location The points on the map that make up the line's segments
	@param {Number} color The ID of the line's color
	@param {Number} width	The width of the line
*/
dm.PolylineMarker = function(id, locations, colorId, width) {
	"use strict";
	this.id = id || null;
	this.ownerId = null;
	this.name = null;
	this.description = null;
	this.locations = locations || [];
	this.lineColorId = colorId || 1;
	this.width = width || 1;
};

/**
	A polygon area on a map
	@this {PolygonMarker}
	@param {Number} id The ID of this marker
	@param {Location[]} locations The points on the map that make up this polygon's edges
	@param {Number} lineColorId The ID of the polygon's line color
	@param {Number} fillColorId The ID of the polygon's fill color
	@param {Number} width	The width of the polygon's line
*/
dm.PolygonMarker = function(id, locations, lineColorId, fillColorId, width) {
	"use strict";
	this.id = id || null;
	this.ownerId = null;
	this.name = null;
	this.description = null;
	this.locations = locations || [];
	this.lineColorId = lineColorId || 1;
	this.fillColorId = fillColorId || 1;
	this.width = width || 1;
};

/**
	A point on the Earth described by latitude/longtiude
	@this {Location}
	@param {Number} lat The latitude (between -90 and 90)
	@param {Number} lng The longitude (between -180 and 180)
*/
dm.Location = function(lat, lng) {
	"use strict";
	this.lat = lat || 0;
	this.lng = lng || 0;
};

/**
	A chat message sent to other users
	@this {ChatMessage}
	@param {String} text The message
*/
dm.ChatMessage = function(/* String */ text) {
	"use strict";
	this.userId = null;
	this.text = text;
	this.date = null;
};

/**
	Information that a user has changed a user or map setting
	@this {SettingUpdate}
	@param {String} settingKey The name of the setting
	@param {(String|Number|Boolean)} settingValue The new value of the setting
*/
dm.SettingUpdate = function(settingKey, settingValue) {
	"use strict";
	// Possible values: username, onlyOwnerCanEdit, siteName
	this.key = settingKey;
	this.value = settingValue;
};

module.exports = dm;
