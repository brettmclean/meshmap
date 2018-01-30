meshmap.namespace("meshmap.settings");

meshmap.settings.SettingsService = (function() {

	// imports
	var dm = meshmap.models,
		SettingUpdate = dm.SettingUpdate,
		observable = MicroEvent.mixin;

	var SettingsService = function(deps) {
		deps = deps || /* istanbul ignore next */ {};

		this._comms = deps.comms || null;

		this._fieldValues = {};
		this._settingsType = "";
	};

	var callCommsSendMessage = function(msgType, msgData) {
		if(this._comms) {
			this._comms.sendMessage(msgType, msgData);
		}
	};

	SettingsService.prototype.saveValue = function(settingName, settingValue) {
		var fieldValue = this._fieldValues[settingName];
		if(!fieldValue) {
			fieldValue = this._fieldValues[settingName] = new FieldValue(settingValue, settingValue);
		}
		fieldValue.update(settingValue);

		if(fieldValue.hasChanged()) {
			callCommsSendMessage.call(this,
				"update" + this._settingsType + "Setting",
				new SettingUpdate(settingName, settingValue));
			this.trigger("settingChanged", settingName, settingValue);
		}
	};

	SettingsService.prototype.getValue = function(settingName) {
		var fieldValue = this._fieldValues[settingName];
		return fieldValue && fieldValue.curr;
	};

	var FieldValue = SettingsService.FieldValue = function(old, curr) {
		this.old = old;
		this.curr = curr;
	};

	FieldValue.prototype.update = function(newValue) {
		this.old = this.curr;
		this.curr = newValue;
	};

	FieldValue.prototype.hasChanged = function() {
		return this.old !== this.curr;
	};

	observable(SettingsService.prototype);

	return SettingsService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.settings.SettingsService;
}
