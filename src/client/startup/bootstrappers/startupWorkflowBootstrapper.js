meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.startupWorkflowBootstrapper = (function() {

	// imports
	var EventBus = meshmap.events.EventBus,
		Logger = meshmap.utils.logging.Logger,
		StorageService = meshmap.utils.StorageService,
		CommsService = meshmap.utils.comms.CommsService,
		PageStateService = meshmap.state.PageStateService,
		SecretGenerator = meshmap.utils.SecretGenerator,
		StartupWorkflowService = meshmap.startup.StartupWorkflowService;

	var init = function() {
		var eventBus = EventBus.instance,
			logger = Logger.instance,
			commsService = CommsService.instance,
			pageStateService = PageStateService.instance,
			storageService = new StorageService(),
			secretGenerator = new SecretGenerator();

		var sws = new StartupWorkflowService({ // jshint ignore:line
			eventBus: eventBus,
			commsService: commsService,
			pageStateService: pageStateService,
			storageService: storageService,
			secretGenerator: secretGenerator,
			logger: logger
		});
	};

	return {
		init: init,
		ready: function() {}
	};

}());
