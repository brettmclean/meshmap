meshmap.namespace("meshmap.settings");

meshmap.settings.UserSettingsService = (function() {

	// imports
	var SettingsService = meshmap.settings.SettingsService;

	var UserSettingsService = function(deps) {
		/* jshint unused:vars */
		SettingsService.apply(this, arguments);

		this._settingsType = "User";
	};
	UserSettingsService.prototype = Object.create(SettingsService.prototype);
	UserSettingsService.prototype.constructor = UserSettingsService;

	return UserSettingsService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.settings.UserSettingsService;
}
