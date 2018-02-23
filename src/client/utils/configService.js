meshmap.namespace("meshmap.utils");

meshmap.utils.configService = (function() {
	// imports
	var EventBus = meshmap.events.EventBus,
		ajaxService = meshmap.utils.ajaxService;

	var eventBus = EventBus.instance;

	ajaxService.get(
		"/config.json",
		function(data) {
			var config = JSON.parse(data);
			eventBus.publishSticky("configDownloaded", config);
		});
}());
