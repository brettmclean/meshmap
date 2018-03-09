meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.pageStateBootstrapper = (function() {

	// imports
	var PageStateService = meshmap.state.PageStateService,
		eventBusFactory = meshmap.events.factories.eventBusFactory;

	var init = function() {
		var eventBus = eventBusFactory.create();

		var pageStateService = new PageStateService({
			eventBus: eventBus
		});
		pageStateService.init();
		pageStateService.setAsSingletonInstance();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
