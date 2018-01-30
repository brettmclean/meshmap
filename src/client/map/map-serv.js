meshmap.angular.services.factory("Map",
	[
		"$q",
		"GoogleMap",
		function($q, GoogleMap) {

			// imports
			var EventBus = meshmap.events.EventBus,
				Logger = meshmap.utils.logging.Logger,
				MapBase = meshmap.map.MapBase;

			var eventBus = EventBus.instance;
			var logger = Logger.instance;

			var MARKER_TYPES = MapBase.MARKER_TYPES;

			var mapType = null;
			var mapKey = null;

			var mapElement = null;

			var mapScriptsDownloaded = false;

			var mapServiceImpl = null;
			var mapServiceImplDeferred = $q.defer();
			var mapServiceImplPromise = mapServiceImplDeferred.promise;

			var subscribeToEvents = function() {
				eventBus.subscribe("markerIconsSet", onMarkerIconsSet);
				eventBus.subscribe("markerColorsSet", onMarkerColorsSet);
				eventBus.subscribe("markersCleared", onMarkersCleared);
				eventBus.subscribe("extentChanged", onExtentChanged);
				eventBus.subscribe("markerAdded", onMarkerAdded);
				eventBus.subscribe("markerRemoved", onMarkerRemoved);
				eventBus.subscribe("toolChanged", onToolChanged);
				eventBus.subscribe("pointSymbolSet", onPointSymbolSet);
				eventBus.subscribe("polylineSymbolSet", onPolylineSymbolSet);
				eventBus.subscribe("polygonSymbolSet", onPolygonSymbolSet);
				eventBus.subscribe("configDownloaded", onConfigDownloaded);
			};

			var onMarkerIconsSet = function(/* Object */ markerIcons) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.setMarkerIcons(markerIcons);
				});
			};

			var onMarkerColorsSet = function(/* Object */ markerColors) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.setMarkerColors(markerColors);
				});
			};

			var onMarkersCleared = function() {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.clearMarkers();
				});
			};

			var onExtentChanged = function(/* MapExtent */ extent) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.setExtent(extent);
				});
			};

			var onMarkerAdded = function(/* PointMarker|PolylineMarker|PolygonMarker */ marker) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.addMarker(getMarkerType(marker), marker);
				});
			};

			var onMarkerRemoved = function(/* PointMarker|PolylineMarker|PolygonMarker */ marker) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.removeMarker(marker);
				});
			};

			var onToolChanged = function(markerType) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.updateMarkerType(markerType);
				});
			};

			var onPointSymbolSet = function(pointSymbol) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.updateMarkerSymbol(MARKER_TYPES.POINT, pointSymbol);
				});
			};

			var onPolylineSymbolSet = function(polylineSymbol) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.updateMarkerSymbol(MARKER_TYPES.POLYLINE, polylineSymbol);
				});
			};

			var onPolygonSymbolSet = function(polygonSymbol) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.updateMarkerSymbol(MARKER_TYPES.POLYGON, polygonSymbol);
				});
			};

			var onConfigDownloaded = function(config) {
				if(config.map) {
					mapType = config.map.type;
					mapKey = config.map.key;
					downloadMapScripts();
				}
			};

			var downloadMapScripts = function() {
				if(mapType === "googleMaps") {
					mapServiceImpl = GoogleMap;
					mapServiceImplDeferred.resolve();
					downloadGoogleMapScripts();
				}
			};

			var downloadGoogleMapScripts = function() {
				if(document.getElementById("useNewMapMethod").value === "true") {
					return;
				}

				mapServiceImpl.downloadScripts(mapKey, function() {
					mapScriptsDownloaded = true;
					checkReadyForMapInit();
				});

				logger.info("Initialized Google map.");
			};

			var setMapElement = function(/* HTMLElement */ element) {
				if(document.getElementById("useNewMapMethod").value === "true") {
					return;
				}

				mapElement = element;
				checkReadyForMapInit();
			};

			var setSelectMarkerElement = function(/* HTMLElement */ element, scope) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.initMarkerSelectionControl(element, scope);
					angular.element(element).remove();
				});
			};

			var setMarkerInfoElement = function(/* HTMLElement */ element) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.injectMarkerInfoControl(element);
				});
			};

			var updateMapHeight = function(/* Number */ mapHeight) {
				mapServiceImplPromise.then(function() {
					mapServiceImpl.updateMapHeight(mapHeight);
				});
			};

			var checkReadyForMapInit = function() {
				if(mapElement && mapScriptsDownloaded) {
					mapServiceImpl.init(mapElement);
				}
			};

			var getMarkerType = function(/* PointMarker|PolylineMarker|PolygonMarker */ marker) {
				var result = null;

				if(marker) {
					if(marker.hasOwnProperty("fillColorId")) {
						result = MARKER_TYPES.POLYGON;
					} else if(marker.hasOwnProperty("lineColorId")) {
						result = MARKER_TYPES.POLYLINE;
					} else if(marker.hasOwnProperty("iconId")) {
						result = MARKER_TYPES.POINT;
					}
				}

				return result;
			};

			if(document.getElementById("useNewMapMethod").value !== "true") {
				subscribeToEvents();
			}

			if(document.getElementById("useNewMapMethod").value === "true") {
				setMapElement = function() {};
				setSelectMarkerElement = function() {};
				setMarkerInfoElement = function() {};
				updateMapHeight = function() {};
			}

			return {
				setMapElement: setMapElement,
				setSelectMarkerElement: setSelectMarkerElement,
				setMarkerInfoElement: setMarkerInfoElement,
				updateMapHeight: updateMapHeight
			};
		}
	]
);
