require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteSettingsService = loader.load("settings/SiteSettingsService"),
	CommsService = loader.load("utils/comms/CommsService"),
	dm = loader.load("model/datamodel"),
	SettingUpdate = dm.SettingUpdate;

var SETTING_NAME = "siteName";
var SETTING_VALUE = "My Map";
var DIFFERENT_SETTING_VALUE = "Owl Sightings";

var createSiteSettingsServiceWithCommsService = function(comms) {
	return new SiteSettingsService({
		comms: comms
	});
};

describe("A Site Settings Service", function() {

	it("sends updateSiteSetting message when setting is updated", function() {
		var cs = new CommsService({}),
			ss = createSiteSettingsServiceWithCommsService(cs);

		ss.saveValue(SETTING_NAME, SETTING_VALUE);
		spyOn(cs, "sendMessage");
		ss.saveValue(SETTING_NAME, DIFFERENT_SETTING_VALUE);

		expect(cs.sendMessage).toHaveBeenCalledWith(
			"updateSiteSetting",
			new SettingUpdate(SETTING_NAME, DIFFERENT_SETTING_VALUE));
	});

});
