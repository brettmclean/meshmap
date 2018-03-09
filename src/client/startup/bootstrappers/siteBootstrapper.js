meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.siteBootstrapper = (function() {

	// imports
	var StateService = meshmap.state.StateService,
		SiteService = meshmap.state.SiteService,
		eventBusFactory = meshmap.events.factories.eventBusFactory,
		extentUpdaterFactory = meshmap.map.factories.extentUpdaterFactory,
		CommsService = meshmap.utils.comms.CommsService;

	var init = function() {
		var extentUpdater = extentUpdaterFactory.create();
		var eventBus = eventBusFactory.create();

		var siteInstance = new SiteService({
			state: new StateService(),
			eventBus: eventBus,
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
