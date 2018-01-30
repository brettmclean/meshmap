meshmap.angular.directives.directive("mmMap",
	[
		"Map",
		function(Map) {

			var link = function(scope, element, attrs) {
				/* jshint unused:vars */
				Map.setMapElement(element[0]);
				Map.setSelectMarkerElement(buildSelectMarkerElement(), scope);
				Map.setMarkerInfoElement(buildMarkerInfoElement());
			};

			var buildSelectMarkerElement = function() {
				var elem = angular.element("<div>");
				elem.attr("ng-controller", "SelectMarkerCtrl");
				elem.attr("ng-include", "'html/partials/selectmarker.html'");
				return elem[0];
			};

			var buildMarkerInfoElement = function() {
				var elem = angular.element("<div>");
				elem.attr("ng-controller", "MarkerInfoCtrl");
				elem.attr("ng-include", "'html/partials/markerinfo.html'");
				return elem[0];
			};

			return {
				link: link
			};
		}
	]
);
