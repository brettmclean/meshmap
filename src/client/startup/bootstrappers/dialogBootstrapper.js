meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.dialogBootstrapper = (function() {

	// imports
	var EventBus = meshmap.events.EventBus,
		DialogService = meshmap.ui.DialogService;

	var init = function() {
		var eventBus = EventBus.instance;

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
