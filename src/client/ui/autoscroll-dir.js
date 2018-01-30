meshmap.angular.directives.directive("mmAutoScroll",
	[
		function() {
			return function(scope, element, attr) {
				/* jshint unused:vars */

				// imports
				var logger = meshmap.utils.logging.Logger.instance;

				var scrollTo = "top";

				scope.$watch(
					function() {
						return element[0].scrollHeight;
					},
					function(newValue, oldValue) {
						/* jshint unused:vars */
						doScroll();
					}
				);

				var readElementAttrs = function() {
					var attrScrollTo = element.attr("mm-as-scroll-to");

					scrollTo = attrScrollTo ? attrScrollTo : scrollTo;

					if(scrollTo !== "top" && scrollTo !== "bottom") {
						logger.warn("mm-as-scroll-to attribute must be set to \"top\" or \"bottom\" (configured value: \"" + scrollTo + "\"). " +
							"Element will be not auto-scrolled.");
					}
				};

				var doScroll = function() {
					setTimeout(function() {
						var elem = element[0];
						if(scrollTo === "top") {
							elem.scrollTop = 0;
						} else if(scrollTo === "bottom") {
							elem.scrollTop = elem.scrollHeight;
						}
					}, 0);
				};

				readElementAttrs();
			};
		}
	]
);
