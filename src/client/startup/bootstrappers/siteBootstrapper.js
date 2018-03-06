meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.siteBootstrapper = (function() {

	// imports
	var StateService = meshmap.state.StateService,
		SiteService = meshmap.state.SiteService,
		EventBus = meshmap.events.EventBus,
		extentUpdaterFactory = meshmap.map.factories.extentUpdaterFactory,
		CommsService = meshmap.utils.comms.CommsService;

	var init = function() {
		var extentUpdater = extentUpdaterFactory.create();

		var siteInstance = new SiteService({
			state: new StateService(),
			eventBus: EventBus.instance,
			extentUpdater: extentUpdater,
			comms: CommsService.instance
		});

		siteInstance.setAsSingletonInstance();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
