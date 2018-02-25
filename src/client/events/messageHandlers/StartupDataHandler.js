meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.StartupDataHandler = (function() {

	var StartupDataHandler = function(deps) {
		this._siteService = deps.siteService;
	};

	StartupDataHandler.prototype.handle = function(startupData) {
		this._siteService.setName(startupData.siteName);
		this._siteService.setDescription(startupData.siteDescription);
		this._siteService.setMarkers(startupData.markers);
		this._siteService.setUsers(startupData.users);
		this._siteService.setCurrentUserId(startupData.currUserId);
		this._siteService.setOwnerUserId(startupData.siteOwnerId);
		this._siteService.setInitialExtent(startupData.state.extent || startupData.siteSettings.initialExtent);
		this._siteService.setMarkerIcons(startupData.markerIcons);
		this._siteService.setMarkerColors(startupData.markerColors);
		this._siteService.setSiteSettings(startupData.siteSettings);
		this._siteService.setUserSettings(startupData.userSettings);
	};

	return StartupDataHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.StartupDataHandler;
}
