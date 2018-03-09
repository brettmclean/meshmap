meshmap.namespace("meshmap.utils");

meshmap.utils.configService = (function() {
	// imports
	var eventBusFactory = meshmap.events.factories.eventBusFactory,
		ajaxService = meshmap.utils.ajaxService;

	var eventBus = eventBusFactory.create();

	ajaxService.get(
		"/config.json",
		function(data) {
			var config = JSON.parse(data);
			eventBus.publishSticky("configDownloaded", config);
		});
}());
