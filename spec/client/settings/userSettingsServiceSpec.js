require("../testUtils/init");
var loader = require("../testUtils/loader");

var UserSettingsService = loader.load("settings/UserSettingsService"),
	CommsService = loader.load("utils/comms/CommsService"),
	dm = loader.load("model/datamodel"),
	SettingUpdate = dm.SettingUpdate;

var SETTING_NAME = "username";
var SETTING_VALUE = "John Smith";
var DIFFERENT_SETTING_VALUE = "Jane Smorsh";

var createUserSettingsServiceWithCommsService = function(comms) {
	return new UserSettingsService({
		commsService: comms
	});
};

describe("A User Settings Service", function() {

	it("sends updateUserSetting message when setting is updated", function() {
		var cs = new CommsService({}),
			us = createUserSettingsServiceWithCommsService(cs);

		us.saveValue(SETTING_NAME, SETTING_VALUE);
		spyOn(cs, "sendMessage");
		us.saveValue(SETTING_NAME, DIFFERENT_SETTING_VALUE);

		expect(cs.sendMessage).toHaveBeenCalledWith(
			"updateUserSetting",
			new SettingUpdate(SETTING_NAME, DIFFERENT_SETTING_VALUE));
	});

});
