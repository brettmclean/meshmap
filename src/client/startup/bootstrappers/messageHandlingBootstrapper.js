meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.messageHandlingBootstrapper = (function() {

	// imports
	var EventBus = meshmap.events.EventBus,
		Logger = meshmap.utils.logging.Logger,
		CommsService = meshmap.utils.comms.CommsService,
		ExtentUpdater = meshmap.map.ExtentUpdater,
		SiteService = meshmap.state.SiteService,
		DialogService = meshmap.ui.DialogService,
		StartupDataHandler = meshmap.events.messageHandlers.StartupDataHandler,
		ConnectionHandler = meshmap.events.messageHandlers.ConnectionHandler,
		PageUnloadHandler = meshmap.events.messageHandlers.PageUnloadHandler,
		MapEventHandler = meshmap.events.messageHandlers.MapEventHandler,
		UserEventHandler = meshmap.events.messageHandlers.UserEventHandler,
		ChatMessageHandler = meshmap.events.messageHandlers.ChatMessageHandler,
		ErrorMessageHandler = meshmap.events.messageHandlers.ErrorMessageHandler,
		SiteSettingHandler = meshmap.events.messageHandlers.SiteSettingHandler,
		MessageHandlingService = meshmap.events.MessageHandlingService;

	var init = function() {
		var eventBus = EventBus.instance,
			logger = Logger.instance,
			commsService = CommsService.instance,
			extentUpdater = ExtentUpdater.instance,
			siteService = SiteService.instance,
			dialogService = DialogService.instance;

		var startupDataHandler = new StartupDataHandler({
			siteService: siteService
		});

		var connectionHandler = new ConnectionHandler({
			dialogService: dialogService,
			commsService: commsService
		});

		var pageUnloadHandler = new PageUnloadHandler({
			extentUpdater: extentUpdater
		});

		var mapEventHandler = new MapEventHandler({
			siteService: siteService
		});

		var userEventHandler = new UserEventHandler({
			siteService: siteService,
			eventBus: eventBus
		});

		var chatMessageHandler = new ChatMessageHandler({
			eventBus: eventBus
		});

		var errorMessageHandler = new ErrorMessageHandler({
			logger: logger,
			dialogService: dialogService
		});

		var siteSettingHandler = new SiteSettingHandler({
			siteService: siteService
		});

		var messageHandlingService = new MessageHandlingService({ // jshint ignore:line
			eventBus: eventBus,
			startupDataHandler: startupDataHandler,
			connectionHandler: connectionHandler,
			pageUnloadHandler: pageUnloadHandler,
			mapEventHandler: mapEventHandler,
			userEventHandler: userEventHandler,
			chatMessageHandler: chatMessageHandler,
			errorMessageHandler: errorMessageHandler,
			siteSettingHandler: siteSettingHandler
		});

	};

	return {
		init: init,
		ready: function() {}
	};

}());
