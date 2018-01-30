(function() {

	meshmap.angular.services.factory("GoogleMap",
		[
			"$rootScope",
			"$q",
			"$compile",
			function($rootScope, $q, $compile) {

				// imports
				var dm = meshmap.models,
					EventBus = meshmap.events.EventBus,
					CommsService = meshmap.utils.comms.CommsService,
					SiteService = meshmap.state.SiteService,
					DialogButton = meshmap.ui.dialogs.DialogButton,
					ViewDialog = meshmap.ui.dialogs.ViewDialog,
					DialogService = meshmap.ui.DialogService,
					scriptInjectionService = meshmap.utils.scriptInjectionService,
					MapBase = meshmap.map.MapBase,
					GoogleMap = meshmap.map.google.GoogleMap;

				var eventBus = EventBus.instance;
				var commsService = CommsService.instance;
				var siteService = SiteService.instance;
				var dialogService = DialogService.instance;

				var MIN_EXTENT_CHANGE_IDLE_TIME = 300; // ms
				var MARKER_TYPES = MapBase.MARKER_TYPES;

				var googleMap = new GoogleMap();

				var layout = {
					small: false,
					large: false
				};

				var map = null;
				var infoWindow = null;
				var drawingManager = null;
				var markerIcons = {};
				var markerColors = {};
				var markerObjs = {};

				var extentChangeTimeout = null;
				var ignoreNextExtentChange = false;

				var markerInfoElement = null;
				var markerInfoScope = $rootScope.$new();
				var markerInfoDialogHandle = null;

				var currMarkerType = null;
				var currPointSymbol = null; /* { iconId: Number, iconUrl: String } */
				var currPolylineSymbol = null; /* { lineColorId: Number, lineColor: String, lineWidth: Number } */
				var currPolygonSymbol = null; /* { lineColorId: Number, lineColor: String, fillColorId: Number, fillColor: String, lineWidth: Number } */

				var mapInitDeferred = $q.defer();
				var markerIconsDeferred = $q.defer();
				var markerColorsDeferred = $q.defer();

				var subscribeToEvents = function() {
					eventBus.subscribe("layoutChanged", onLayoutChanged);
					eventBus.subscribe("markerRemoved", onMarkerRemoved);
					eventBus.subscribe("mapClicked", onMapClicked);
				};

				var onLayoutChanged = function(/* String */ layoutType) {
					layout.small = layoutType === "small";
					layout.large = layoutType === "large";
				};

				var onMarkerRemoved = function(/* PointMarker|PolylineMarker|PolygonMarker */ marker) {
					if(markerInfoScope.marker === marker) {
						infoWindow.close();
						if(markerInfoDialogHandle) {
							dialogService.dismissDialog(markerInfoDialogHandle);
							markerInfoDialogHandle = null;
						}
					}
				};

				var onMapClicked = function() {
					infoWindow.close();
				};

				var downloadScripts = function(mapKey, done) {
					googleMap._key = mapKey;

					scriptInjectionService.injectIntoBody(googleMap.getScriptUrls(), done);
				};

				var init = function(/* HTMLElement */ mapElement) {
					initMap(mapElement);
					initInfoWindow();
					initDrawingManager();

					mapInitDeferred.resolve();
				};

				var initMap = function(/* HTMLElement */ mapElement) {
					var mapOptions = {
						center: new google.maps.LatLng(0,0),
						zoom: 1,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControl: false,
						overviewMapControl: false,
						panControl: false,
						rotateControl: false,
						scaleControl: false,
						streetViewControl: false,
						zoomControl: true,
						zoomControlOptions: {
							position: google.maps.ControlPosition.LEFT_TOP
						}
					};
					map = new google.maps.Map(mapElement, mapOptions);
					google.maps.event.addListener(map, "click", onMapClick);
					google.maps.event.addListener(map, "idle", onMapMove);
				};

				var initInfoWindow = function() {
					infoWindow = new google.maps.InfoWindow();
				};

				var initDrawingManager = function() {
					drawingManager = new google.maps.drawing.DrawingManager({
						drawingMode: null,
						drawingControl: false
					});
					google.maps.event.addListener(drawingManager, "markercomplete", onDrawingManagerPointComplete);
					google.maps.event.addListener(drawingManager, "polylinecomplete", onDrawingManagerPolylineComplete);
					google.maps.event.addListener(drawingManager, "polygoncomplete", onDrawingManagerPolygonComplete);
					drawingManager.setMap(map);
				};

				var initMarkerSelection = function(/* HTMLElement */ markerSelectionElement, scope) {
					mapInitDeferred.promise.then(function() {
						google.maps.event.addListenerOnce(map, "idle", function() {
							map.controls[google.maps.ControlPosition.LEFT_TOP].push(markerSelectionElement);
							$compile(markerSelectionElement)(scope);
						});
					});
				};

				var injectMarkerInfo = function(/* HTMLElement */ mie) {
					markerInfoElement = mie;
				};

				var updateMapHeight = function(/* Number */ mapHeight) {
					/* jshint unused:vars */
					mapInitDeferred.promise.then(function() {
						setTimeout(function() {
							google.maps.event.trigger(map, "resize");
						}, 0);
					});
				};

				var setMarkerIcons = function(/* Object */ mi) {
					markerIcons = mi;
					markerIconsDeferred.resolve();
				};

				var setMarkerColors = function(/* Object */ mc) {
					markerColors = mc;
					markerColorsDeferred.resolve();
				};

				var updateMarkerType = function(/* String */ type) {

					mapInitDeferred.promise.then(function() {
						var ot = google.maps.drawing.OverlayType;

						switch(type) {
							case MARKER_TYPES.POINT:
								currMarkerType = type;
								drawingManager.setOptions({ drawingMode: ot.MARKER });
								break;
							case MARKER_TYPES.POLYLINE:
								currMarkerType = type;
								drawingManager.setOptions({ drawingMode: ot.POLYLINE });
								break;
							case MARKER_TYPES.POLYGON:
								currMarkerType = type;
								drawingManager.setOptions({ drawingMode: ot.POLYGON });
								break;
							default:
								currMarkerType = null;
								drawingManager.setOptions({ drawingMode: null });
								break;
						}
					});
				};

				var updateMarkerSymbol = function(type, symbolInfo) {
					switch(type) {
						case MARKER_TYPES.POINT:
							currPointSymbol = symbolInfo;
							break;
						case MARKER_TYPES.POLYLINE:
							currPolylineSymbol = symbolInfo;
							break;
						case MARKER_TYPES.POLYGON:
							currPolygonSymbol = symbolInfo;
							break;
						default:
							break;
					}
				};

				var setExtent = function(/* MapExtent */ extent) {
					if(ignoreNextExtentChange) {
						ignoreNextExtentChange = false;
						return;
					}

					if(extent) {
						mapInitDeferred.promise.then(function() {
							map.fitBounds(
								new google.maps.LatLngBounds(
									new google.maps.LatLng(extent.min.lat, extent.min.lng),
									new google.maps.LatLng(extent.max.lat, extent.max.lng)
								)
							);
							google.maps.event.addListenerOnce(map, "bounds_changed", function(e) {
								/* jshint unused:vars */
								var zoom = map.getZoom();
								if(zoom < 20) {
									map.setZoom(zoom + 1);
								}
							});
						});
					}
				};

				var clearMarkers = function() {
					for(var key in markerObjs) {
						if(markerObjs.hasOwnProperty(key)) {
							markerObjs[key].setMap(null);
							delete markerObjs[key];
						}
					}
				};

				var onMapClick = function(/* google.maps.MouseEvent */ args) {
					/* jshint unused:vars */
					eventBus.publish("mapClicked");
				};

				var onMapMove = function() {
					var clearExtentChangeTimeout = function() {
						if(extentChangeTimeout) {
							clearTimeout(extentChangeTimeout);
							extentChangeTimeout = null;
						}
					};

					if(extentChangeTimeout) {
						clearExtentChangeTimeout();
					}

					extentChangeTimeout = setTimeout(function() {
						ignoreNextExtentChange = true;
						clearExtentChangeTimeout();

						var bounds = map.getBounds();
						var ne = bounds.getNorthEast();
						var sw = bounds.getSouthWest();

						var min = new dm.Location(sw.lat(), sw.lng());
						var max = new dm.Location(ne.lat(), ne.lng());

						siteService.setExtent(new dm.MapExtent(min, max));
					}, MIN_EXTENT_CHANGE_IDLE_TIME);
				};

				var onMarkerClick = function(clickedLatLng, marker) {

					markerInfoScope.marker = marker;

					if(layout.small) {
						showMarkerInfoInDialog(marker);
					} else if(layout.large) {
						showMarkerInfoInInfoWindow(clickedLatLng, marker);
					}
				};

				var showMarkerInfoInDialog = function(/* PointMarker|PolylineMarker|PolygonMarker */ marker) {
					var dialog = new ViewDialog(
						marker.name,
						"MarkerInfoCtrl",
						"html/partials/markerinfo.html",
						markerInfoScope
					);

					var closeBtn = new DialogButton(
						"Close",
						false,
						null
					);
					closeBtn.addClass("btn-primary");
					dialog.buttons.push(closeBtn);

					markerInfoDialogHandle = dialog.handle;
					dialogService.showDialog(dialog);
				};

				var showMarkerInfoInInfoWindow = function(clickedLatLng, marker) {
					infoWindow.close();

					var markerInfoCompiled = null;
					markerInfoScope.$apply(function() {
						markerInfoCompiled = $compile(markerInfoElement)(markerInfoScope);
					});

					var options = {
						content: markerInfoCompiled[0].nextSibling,
						position: clickedLatLng
					};
					infoWindow.setOptions(options);

					var isPointMarker = !marker.lineColorId;
					var anchor = isPointMarker ? markerObjs[marker.id] : undefined;
					infoWindow.open(map, anchor);
				};

				var onDrawingManagerPointComplete = function(/* google.maps.Marker */ mapMarker) {
					mapMarker.setMap(null);

					var markerSymbolId = (currPointSymbol && currPointSymbol.iconId) || 1;

					var location = new dm.Location(mapMarker.getPosition().lat(), mapMarker.getPosition().lng());
					var marker = new dm.PointMarker(null, location, markerSymbolId);
					marker.name = "New Location";
					marker.description = "";

					commsService.sendMessage(
						"mapEvent",
						new dm.MapEvent("addMarker", marker)
					);
				};

				var onDrawingManagerPolylineComplete = function(/* google.maps.Polyline */ polylineOverlay) {
					polylineOverlay.setMap(null);

					var colorId = (currPolylineSymbol && currPolylineSymbol.lineColorId) || 1;
					var width = (currPolylineSymbol && currPolylineSymbol.lineWidth) || 1;

					var latLngArray = polylineOverlay.getPath().getArray();
					var locations = [];
					for(var i = 0; i < latLngArray.length; i++) {
						locations.push(
							new dm.Location(
								latLngArray[i].lat(),
								latLngArray[i].lng()
							)
						);
					}

					var marker = new dm.PolylineMarker(null, locations, colorId, width);
					marker.name = "New Location";
					marker.description = "";

					commsService.sendMessage(
						"mapEvent",
						new dm.MapEvent("addMarker", marker)
					);
				};

				var onDrawingManagerPolygonComplete = function(/* google.maps.Polygon */ polygonOverlay) {
					polygonOverlay.setMap(null);

					var lineColorId = (currPolygonSymbol && currPolygonSymbol.lineColorId) || 1;
					var fillColorId = (currPolygonSymbol && currPolygonSymbol.fillColorId) || 1;
					var width = (currPolygonSymbol && currPolygonSymbol.lineWidth) || 1;

					var latLngArray = polygonOverlay.getPath().getArray();
					var locations = [];
					for(var i = 0; i < latLngArray.length; i++) {
						locations.push(
							new dm.Location(
								latLngArray[i].lat(),
								latLngArray[i].lng()
							)
						);
					}

					var marker = new dm.PolygonMarker(null, locations, lineColorId, fillColorId, width);
					marker.name = "New Location";
					marker.description = "";

					commsService.sendMessage(
						"mapEvent",
						new dm.MapEvent("addMarker", marker)
					);
				};

				var addMarker = function(markerType, marker) {
					if(marker && marker.id) {
						$q.all([mapInitDeferred.promise, markerIconsDeferred.promise, markerColorsDeferred.promise]).then(function() {
							var mapMarker = null;

							var location = null;
							var locations = null;
							var latLngs = null;
							var i = 0;
							switch(markerType) {
								case MARKER_TYPES.POINT:
									location = marker.location;
									var latLng = new google.maps.LatLng(location.lat, location.lng);
									if(location && latLng) {
										mapMarker = new google.maps.Marker({
											position: latLng,
											icon: markerIcons[marker.iconId] || markerIcons[1]
										});
									}
									break;
								case MARKER_TYPES.POLYLINE:
									locations = marker.locations;
									latLngs = [];
									for(i = 0; i < locations.length; i++) {
										latLngs.push(new google.maps.LatLng(locations[i].lat, locations[i].lng));
									}
									if(latLngs && latLngs.length > 0) {
										mapMarker = new google.maps.Polyline({
											path: latLngs,
											strokeColor: markerColors[marker.lineColorId] || markerColors[1],
											strokeWeight: marker.width
										});
									}
									break;
								case MARKER_TYPES.POLYGON:
									locations = marker.locations;
									latLngs = [];
									for(i = 0; i < locations.length; i++) {
										latLngs.push(new google.maps.LatLng(locations[i].lat, locations[i].lng));
									}
									if(latLngs && latLngs.length > 0) {
										mapMarker = new google.maps.Polygon({
											path: latLngs,
											strokeColor: markerColors[marker.lineColorId] || markerColors[1],
											fillColor: markerColors[marker.fillColorId] || markerColors[1],
											fillOpacity: 0.7,
											strokeWeight: marker.width
										});
									}
									break;
								default:
									break;
							}

							if(mapMarker) {
								mapMarker.setMap(map);
								google.maps.event.addListener(mapMarker, "click", function(e) {
									onMarkerClick(e.latLng, marker);
								});

								markerObjs[marker.id] = mapMarker;
							}
						});
					}
				};

				var removeMarker = function(/* PointMarker|PolylineMarker|PolygonMarker */ marker) {
					if(markerObjs[marker.id]) {
						markerObjs[marker.id].setMap(null);
						delete markerObjs[marker.id];
					}
				};

				subscribeToEvents();

				return {
					init: init,
					downloadScripts: downloadScripts,
					initMarkerSelectionControl: initMarkerSelection,
					injectMarkerInfoControl: injectMarkerInfo,
					updateMapHeight: updateMapHeight,
					setMarkerIcons: setMarkerIcons,
					setMarkerColors: setMarkerColors,
					updateMarkerType: updateMarkerType,
					updateMarkerSymbol: updateMarkerSymbol,
					setExtent: setExtent,
					clearMarkers: clearMarkers,
					addMarker: addMarker,
					removeMarker: removeMarker
				};
			}
		]
	);

}());
