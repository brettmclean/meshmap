meshmap.namespace("meshmap.settings");

meshmap.settings.SiteSettingsService = (function() {

	// imports
	var SettingsService = meshmap.settings.SettingsService;

	var SiteSettingsService = function(deps) {
		/* jshint unused:vars */
		SettingsService.apply(this, arguments);

		this._settingsType = "Site";
	};
	SiteSettingsService.prototype = Object.create(SettingsService.prototype);
	SiteSettingsService.prototype.constructor = SiteSettingsService;

	return SiteSettingsService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.settings.SiteSettingsService;
}
