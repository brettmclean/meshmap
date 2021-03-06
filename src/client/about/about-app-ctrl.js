meshmap.angular.controllers.controller("AboutAppCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBusFactory = meshmap.events.factories.eventBusFactory;

			$scope.appName = null;
			$scope.description = null;
			$scope.version = null;
			$scope.license = [];
			$scope.contacts = [];
			$scope.source = null;

			var subscribeToEvents = function() {
				var eventBus = eventBusFactory.create();
				eventBus.subscribe("configDownloaded", onConfigDownloaded);
			};

			var onConfigDownloaded = function(config) {
				var meta = meshmap.metadata;
				if(meta) {
					$scope.appName = meta.name;
					$scope.description = meta.description;
					$scope.version = meta.version;
					$scope.license = meta.license;

					var about = config.about;
					if(about) {
						$scope.contacts = about.contacts;
						$scope.source = about.source;
					}
				}
			};

			subscribeToEvents();
		}
	]
);
