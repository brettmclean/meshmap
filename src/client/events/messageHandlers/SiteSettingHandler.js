meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.SiteSettingHandler = (function() {

	// imports
	var dm = meshmap.models,
		SettingUpdate = dm.SettingUpdate;

	var SiteSettingHandler = function(deps) {
		deps = deps || {};

		this._siteService = deps.siteService || null;
	};

	var UPDATE_KEY_HANDLER_MAPPINGS = {};

	UPDATE_KEY_HANDLER_MAPPINGS[SettingUpdate.SITE_NAME] = function(settingUpdate) {
		if(this._siteService) {
			var siteName = settingUpdate.value;
			this._siteService.setName(siteName);
		}
	};

	UPDATE_KEY_HANDLER_MAPPINGS[SettingUpdate.SITE_DESCRIPTION] = function(settingUpdate) {
		if(this._siteService) {
			var siteDescription = settingUpdate.value;
			this._siteService.setDescription(siteDescription);
		}
	};

	UPDATE_KEY_HANDLER_MAPPINGS[SettingUpdate.ONLY_OWNER_CAN_EDIT] = function(settingUpdate) {
		if(this._siteService) {
			var onlyOwnerCanEdit = settingUpdate.value;
			this._siteService.setOnlyOwnerCanEdit(onlyOwnerCanEdit);
		}
	};

	SiteSettingHandler.prototype.handle = function(settingUpdate) {
		var handlerFunc = UPDATE_KEY_HANDLER_MAPPINGS[settingUpdate.key];

		if(typeof handlerFunc === "function") {
			handlerFunc.call(this, settingUpdate);
		}
	};

	return SiteSettingHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.SiteSettingHandler;
}
