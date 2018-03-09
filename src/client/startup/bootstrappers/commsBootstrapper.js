meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.commsBootstrapper = (function() {

	// imports
	var commsProviderFactory = meshmap.utils.comms.commsProviderFactory,
		CommsService = meshmap.utils.comms.CommsService,
		Logger = meshmap.utils.logging.Logger,
		eventBusFactory = meshmap.events.factories.eventBusFactory;

	var service = null;

	var eventBus = eventBusFactory.create();

	var init = function() {
		var logger = Logger.instance;

		service = createService(logger, eventBus);
		service.setAsSingletonInstance();
	};

	var createService = function(logger, eventBus) {
		return new CommsService({
			logger: logger,
			eventBus: eventBus
		});
	};

	var ready = function() {
		subscribeToEvents();
	};

	var subscribeToEvents = function() {
		eventBus.subscribe("configDownloaded", onConfigDownloaded);
	};

	var onConfigDownloaded = function(config) {
		var srvConfig = config.mmServer;

		var host = window.location.hostname;
		var port = window.location.port || 80;

		if(srvConfig) {
			host = srvConfig.host ? srvConfig.host : host;
			port = srvConfig.port ? srvConfig.port : port;
		}

		startConnection(host, port);
	};

	var startConnection = function(host, port) {
		var provider = createProvider(host, port);
		service.setProvider(provider);
	};

	var createProvider = function(host, port) {
		return commsProviderFactory.create({
			host: host,
			port: port
		});
	};

	return {
		init: init,
		ready: ready
	};

}());
