meshmap.angular.controllers.controller("AboutMapCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBus = meshmap.events.EventBus.instance;

			$scope.siteName = null;
			$scope.siteDescription = null;
			$scope.siteCreateDate = null;

			var subscribeToEvents = function() {
				eventBus.subscribe("siteNameChanged", onSiteNameChanged);
				eventBus.subscribe("siteDescriptionChanged", onSiteDescriptionChanged);
				eventBus.subscribe("startupDataReceived", onStartupDataReceived);
			};

			var onSiteNameChanged = function(/* String */ newSiteName) {
				$scope.$apply(function() {
					$scope.siteName = newSiteName;
				});
			};

			var onSiteDescriptionChanged = function(/* String */ newSiteDescription) {
				$scope.$apply(function() {
					$scope.siteDescription = newSiteDescription;
				});
			};

			var onStartupDataReceived = function(/* StartupData */ startupData) {
				$scope.siteName = startupData.siteName;
				$scope.siteDescription = startupData.siteDescription;
				$scope.siteCreateDate = startupData.createDate;
			};

			subscribeToEvents();
		}
	]
);
