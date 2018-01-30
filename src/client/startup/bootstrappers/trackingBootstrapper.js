meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.trackingBootstrapper = (function() {

	// imports
	var EventBus = meshmap.events.EventBus,
		Logger = meshmap.utils.logging.Logger,
		trackingProviderFactory = meshmap.tracking.trackingProviderFactory,
		TrackingService = meshmap.tracking.TrackingService;

	var eventBus = null;
	var logger = null;

	var init = function() {
		eventBus = EventBus.instance;
		logger = Logger.instance;
		subscribeToEvents();
	};

	var subscribeToEvents = function() {
		eventBus.subscribe("configDownloaded", onConfigDownloaded);
	};

	var onConfigDownloaded = function(config) {
		var trackingConfig = config.tracking;
		if(trackingConfig) {
			var trackingType = trackingConfig.type;
			var trackingId = trackingConfig.id;
			injectTracking(trackingType, trackingId);
		}
	};

	var injectTracking = function(trackingType, trackingId) {
		var trackingProvider = trackingProviderFactory.create(trackingType, trackingId);
		var trackingService = new TrackingService(trackingProvider);
		trackingService.injectTracking(document.body);

		logger.info("Initialized " + trackingProvider.getTrackingName() + ".");
	};

	return {
		init: init,
		ready: function() {}
	};

}());
