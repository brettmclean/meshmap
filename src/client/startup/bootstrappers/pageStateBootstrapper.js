meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.pageStateBootstrapper = (function() {

	// imports
	var PageStateService = meshmap.state.PageStateService,
		EventBus = meshmap.events.EventBus;

	var init = function() {
		var eventBus = EventBus.instance;

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
