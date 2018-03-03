meshmap.namespace("meshmap.state");

meshmap.state.SiteService = (function() {

	// imports
	var dm = meshmap.models,
		MapEvent = dm.MapEvent,
		MapExtent = dm.MapExtent,
		Location = dm.Location;

	var SiteService = function(deps) {
		this._state = deps.state;
		this._eventBus = deps.eventBus;
		this._extentUpdater = deps.extentUpdater;
		this._comms = deps.comms;
	};

	var fireEvent = function(eventName) {
		callEventBusPublish.call(this, [eventName]);
	};

	var fireEventWithArg = function(eventName, eventArg) {
		callEventBusPublish.call(this, [eventName, eventArg]);
	};

	var callEventBusPublish = function(publishArgs) {
		this._eventBus.publish.apply(this._eventBus, publishArgs);
	};

	var callExtentUpdaterSetExtent = function(extent) {
		this._extentUpdater.setExtent(extent);
	};

	var callCommsSendMessage = function(msgType, msgData) {
		this._comms.sendMessage(msgType, msgData);
	};

	SiteService.instance = null;

	SiteService.prototype.setName = function(siteName) {
		if(siteName === this._state.getSiteName()) {
			return;
		}

		this._state.setSiteName(siteName);
		fireEventWithArg.call(this, "siteNameChanged", siteName);

		/* istanbul ignore if */
		if(typeof document !== "undefined") {
			document.title = siteName ? siteName : document.title;
		}
	};

	SiteService.prototype.setDescription = function(siteDesc) {
		if(siteDesc === this._state.getSiteDescription()) {
			return;
		}

		this._state.setSiteDescription(siteDesc);
		fireEventWithArg.call(this, "siteDescriptionChanged", siteDesc);
	};

	SiteService.prototype.addUser = function(userInfo) {
		this._state.addUser(userInfo);
		fireEventWithArg.call(this, "userAdded", userInfo);
	};

	SiteService.prototype.getUsers = function() {
		return this._state.getUsers();
	};

	SiteService.prototype.setUsers = function(userInfos) {
		this._state.setUsers(userInfos);

		fireEvent.call(this, "usersCleared");
		for(var i = 0; i < userInfos.length; i++) {
			fireEventWithArg.call(this, "userAdded", userInfos[i]);
		}
	};

	SiteService.prototype.removeUser = function(userId) {
		var removed = this._state.removeUser(userId);
		if(removed) {
			fireEventWithArg.call(this, "userRemoved", removed);
		}
	};

	SiteService.prototype.updateUser = function(userInfo) {
		var self = this;
		var updateResults = this._state.updateUser(userInfo);
		var foundUserInfo = updateResults.updatedObj;

		if(foundUserInfo) {
			fireEventWithArg.call(this, "userUpdated", foundUserInfo);

			var changedFields = updateResults.changedFields;
			changedFields.forEach(function(changedField) {
				/* istanbul ignore else */
				if(changedField.name === "name") {
					var sysMsg = changedField.oldValue + " is now known as " + changedField.newValue + ".";
					fireEventWithArg.call(self, "systemMessageRequested", sysMsg);
				}
			});
		}
	};

	SiteService.prototype.setCurrentUserId = function(userId) {
		this._state.setCurrentUserId(userId);
		fireEventWithArg.call(this, "currentUserIdSet", userId);
	};

	SiteService.prototype.getCurrentUserId = function() {
		return this._state.getCurrentUserId();
	};

	SiteService.prototype.setOwnerUserId = function(ownerId) {
		this._state.setSiteOwnerId(ownerId);
		fireEventWithArg.call(this, "siteOwnerIdSet", ownerId);
	};

	SiteService.prototype.getOwnerUserId = function() {
		return this._state.getSiteOwnerId();
	};

	SiteService.prototype.setSiteSettings = function(siteSettings) {
		this._state.setSiteSettings(siteSettings);
	};

	SiteService.prototype.getSiteSettings = function() {
		return this._state.getSiteSettings();
	};

	SiteService.prototype.setUserSettings = function(userSettings) {
		this._state.setUserSettings(userSettings);
	};

	SiteService.prototype.getUserSettings = function() {
		return this._state.getUserSettings();
	};

	SiteService.prototype.getOnlyOwnerCanEdit = function() {
		var siteSettings = this.getSiteSettings();
		return siteSettings.onlyOwnerCanEdit;
	};

	SiteService.prototype.setOnlyOwnerCanEdit = function(onlyOwnerCanEdit) {
		var siteSettings = this.getSiteSettings();
		siteSettings.onlyOwnerCanEdit = onlyOwnerCanEdit;
	};

	SiteService.prototype.setMarkerIcons = function(miObj) {
		this._state.setMarkerIcons(miObj);
		fireEventWithArg.call(this, "markerIconsSet", miObj);
	};

	SiteService.prototype.setMarkerColors = function(mcObj) {
		this._state.setMarkerColors(mcObj);
		fireEventWithArg.call(this, "markerColorsSet", mcObj);
	};

	SiteService.prototype.setInitialExtent = function(extent) {
		if(!this._state.getExtent()) {
			if(!extent) {
				extent = new MapExtent(new Location(20,-140), new Location(60,-55));
			}
			this.setExtent(extent);
		}
	};

	SiteService.prototype.setExtent = function(extent) {
		this._state.setExtent(extent);
		fireEventWithArg.call(this, "extentChanged", extent);
		callExtentUpdaterSetExtent.call(this, extent);
	};

	SiteService.prototype.addMarker = function(marker) {
		this._state.addMarker(marker);
		fireEventWithArg.call(this, "markerAdded", marker);
	};

	SiteService.prototype.getMarkers = function() {
		return this._state.getMarkers();
	};

	SiteService.prototype.setMarkers = function(markers) {
		this._state.setMarkers(markers);

		fireEvent.call(this, "markersCleared");
		for(var i = 0; i < markers.length; i++) {
			fireEventWithArg.call(this, "markerAdded", markers[i]);
		}
	};

	SiteService.prototype.removeMarker = function(markerId) {
		var removed = this._state.removeMarker(markerId);
		if(removed) {
			fireEventWithArg.call(this, "markerRemoved", removed);
			callCommsSendMessage.call(this, "mapEvent", new MapEvent("removeMarker", removed.id));
		}
	};

	SiteService.prototype.updateMarker = function(marker) {
		var updateResults = this._state.updateMarker(marker);
		var foundMarker = updateResults.updatedObj;

		if(foundMarker) {
			callCommsSendMessage.call(this,
				"mapEvent",
				new dm.MapEvent("updateMarker", foundMarker));
		}
	};

	SiteService.prototype.updateMarkerFromRemoteChange = function(marker) {
		this._state.updateMarker(marker);
	};

	SiteService.prototype.setAsSingletonInstance = function() {
		SiteService.instance = this;
	};

	return SiteService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.state.SiteService;
}
