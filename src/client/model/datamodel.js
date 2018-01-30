(function() {

	var dm = {};

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

	dm.Message.CONNECT_INFO = "connectInfo";
	dm.Message.MAP_EVENT = "mapEvent";
	dm.Message.USER_EVENT = "userEvent";
	dm.Message.CHAT_MESSAGE = "chatMessage";
	dm.Message.ERROR = "error";
	dm.Message.UPDATE_SITE_SETTING = "updateSiteSetting";
	dm.Message.UPDATE_USER_SETTING = "updateUserSetting";

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
		this.markers = markers || [];
		this.users = userInfos || [];
		this.currUserId = currUserId;
		this.siteOwnerId = siteOwnerId;
		this.markerIcons = markerIcons || {};
		this.markerColors = markerColors || {};
		this.siteSettings = siteSettings || new dm.SiteSettings();
		this.userSettings = userSettings || new dm.UserSettings();
		this.state = state || new dm.UserSiteState();
	};

	dm.StartupData.parse = function(obj) {

		var parseObjectAsType = function(obj, type) {
			return type.parse(obj);
		};

		var parseCollectionAsType = function(collection, type) {
			return collection.map(function(item) {
				return parseObjectAsType(item, type);
			});
		};

		var sd = new dm.StartupData(
			parseCollectionAsType(obj.markers, dm.Marker),
			parseCollectionAsType(obj.users, dm.UserInfo),
			obj.currUserId,
			obj.siteOwnerId,
			obj.markerIcons,
			obj.markerColors,
			parseObjectAsType(obj.siteSettings, dm.SiteSettings),
			parseObjectAsType(obj.userSettings, dm.UserSettings),
			parseObjectAsType(obj.state, dm.UserSiteState)
		);

		sd.siteName = obj.siteName;
		sd.siteDescription = obj.siteDescription;
		sd.createDate = obj.createDate;

		return sd;
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
		this.initialExtent = null;

		if(settings) {
			this.onlyOwnerCanEdit = typeof settings.onlyOwnerCanEdit === "undefined" ? this.onlyOwnerCanEdit : settings.onlyOwnerCanEdit;
			this.initialExtent = typeof settings.initialExtent === "undefined" ? this.initialExtent : settings.initialExtent;
		}
	};

	dm.SiteSettings.parse = function(obj) {
		return new dm.SiteSettings({
			onlyOwnerCanEdit: obj.onlyOwnerCanEdit,
			initialExtent: dm.MapExtent.parse(obj.initialExtent)
		});
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

	dm.UserSettings.parse = function(obj) {
		return new dm.UserSettings(obj);
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

	dm.UserSiteState.parse = function(obj) {
		return new dm.UserSiteState({
			extent: dm.MapExtent.parse(obj.extent)
		});
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

	dm.UserEvent.parse = function(obj) {
		return new dm.UserEvent(obj.type, dm.UserInfo.parse(obj.data));
	};

	dm.UserEvent.USER_CONNECT = "userConnect";
	dm.UserEvent.USER_DISCONNECT = "userDisconnect";
	dm.UserEvent.USER_UPDATE = "userUpdate";

	/**
		Basic information about a user
		@this {UserInfo}
		@param {Number} id The user's ID
		@param {String} name The user's display name
	*/
	dm.UserInfo = function(id, name) {
		"use strict";
		this.id = id;
		this.name = name || "User " + this.id;
	};

	dm.UserInfo.parse = function(obj) {
		return new dm.UserInfo(obj.id, obj.name);
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

	dm.MapEvent.CHANGE_EXTENT = "changeExtent";
	dm.MapEvent.ADD_MARKER = "addMarker";
	dm.MapEvent.REMOVE_MARKER = "removeMarker";
	dm.MapEvent.UPDATE_MARKER = "updateMarker";

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
		if(!obj) {
			return null;
		}

		return new dm.MapExtent(
			new dm.Location(obj.min.lat, obj.min.lng),
			new dm.Location(obj.max.lat, obj.max.lng)
		);
	};

	dm.Marker = function(id) {
		this.id = id || null;
		this.ownerId = null;
		this.name = null;
		this.description = null;
	};

	dm.Marker.isPolygonMarker = function(obj) {
		return typeof obj.fillColorId !== "undefined";
	};

	dm.Marker.isPolylineMarker = function(obj) {
		return !dm.Marker.isPolygonMarker(obj) && typeof obj.lineColorId !== "undefined";
	};

	dm.Marker.isPointMarker = function(obj) {
		return !dm.Marker.isPolygonMarker(obj) && !dm.Marker.isPolylineMarker(obj);
	};

	dm.Marker.parse = function(obj) {
		var m = null;

		if(dm.Marker.isPolygonMarker(obj)) {
			m = dm.PolygonMarker.parse(obj);
		} else if(dm.Marker.isPolylineMarker(obj)) {
			m = dm.PolylineMarker.parse(obj);
		} else if(dm.Marker.isPointMarker(obj)) {
			m = dm.PointMarker.parse(obj);
		}

		if(m) {
			m.ownerId = obj.ownerId;
			m.name = obj.name;
			m.description = obj.description;
		}

		return m;
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
		dm.Marker.call(this, id);
		this.location = location || new dm.Location();
		this.iconId = iconId || 1;
	};
	dm.PointMarker.prototype = Object.create(dm.Marker.prototype);
	dm.PointMarker.prototype.constructor = dm.PointMarker;

	dm.PointMarker.parse = function(obj) {
		return new dm.PointMarker(obj.id, obj.location, obj.iconId);
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
		dm.Marker.call(this, id);
		this.locations = locations || [];
		this.lineColorId = colorId || 1;
		this.width = width || 1;
	};
	dm.PolylineMarker.prototype = Object.create(dm.Marker.prototype);
	dm.PolylineMarker.prototype.constructor = dm.PolylineMarker;

	dm.PolylineMarker.parse = function(obj) {
		return new dm.PolylineMarker(obj.id, obj.locations, obj.lineColorId, obj.width);
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
		dm.Marker.call(this, id);
		this.locations = locations || [];
		this.lineColorId = lineColorId || 1;
		this.fillColorId = fillColorId || 1;
		this.width = width || 1;
	};
	dm.PolygonMarker.prototype = Object.create(dm.Marker.prototype);
	dm.PolygonMarker.prototype.constructor = dm.PolygonMarker;

	dm.PolygonMarker.parse = function(obj) {
		return new dm.PolygonMarker(obj.id, obj.locations, obj.lineColorId, obj.fillColorId, obj.width);
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

	dm.SettingUpdate.USERNAME = "username";
	dm.SettingUpdate.ONLY_OWNER_CAN_EDIT = "onlyOwnerCanEdit";
	dm.SettingUpdate.SITE_NAME = "siteName";
	dm.SettingUpdate.SITE_DESCRIPTION = "siteDescription";

	meshmap.models = dm;

	/* istanbul ignore else  */
	if(typeof module !== "undefined" && module.exports) {
		module.exports = meshmap.models;
	}
})();
