meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.mapBootstrapper = (function() {

	// imports
	var eventBusFactory = meshmap.events.factories.eventBusFactory,
		extentUpdaterFactory = meshmap.map.factories.extentUpdaterFactory,
		mapApiProviderFactory = meshmap.map.mapApiProviderFactory,
		MarkerSelectionContext = meshmap.map.MarkerSelectionContext,
		ViewInjectionService = meshmap.angular.ViewInjectionService,
		scriptInjectionService = meshmap.utils.scriptInjectionService,
		MarkerPermissionsService = meshmap.security.MarkerPermissionsService,
		MarkerDialogService = meshmap.ui.MarkerDialogService,
		DialogService = meshmap.ui.DialogService,
		SiteService = meshmap.state.SiteService,
		MapService = meshmap.map.MapService,
		CommsService = meshmap.utils.comms.CommsService,
		Logger = meshmap.utils.logging.Logger,
		mapFactory = meshmap.map.mapFactory,
		ng = angular;

	var init = function() {
		if(document.getElementById("useNewMapMethod").value !== "true") {
			return;
		}

		subscribeToEvents();
	};

	var subscribeToEvents = function() {
		var eventBus = eventBusFactory.create();
		eventBus.subscribe("configDownloaded", onConfigDownloaded);
	};

	var onConfigDownloaded = function(config) {
		var mapConfig = config.map || { type: "googleMaps" };
		var mapEl = document.getElementById("map");

		var apiProvider = createApiProvider(mapConfig, mapEl);
		initMapService(mapConfig, apiProvider);
	};

	var initMapService = function(mapConfig, apiProvider) {
		var map = createMap(mapConfig, apiProvider);
		var eventBus = eventBusFactory.create();

		var mapService = new MapService({
			map: map,
			commsService: CommsService.instance,
			eventBus: eventBus,
			scriptInjectionService: scriptInjectionService,
			extentUpdater: extentUpdaterFactory.create(),
			logger: Logger.instance,
			markerPermissionsService: new MarkerPermissionsService(SiteService.instance),
			markerDialogService: createMarkerDialogService(),
			siteService: SiteService.instance
		});
		mapService.init();
	};

	var createApiProvider = function(mapConfig, mapEl) {
		var viewInjectionService = new ViewInjectionService(ng, true);

		var apiProvider = mapApiProviderFactory.create(mapConfig, mapEl, viewInjectionService);
		return apiProvider;
	};

	var createMap = function(mapConfig, apiProvider) {
		var viewInjectionService = new ViewInjectionService(ng, true);
		var markerSelectionContext = new MarkerSelectionContext();

		return mapFactory.create({
			mapConfig: mapConfig,
			apiProvider: apiProvider,
			markerSelectionContext: markerSelectionContext,
			viewInjectionService: viewInjectionService
		});
	};

	var createMarkerDialogService = function() {
		return new MarkerDialogService({
			dialogService: DialogService.instance
		});
	};

	return {
		init: init,
		ready: function() {}
	};

}());
