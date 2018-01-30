meshmap.angular.controllers.controller("MapCtrl",
	[
		"$scope",
		"$compile",
		"Map",
		function($scope, $compile, Map) {

			// imports
			var eventBus = meshmap.events.EventBus.instance,
				layoutService = meshmap.ui.layoutService;

			var layout = "";
			var windowHeight = 0;

			$scope.styles = {
				map: {
					height: "0px",
					top: "0px"
				}
			};

			var subscribeToEvents = function() {
				eventBus.subscribe("layoutChanged", onLayoutChange);
				eventBus.subscribe("windowHeightChanged", onWindowHeightChange);
			};

			var onLayoutChange = function(/* String */ layoutType) {
				layout = layoutType;
				updateMapHeight();
			};

			var onWindowHeightChange = function(/* Number */ height) {
				windowHeight = height;
				updateMapHeight();
			};

			var updateMapHeight = function() {
				if(windowHeight <= 0) {
					return;
				}

				var mapHeight = windowHeight;
				var mapTop = layout === "small" ? layoutService.TOOLBAR_HEIGHT : 0;
				mapHeight -= mapTop;
				$scope.$apply(function() {
					$scope.styles.map.height = mapHeight + "px";
					$scope.styles.map.top = mapTop + "px";
				});
				Map.updateMapHeight(mapHeight);

				eventBus.publish("mapHeightChanged", mapHeight);
			};

			setTimeout(function() {
				subscribeToEvents();
			}, 0);
		}
	]
);
