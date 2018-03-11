meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.startupWorkflowBootstrapper = (function() {

	// imports
	var eventBusFactory = meshmap.events.factories.eventBusFactory,
		pageStateServiceFactory = meshmap.state.factories.pageStateServiceFactory,
		Logger = meshmap.utils.logging.Logger,
		StorageService = meshmap.utils.StorageService,
		CommsService = meshmap.utils.comms.CommsService,
		SecretGenerator = meshmap.utils.SecretGenerator,
		StartupWorkflowService = meshmap.startup.StartupWorkflowService;

	var init = function() {
		var eventBus = eventBusFactory.create(),
			logger = Logger.instance,
			commsService = CommsService.instance,
			pageStateService = pageStateServiceFactory.create(),
			storageService = new StorageService(),
			secretGenerator = new SecretGenerator();

		var sws = new StartupWorkflowService({
			eventBus: eventBus,
			commsService: commsService,
			pageStateService: pageStateService,
			storageService: storageService,
			secretGenerator: secretGenerator,
			logger: logger
		});
		sws.init();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
