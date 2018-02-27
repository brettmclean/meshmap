meshmap.namespace("meshmap.map");

meshmap.map.MapBase = (function() {

	// imports
	var observable = MicroEvent.mixin,
		dm = meshmap.models,
		PointMarker = dm.PointMarker,
		PolylineMarker = dm.PolylineMarker,
		PolygonMarker = dm.PolygonMarker;

	var MapBase = function(deps, opts) {
		this._apiProvider = deps.apiProvider;
		this._viewInjectionService = deps.viewInjectionService;
		this._markerSelectionContext = deps.markerSelectionContext;

		this._key = opts.key;

		this._apiAvailable = false;
		this._markerIconsSet = false;
		this._markerColorsSet = false;
		this._apiHasInitializedMap = false;

		this._changeQueue = [];
	};

	MapBase.prototype.init = function() {
		subscribeToApiProviderEvents.call(this);
		subscribeToMarkerSelectionContextEvents.call(this);
	};

	MapBase.prototype.notifyApiAvailable = function() {
		this._apiAvailable = true;
		checkIfReadyToInitMap.call(this);
	};

	MapBase.prototype.getScriptUrls = function() {
		return [];
	};

	MapBase.prototype.getMapTypeDescription = function() {
		return "Base";
	};

	MapBase.prototype.setMarkerIcons = function(markerIcons) {
		this._markerIconsSet = true;
		this._apiProvider.setMarkerIcons(markerIcons);
		this._markerSelectionContext.setMarkerIcons(markerIcons);
		checkIfReadyToInitMap.call(this);
	};

	MapBase.prototype.setMarkerColors = function(markerColors) {
		this._markerColorsSet = true;
		this._apiProvider.setMarkerColors(markerColors);
		this._markerSelectionContext.setMarkerColors(markerColors);
		checkIfReadyToInitMap.call(this);
	};

	MapBase.prototype.clearMarkers = function() {
		queueChangeAndAttemptExecute.call(this, "clearMarkers", []);
	};

	MapBase.prototype.setExtent = function(mapExtent) {
		queueChangeAndAttemptExecute.call(this, "setExtent", [mapExtent]);
	};

	MapBase.prototype.setLayout = function(layout) {
		this._markerSelectionContext.setLayout(layout);
	};

	MapBase.prototype.addMarker = function(marker) {
		var addMarkerMethodName = getAddMarkerMethodName(marker);
		if(addMarkerMethodName) {
			queueChangeAndAttemptExecute.call(this, addMarkerMethodName, [marker]);
		}
	};

	MapBase.prototype.removeMarker = function(marker) {
		queueChangeAndAttemptExecute.call(this, "removeMarker", [marker]);
	};

	MapBase.prototype.setActiveMarkerType = function(markerType) {
		queueChangeAndAttemptExecute.call(this, "setActiveMarkerType", [markerType]);
	};

	MapBase.prototype.setMapHeight = function(mapHeightPx) {
		queueChangeAndAttemptExecute.call(this, "setMapHeight", [mapHeightPx]);
	};

	MapBase.prototype.setPointSymbol = function(pointSymbol) {
		queueChangeAndAttemptExecute.call(this, "setPointSymbol", [pointSymbol]);
	};

	MapBase.prototype.setPolylineSymbol = function(polylineSymbol) {
		queueChangeAndAttemptExecute.call(this, "setPolylineSymbol", [polylineSymbol]);
	};

	MapBase.prototype.setPolygonSymbol = function(polygonSymbol) {
		queueChangeAndAttemptExecute.call(this, "setPolygonSymbol", [polygonSymbol]);
	};

	MapBase.prototype.showMarkerInfo = function(markerInfoContext, anchorLocation) {
		queueChangeAndAttemptExecute.call(this, "showMarkerInfo", [markerInfoContext, anchorLocation]);
	};

	var checkIfReadyToInitMap = function() {
		if(!this._apiHasInitializedMap	&&
			apiProviderIsReady.call(this)) {

			this._apiProvider.initMap();
			this._apiHasInitializedMap = true;
			this.trigger("mapInitialized");
			attemptDrainChangeQueue.call(this);
		}
	};

	var apiProviderIsReady = function() {
		return this._apiAvailable && this._markerIconsSet && this._markerColorsSet;
	};

	var queueChangeAndAttemptExecute = function(apiMethodName, methodArgs) {
		this._changeQueue.push(new QueuedChange(apiMethodName, methodArgs));
		attemptDrainChangeQueue.call(this);
	};

	var attemptDrainChangeQueue = function() {
		if(apiProviderIsReady.call(this)) {
			while(this._changeQueue.length) {
				var change = this._changeQueue.shift();
				this._apiProvider[change.methodName].apply(this._apiProvider, change.args);
			}
		}
	};

	var subscribeToApiProviderEvents = function() {
		this._apiProvider.bind("mapMoved", this.trigger.bind(this, "mapMoved"));
		this._apiProvider.bind("markerClicked", this.trigger.bind(this, "markerClicked"));
		this._apiProvider.bind("pointMarkerCreated", this.trigger.bind(this, "pointMarkerCreated"));
		this._apiProvider.bind("polylineMarkerCreated", this.trigger.bind(this, "polylineMarkerCreated"));
		this._apiProvider.bind("polygonMarkerCreated", this.trigger.bind(this, "polygonMarkerCreated"));
		this._apiProvider.bind("mapReady", onMapReady.bind(this));
	};

	var subscribeToMarkerSelectionContextEvents = function() {
		this._markerSelectionContext.bind("toolChanged", onToolChanged.bind(this));
		this._markerSelectionContext.bind("pointSymbolChanged", pointSymbolChanged.bind(this));
		this._markerSelectionContext.bind("polylineSymbolChanged", polylineSymbolChanged.bind(this));
		this._markerSelectionContext.bind("polygonSymbolChanged", polygonSymbolChanged.bind(this));
	};

	var onMapReady = function() {
		var markerSelectionContainer = this._apiProvider.getMarkerSelectionContainer();
		injectMarkerSelectorIntoMap.call(this, markerSelectionContainer);
	};

	var onToolChanged = function(activeTool) {
		var drawingMode = getDrawingModeForActiveTool.call(this, activeTool);
		this._apiProvider.setDrawingMode(drawingMode);
	};

	var pointSymbolChanged = function(pointSymbol) {
		this._apiProvider.setPointSymbol(pointSymbol);
	};

	var polylineSymbolChanged = function(polylineSymbol) {
		this._apiProvider.setPolylineSymbol(polylineSymbol);
	};

	var polygonSymbolChanged = function(polygonSymbol) {
		this._apiProvider.setPolygonSymbol(polygonSymbol);
	};

	var getDrawingModeForActiveTool = function(activeTool) {
		switch(activeTool) {
			case this._markerSelectionContext.TOOL_POINT:
				return this._apiProvider.DRAWING_POINT;
			case this._markerSelectionContext.TOOL_POLYLINE:
				return this._apiProvider.DRAWING_POLYLINE;
			case this._markerSelectionContext.TOOL_POLYGON:
				return this._apiProvider.DRAWING_POLYGON;
		}
		return null;
	};

	var injectMarkerSelectorIntoMap = function(markerSelectionContainer) {
		this._viewInjectionService.injectAndCreate(markerSelectionContainer,
			"SelectMarkerNewCtrl",
			"html/partials/selectmarker-new.html",
			this._markerSelectionContext);
	};

	var getAddMarkerMethodName = function(marker) {
		if(marker instanceof PointMarker) {
			return "addPointMarker";
		}
		if(marker instanceof PolylineMarker) {
			return "addPolylineMarker";
		}
		if(marker instanceof PolygonMarker) {
			return "addPolygonMarker";
		}

		return null;
	};

	MapBase.MARKER_TYPES = {
		POINT: "point",
		POLYLINE: "polyline",
		POLYGON: "polygon"
	};

	var QueuedChange = function(apiProviderMethodName, apiMethodArguments) {
		this.methodName = apiProviderMethodName;
		this.args = apiMethodArguments;
	};

	observable(MapBase.prototype);

	return MapBase;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.MapBase;
}
