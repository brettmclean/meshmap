meshmap.angular.controllers.controller("SiteSettingsCtrl",
	[
		"$scope",
		"$timeout",
		function($scope, $timeout) {

			// imports
			var eventBus = meshmap.events.EventBus.instance,
				siteService = meshmap.state.SiteService.instance,
				commsService = meshmap.utils.comms.CommsService.instance,
				SiteSettingsService = meshmap.settings.SiteSettingsService;

			var SAVED_CHECKMARK_LENGTH_MS = 1500;

			var SETTING_KEYS = {
				ONLY_OWNER_CAN_EDIT: "onlyOwnerCanEdit",
				SITE_NAME: "siteName",
				SITE_DESCRIPTION: "siteDescription",
				INITIAL_EXTENT: "initialExtent"
			};

			$scope.settingValues = {};
			$scope.saving = {};
			$scope.settingAvailability = {};

			for(var prop in SETTING_KEYS) {
				if(SETTING_KEYS.hasOwnProperty(prop)) {
					var keyName = SETTING_KEYS[prop];
					$scope.settingValues[keyName] = null;
					$scope.saving[keyName] = false;
					$scope.settingAvailability[keyName] = true;
				}
			}

			var lastKnownMapExtent = null;
			var settingsService = new SiteSettingsService({
				commsService: commsService
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

			$scope.onlyOwnerCanEditSave = function() {
				var settingValue = $scope.settingValues.onlyOwnerCanEdit;
				setTimeout(function() {
					settingsService.saveValue(SETTING_KEYS.ONLY_OWNER_CAN_EDIT, settingValue);
					siteService.setOnlyOwnerCanEdit(settingValue);
				}, 0);
			};

			$scope.siteNameSave = function() {
				var settingValue = $scope.settingValues.siteName;
				setTimeout(function() {
					settingsService.saveValue(SETTING_KEYS.SITE_NAME, settingValue);
					siteService.setName(settingValue);
				}, 0);
			};

			$scope.siteDescriptionSave = function() {
				var settingValue = $scope.settingValues.siteDescription;
				setTimeout(function() {
					settingsService.saveValue(SETTING_KEYS.SITE_DESCRIPTION, settingValue);
					siteService.setDescription(settingValue);
				}, 0);
			};

			$scope.initialExtentSave = function() {
				var settingValue = lastKnownMapExtent;
				settingsService.saveValue(SETTING_KEYS.INITIAL_EXTENT, settingValue);
				$scope.settingAvailability[SETTING_KEYS.INITIAL_EXTENT] = false;
			};

			var subscribeToEvents = function() {
				eventBus.subscribe("extentChanged", onExtentChanged);
				eventBus.subscribe("startupDataReceived", onStartupDataReceived);

				settingsService.bind("settingChanged", onSettingChanged);
			};

			var onExtentChanged = function(mapExtent) {
				lastKnownMapExtent = mapExtent;
				$scope.settingAvailability[SETTING_KEYS.INITIAL_EXTENT] = true;
			};

			var onStartupDataReceived = function(startupData) {
				setInitialValue(SETTING_KEYS.SITE_NAME, startupData.siteName);
				setInitialValue(SETTING_KEYS.SITE_DESCRIPTION, startupData.siteDescription);

				var siteSettings = startupData.siteSettings;
				setInitialValue(SETTING_KEYS.ONLY_OWNER_CAN_EDIT, siteSettings.onlyOwnerCanEdit);
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
