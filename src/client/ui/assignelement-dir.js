meshmap.angular.directives.directive("mmAssignElement",
	[
		function() {

			var handleElement = function(scope, element, attr) {
				/* jshint unused:vars */
				if(typeof scope.assignElemFunc === "function") {
					scope.assignElemFunc(element[0]);
				}
			};

			return {
				restrict: "A",
				link: handleElement,
				scope: {
					assignElemFunc: "=mmAssignElement"
				}
			};
		}
	]
);
