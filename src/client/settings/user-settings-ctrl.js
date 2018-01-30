meshmap.angular.controllers.controller("UserSettingsCtrl",
	[
		"$scope",
		"$timeout",
		function($scope, $timeout) {

			// imports
			var eventBus = meshmap.events.EventBus.instance,
				siteService = meshmap.state.SiteService.instance,
				commsService = meshmap.utils.comms.CommsService.instance,
				UserSettingsService = meshmap.settings.UserSettingsService;

			var SAVED_CHECKMARK_LENGTH_MS = 1500;

			var SETTING_KEYS = {
				USERNAME: "username",
				CONFIRM_MARKER_DELETION: "confirmMarkerDeletion"
			};

			$scope.settingValues = {};
			$scope.saving = {};

			for(var prop in SETTING_KEYS) {
				if(SETTING_KEYS.hasOwnProperty(prop)) {
					var keyName = SETTING_KEYS[prop];
					$scope.settingValues[keyName] = null;
					$scope.saving[keyName] = false;
				}
			}

			var myUserInfo = null;
			var settingsService = new UserSettingsService({
				comms: commsService
			});

			$scope.onInputKeyPress = function(e, settingName) {
				var isEnterKey = e.keyCode === 13;
				if(isEnterKey) {
					var func = $scope[settingName + "Save"];
					if(typeof func === "function") {
						func();
					}
					e.preventDefault();
				}
			};

			$scope.usernameSave = function() {
				var settingValue = $scope.settingValues.username;
				settingsService.saveValue(SETTING_KEYS.USERNAME, settingValue);
				myUserInfo.name = settingValue;
				setTimeout(function() {
					siteService.updateUser(myUserInfo);
				}, 0);
			};

			$scope.confirmMarkerDeletionSave = function() {
				var settingValue = $scope.settingValues.confirmMarkerDeletion;
				settingsService.saveValue(SETTING_KEYS.CONFIRM_MARKER_DELETION, settingValue);
				siteService.getUserSettings().confirmMarkerDeletion = settingValue;
			};

			var subscribeToEvents = function() {
				eventBus.subscribe("startupDataReceived", onStartupDataReceived);

				settingsService.bind("settingChanged", onSettingChanged);
			};

			var onStartupDataReceived = function(startupData) {
				var users = startupData.users;
				var foundUsers = users.filter(function(user) {
					return user.id === startupData.currUserId;
				});
				myUserInfo = foundUsers[0];
				setInitialValue(SETTING_KEYS.USERNAME, myUserInfo.name);

				var userSettings = startupData.userSettings;
				setInitialValue(SETTING_KEYS.CONFIRM_MARKER_DELETION, userSettings.confirmMarkerDeletion);
			};

			var setInitialValue = function(settingKey, settingValue) {
				$scope.settingValues[settingKey] = settingValue;
				settingsService.saveValue(settingKey, settingValue);
			};

			var onSettingChanged = function(settingName) {
				$scope.saving[settingName] = true;
				$timeout(function() {
					$scope.saving[settingName] = false;
				}, SAVED_CHECKMARK_LENGTH_MS);
			};

			subscribeToEvents();
		}
	]
);
