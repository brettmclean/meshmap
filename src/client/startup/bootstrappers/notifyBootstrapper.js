meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.notifyBootstrapper = (function() {

	// imports
	var SiteService = meshmap.state.SiteService,
		EventBus = meshmap.events.EventBus,
		NotifyService = meshmap.ui.NotifyService;

	var init = function() {
		var eventBus = EventBus.instance;
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
