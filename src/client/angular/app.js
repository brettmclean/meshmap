(function() {

	meshmap.namespace("meshmap.angular");
	var mmAngular = meshmap.angular;

	mmAngular.app = angular.module("meshmap.app", [
		"meshmap.controllers",
		"meshmap.services",
		"meshmap.filters",
		"meshmap.directives"
	]);

	mmAngular.controllers = angular.module("meshmap.controllers", []);

	mmAngular.services = angular.module("meshmap.services", []);

	mmAngular.filters = angular.module("meshmap.filters", []);

	mmAngular.directives = angular.module("meshmap.directives", []);

	window.onload = function() {

		// imports
		var Logger = meshmap.utils.logging.Logger,
			bootstrapManager = meshmap.startup.bootstrapManager;

		mmAngular.app.run([
			function() {
				var logger = Logger.instance;
				logger.info("Starting application.");
				bootstrapManager.ready();
			}
		]);
		angular.bootstrap(document, ["meshmap.app"]);
	};

}());
