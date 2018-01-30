meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.siteBootstrapper = (function() {

	// imports
	var StateService = meshmap.state.StateService,
		SiteService = meshmap.state.SiteService,
		EventBus = meshmap.events.EventBus,
		ExtentUpdater = meshmap.map.ExtentUpdater,
		CommsService = meshmap.utils.comms.CommsService;

	var init = function() {
		var siteInstance = new SiteService({
			state: new StateService(),
			eventBus: EventBus.instance,
			extentUpdater: ExtentUpdater.instance,
			comms: CommsService.instance
		});

		siteInstance.setAsSingletonInstance();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
