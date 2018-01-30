meshmap.namespace("meshmap.map");

meshmap.map.MapService = (function() {

	// imports
	var MapBase = meshmap.map.MapBase,
		MarkerInfoContext = meshmap.map.MarkerInfoContext,
		models = meshmap.models;

	var LAYOUT_LARGE = "large";

	var MapService = function(deps) {
		deps = deps;

		validateMap(deps.map);

		this._map = deps.map;
		this._eventBus = deps.eventBus;
		this._commsService = deps.commsService;
		this._scriptInjectionService = deps.scriptInjectionService;
		this._extentUpdater = deps.extentUpdater;
		this._logger = deps.logger;
		this._markerPermissionsService = deps.markerPermissionsService;
		this._markerDialogService = deps.markerDialogService;
		this._siteService = deps.siteService;

		this._layoutIsLarge = true;
		this._currMarkerInfoContext = null;

		this._eventHandlers = {
			onDeleteMarkerRequested: onDeleteMarkerRequested.bind(this),
			onEditMarkerRequested: onEditMarkerRequested.bind(this)
		};

		subscribeToEvents.call(this);
	};

	MapService.prototype.init = function() {
		this._map.init();
		injectMapApiScripts.call(this);
	};

	MapService.prototype.setMarkerInfoContext = function(markerInfoContext) {
		unbindFromMarkerInfoContextEvents.call(this, this._currMarkerInfoContext);
		this._currMarkerInfoContext = markerInfoContext;
		bindToMarkerInfoContextEvents.call(this, this._currMarkerInfoContext);
	};

	var validateMap = function(map) {
		if(map && !(map instanceof MapBase)) {
			throw new TypeError("map must be a MapBase");
		}
	};

	var injectMapApiScripts = function() {
		var self = this;
		this._scriptInjectionService.injectIntoBody(this._map.getScriptUrls(), function() {
			self._map.notifyApiAvailable();
		});
	};

	var subscribeToEvents = function() {
		this._eventBus.subscribe("markerIconsSet", callMapMethodWithArg.bind(this, "setMarkerIcons"));
		this._eventBus.subscribe("markerColorsSet", callMapMethodWithArg.bind(this, "setMarkerColors"));
		this._eventBus.subscribe("markersCleared", callMapMethod.bind(this, "clearMarkers"));
		this._eventBus.subscribe("extentChanged", callMapMethodWithArg.bind(this, "setExtent"));
		this._eventBus.subscribe("markerAdded", callMapMethodWithArg.bind(this, "addMarker"));
		this._eventBus.subscribe("markerRemoved", callMapMethodWithArg.bind(this, "removeMarker"));
		this._eventBus.subscribe("toolChanged", callMapMethodWithArg.bind(this, "setActiveMarkerType"));
		this._eventBus.subscribe("pointSymbolSet", callMapMethodWithArg.bind(this, "setPointSymbol"));
		this._eventBus.subscribe("polylineSymbolSet", callMapMethodWithArg.bind(this, "setPolylineSymbol"));
		this._eventBus.subscribe("polygonSymbolSet", callMapMethodWithArg.bind(this, "setPolygonSymbol"));
		this._eventBus.subscribe("mapHeightChanged", onMapHeightChanged.bind(this));
		this._eventBus.subscribe("layoutChanged", onLayoutChanged.bind(this));

		this._map.bind("mapMoved", onMapMoved.bind(this));
		this._map.bind("mapInitialized", onMapInitialized.bind(this));
		this._map.bind("markerClicked", onMarkerClicked.bind(this));
		this._map.bind("pointMarkerCreated", onPointMarkerCreated.bind(this));
		this._map.bind("polylineMarkerCreated", onPolylineMarkerCreated.bind(this));
		this._map.bind("polygonMarkerCreated", onPolygonMarkerCreated.bind(this));
	};

	var callMapMethod = function(methodName) {
		this._map[methodName]();
	};

	var callMapMethodWithArg = function(methodName, methodArg) {
		this._map[methodName](methodArg);
	};

	var onMapInitialized = function() {
		this._logger.info("Initialized " + this._map.getMapTypeDescription() + " map.");
	};

	var onMapMoved = function(newMapExtent) {
		this._extentUpdater.setExtent(newMapExtent);
	};

	var onMarkerClicked = function(marker, clickedLocation) {
		this.setMarkerInfoContext(createMarkerInfoContext.call(this, marker));

		if(this._layoutIsLarge) {
			this._map.showMarkerInfo(this._currMarkerInfoContext, clickedLocation);
		} else {
			this._markerDialogService.showMarkerInfoDialog(this._currMarkerInfoContext);
		}
	};

	var onPointMarkerCreated = function(location, pointSymbol) {
		var pointMarker = new models.PointMarker(null, location, pointSymbol.iconId);
		populateNewMarkerNameAndDescription(pointMarker);

		sendAddMarkerEventOnComms.call(this, pointMarker);
	};

	var onPolylineMarkerCreated = function(locations, polylineSymbol) {
		var polylineMarker = new models.PolylineMarker(null, locations, polylineSymbol.lineColorId, polylineSymbol.lineWidth);
		populateNewMarkerNameAndDescription(polylineMarker);

		sendAddMarkerEventOnComms.call(this, polylineMarker);
	};

	var onPolygonMarkerCreated = function(locations, polygonSymbol) {
		var polygonMarker = new models.PolygonMarker(null, locations, polygonSymbol.lineColorId, polygonSymbol.fillColorId, polygonSymbol.lineWidth);
		populateNewMarkerNameAndDescription(polygonMarker);

		sendAddMarkerEventOnComms.call(this, polygonMarker);
	};

	var populateNewMarkerNameAndDescription = function(marker) {
		marker.name = "New Location";
		marker.description = "";
	};

	var sendAddMarkerEventOnComms = function(marker) {
		var mapEvent = new models.MapEvent("addMarker", marker);
		this._commsService.sendMessage("mapEvent", mapEvent);
	};

	var onMapHeightChanged = function(mapHeightPx) {
		this._map.setMapHeight(mapHeightPx);
	};

	var onLayoutChanged = function(newLayout) {
		this._layoutIsLarge = newLayout === LAYOUT_LARGE;
		this._map.setLayout(newLayout);
	};

	var createMarkerInfoContext = function(marker) {
		var markerInfoContext = new MarkerInfoContext(marker);
		markerInfoContext.layoutIsLarge = this._layoutIsLarge;
		markerInfoContext.userCanEditMarker = this._markerPermissionsService.getUserCanEditMarker(marker);

		return markerInfoContext;
	};

	var bindToMarkerInfoContextEvents = function(markerInfoContext) {
		markerInfoContext.bind("deleteMarkerRequested", this._eventHandlers.onDeleteMarkerRequested);
		markerInfoContext.bind("editMarkerRequested", this._eventHandlers.onEditMarkerRequested);
	};

	var unbindFromMarkerInfoContextEvents = function(markerInfoContext) {
		if(markerInfoContext) {
			markerInfoContext.unbind("deleteMarkerRequested", this._eventHandlers.onDeleteMarkerRequested);
			markerInfoContext.unbind("editMarkerRequested", this._eventHandlers.onEditMarkerRequested);
		}
	};

	var onDeleteMarkerRequested = function(marker) {
		var userSettings = this._siteService.getUserSettings();
		if(userSettings.confirmMarkerDeletion) {
			this._markerDialogService.showConfirmDeletionDialog(marker, deleteMarker.bind(this, marker.id));
		} else {
			deleteMarker.call(this, marker.id);
		}
		this._markerDialogService.dismissMarkerInfoDialog();
	};

	var deleteMarker = function(markerId) {
		this._siteService.removeMarker(markerId);
	};

	var onEditMarkerRequested = function(marker) {
		this._markerDialogService.showEditMarkerDialog(marker, processEditedMarker.bind(this, marker));
		this._markerDialogService.dismissMarkerInfoDialog();
	};

	var processEditedMarker = function(marker) {
		this._siteService.updateMarker(marker);
	};

	return MapService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.MapService;
}
