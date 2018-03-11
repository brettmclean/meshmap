meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.pageStateBootstrapper = (function() {

	// imports
	var pageStateServiceFactory = meshmap.state.factories.pageStateServiceFactory;

	var init = function() {
		var pageStateService = pageStateServiceFactory.create();
		pageStateService.init();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
