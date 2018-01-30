meshmap.angular.controllers.controller("FooterCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBus = meshmap.events.EventBus.instance;

			$scope.appName = null;
			$scope.version = "?";
			$scope.contactName = null;
			$scope.contactEmail = null;
			$scope.source = null;

			var subscribeToEvents = function() {
				eventBus.subscribe("configDownloaded", onConfigDownloaded);
			};

			var onConfigDownloaded = function(config) {
				var meta = meshmap.metadata;
				if(meta) {
					$scope.appName = meta.name;
					$scope.version = meta.version;

					var about = config.about;
					if(about) {
						if(about.contacts && about.contacts.length > 0) {
							var contact = about.contacts[0];
							$scope.contactName = contact.name;
							$scope.contactEmail = contact.email;
						}
						$scope.source = about.source;
					}
					$scope.$digest();
				}
			};

			subscribeToEvents();
		}
	]
);
