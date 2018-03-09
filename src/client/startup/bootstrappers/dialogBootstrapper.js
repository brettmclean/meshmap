meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.dialogBootstrapper = (function() {

	// imports
	var eventBusFactory = meshmap.events.factories.eventBusFactory,
		DialogService = meshmap.ui.DialogService;

	var init = function() {
		var eventBus = eventBusFactory.create();

		var dialogService = new DialogService({
			eventBus: eventBus
		});
		dialogService.setAsSingletonInstance();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
