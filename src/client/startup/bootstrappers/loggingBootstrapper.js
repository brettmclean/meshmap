meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.loggingBootstrapper = (function() {

	// imports
	var loggerFactory = meshmap.utils.logging.loggerFactory,
		EventBus = meshmap.events.EventBus,
		startupParametersService = meshmap.startup.startupParametersService;

	var eventBus = EventBus.instance;

	var loggerInstance = null;
	var logLevelOverride = null;

	var init = function() {
		loggerInstance = loggerFactory.create();
		loggerInstance.setAsSingletonInstance();

		determineLogLevelOverride();
		subscribeToEvents();
	};

	var determineLogLevelOverride = function() {
		var params = startupParametersService.getStartupParameters();
		if(params.log) {
			loggerInstance.setLogLevel(params.log);
			logLevelOverride = params.log;
		}
	};

	var subscribeToEvents = function() {
		eventBus.subscribe("configDownloaded", onConfigDownloaded);
	};

	var onConfigDownloaded = function(config) {
		var loggingCfg = config.logging;
		var level = logLevelOverride || (loggingCfg && loggingCfg.level);
		if(level) {
			loggerInstance.setLogLevel(level);
			loggerInstance.debug("Setting log level to \"" + level + "\".");
		}
	};

	return {
		init: init,
		ready: function() {}
	};

}());
