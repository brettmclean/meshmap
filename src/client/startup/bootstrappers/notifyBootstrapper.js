meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.notifyBootstrapper = (function() {

	// imports
	var SiteService = meshmap.state.SiteService,
		eventBusFactory = meshmap.events.factories.eventBusFactory,
		NotifyService = meshmap.ui.NotifyService;

	var init = function() {
		var eventBus = eventBusFactory.create();
		var siteService = SiteService.instance;

		// jshint unused: false
		var notifyService = new NotifyService({
			eventBus: eventBus,
			siteService: siteService
		});
	};

	return {
		init: init,
		ready: function() {}
	};

}());
