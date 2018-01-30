require("../testUtils/init");
var loader = require("../testUtils/loader");

var SettingsService = loader.load("settings/SettingsService"),
	CommsService = loader.load("utils/comms/CommsService"),
	dm = loader.load("model/datamodel"),
	SettingUpdate = dm.SettingUpdate;

var SETTING_NAME = "siteName";
var SETTING_VALUE = "My Map";
var DIFFERENT_SETTING_VALUE = "Owl Sightings";

var createSettingsService = function() {
	return new SettingsService();
};

var createSettingsServiceWithCommsService = function(comms) {
	return new SettingsService({
		comms: comms
	});
};

var verifyMethodExists = function(methodName) {
	var ss = createSettingsService();
	expect(typeof ss[methodName]).toBe("function");
};

describe("A Settings Service", function() {

	it("has a saveValue method",
		verifyMethodExists.bind(this, "saveValue"));

	it("can set and retrieve a value", function() {
		var ss = createSettingsService();
		var expected = SETTING_VALUE;

		ss.saveValue(SETTING_NAME, SETTING_VALUE);
		var actual = ss.getValue(SETTING_NAME);

		expect(actual).toBe(expected);
	});

	it("returns undefined for unassigned settings", function() {
		var ss = createSettingsService();

		var actual = ss.getValue(SETTING_NAME);

		expect(actual).toBe(undefined);
	});

	it("sends updateSetting message when setting is updated", function() {
		var cs = new CommsService(),
			ss = createSettingsServiceWithCommsService(cs);

		ss.saveValue(SETTING_NAME, SETTING_VALUE);
		spyOn(cs, "sendMessage");
		ss.saveValue(SETTING_NAME, DIFFERENT_SETTING_VALUE);

		expect(cs.sendMessage).toHaveBeenCalledWith(
			"updateSetting",
			new SettingUpdate(SETTING_NAME, DIFFERENT_SETTING_VALUE));
	});

	it("does not send updateSetting message when updated setting is unchanged", function() {
		var cs = new CommsService(),
			ss = createSettingsServiceWithCommsService(cs);

		ss.saveValue(SETTING_NAME, SETTING_VALUE);
		spyOn(cs, "sendMessage");
		ss.saveValue(SETTING_NAME, SETTING_VALUE);

		expect(cs.sendMessage).not.toHaveBeenCalled();
	});

	it("does not send updateSetting message when setting is first set", function() {
		var cs = new CommsService(),
			ss = createSettingsServiceWithCommsService(cs);

		spyOn(cs, "sendMessage");
		ss.saveValue(SETTING_NAME, SETTING_VALUE);

		expect(cs.sendMessage).not.toHaveBeenCalled();
	});

	it("emits settingChanged event when setting is changed", function(done) {
		var ss = createSettingsService();

		ss.saveValue(SETTING_NAME, SETTING_VALUE);
		ss.bind("settingChanged", function(settingName, settingValue) {
			expect(settingName).toBe(SETTING_NAME);
			expect(settingValue).toBe(DIFFERENT_SETTING_VALUE);
			done();
		});
		ss.saveValue(SETTING_NAME, DIFFERENT_SETTING_VALUE);
	});

	it("does not emit settingChanged event when setting is unchanged", function() {
		var ss = createSettingsService();

		ss.saveValue(SETTING_NAME, SETTING_VALUE);
		ss.bind("settingChanged", function(settingName, settingValue) {
			/* jshint unused:vars */
			fail("settingChanged should not be emitted when setting is unchanged");
		});
		ss.saveValue(SETTING_NAME, SETTING_VALUE);
	});

	it("does not emit settingChanged event when setting is first set", function() {
		var ss = createSettingsService();

		ss.bind("settingChanged", function(settingName, settingValue) {
			/* jshint unused:vars */
			fail("settingChanged should not be emitted when setting is first set");
		});
		ss.saveValue(SETTING_NAME, SETTING_VALUE);
	});

});
