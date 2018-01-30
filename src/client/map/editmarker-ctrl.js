meshmap.angular.controllers.controller("EditMarkerNewCtrl",
	[
		"$scope",
		function($scope) {
			/*
				Available from parent scope:
				$scope.marker: PointMarker|PolylineMarker|PolygonMarker
				$scope.data.name: String
				$scope.data.description: String
			*/

			$scope.validationMsgs = {
				name: null
			};

			if($scope.funcs) {
				$scope.funcs.isValid = function() {
					var isValid = !!$scope.data.name;
					$scope.validationMsgs.name = isValid ? null : "You must enter a name.";
					return isValid;
				};
			}

			var subscribeToEvents = function() {

			};

			subscribeToEvents();
		}
	]
);
