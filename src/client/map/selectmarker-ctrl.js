meshmap.angular.controllers.controller("SelectMarkerCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBusFactory = meshmap.events.factories.eventBusFactory,
				browserSupportService = meshmap.utils.browserSupportService,
				symbols = meshmap.map.symbols;

			var eventBus = eventBusFactory.create();

			var MAX_OPTIONS_WIDTH = 320;
			var SELECT_MARKER_TYPES_WIDTH = 50;
			var OPTIONS_EXPANDER_WIDTH = 20;
			var OPTIONS_OFFSET_WIDTH = 10;

			$scope.MARKER_TYPE_POINT = "point";
			$scope.MARKER_TYPE_POLYLINE = "polyline";
			$scope.MARKER_TYPE_POLYGON = "polygon";

			$scope.browserSupport = browserSupportService;

			$scope.markerTypesOpen = true;

			$scope.currType = null;
			$scope.showOptionsForType = null;

			$scope.markerIcons = [];
			$scope.markerColors = [];
			$scope.small = false;
			$scope.large = false;
			$scope.pointSymbol = {
				iconId: null,
				iconUrl: null
			};
			$scope.polylineSymbol = {
				lineColorId: null,
				lineColor: null,
				lineWidth: null
			};
			$scope.polygonSymbol = {
				lineColorId: null,
				lineColor: null,
				fillColorId: null,
				fillColor: null,
				lineWidth: null
			};

			$scope.styles = {
				symbolOptions: {
					"max-width": null
				},
				optionScroller: {
					icons: {
						inner: {
							"width": "100%"
						}
					},
					color: {
						inner: {
							"width": "100%"
						}
					}
				}
			};

			$scope.onTypeClick = function(/* String */ markerType) {

				if($scope.small) {
					$scope.markerTypesOpen = !$scope.markerTypesOpen;
				}

				if($scope.currType !== markerType) {
					eventBus.publish("toolChanged", markerType);
					$scope.currType = markerType;
				}
				$scope.showOptionsForType = null;
			};

			$scope.optionsClick = function(/* String */ markerType) {
				var optionsShown = $scope.showOptionsForType === markerType ? null : markerType;
				if(optionsShown) {
					$scope.onTypeClick(optionsShown);
				}
				if($scope.small) {
					$scope.markerTypesOpen = false;
				}
				$scope.showOptionsForType = optionsShown;
				updateStyles();
			};

			$scope.hideOptions = function() {
				$scope.showOptionsForType = null;
				updateStyles();
			};

			$scope.validateLineWidth = function(/* Object */ symbolVar) {
				if(symbolVar) {
					var lineWidth = parseInt(symbolVar.lineWidth);
					lineWidth = isNaN(lineWidth) ? 2 : lineWidth;
					lineWidth = lineWidth < 1 ? 1 : lineWidth;
					lineWidth = lineWidth > 10 ? 10 : lineWidth;
					symbolVar.lineWidth = lineWidth;
				}
			};

			$scope.onPolylineLineWidthChange = function() {
				$scope.validateLineWidth($scope.polylineSymbol);
				firePolylineSymbolSetEvent();
			};

			$scope.onPolygonLineWidthChange = function() {
				$scope.validateLineWidth($scope.polygonSymbol);
				firePolygonSymbolSetEvent();
			};

			$scope.selectPointMarker = function(markerInfo) {
				var pos = $scope.pointSymbol;
				if(pos.iconId === markerInfo.id) {
					return $scope.hideOptions();
				}
				pos.iconId = markerInfo.id;
				pos.iconUrl = markerInfo.url;

				firePointSymbolSetEvent();
			};

			$scope.selectPolylineColor = function(markerColor) {
				var pls = $scope.polylineSymbol;
				if(pls.lineColorId === markerColor.id) {
					return $scope.hideOptions();
				}
				pls.lineColorId = markerColor.id;
				pls.lineColor = markerColor.color;

				firePolylineSymbolSetEvent();
			};

			$scope.selectPolygonLineColor = function(markerColor) {
				var pgs = $scope.polygonSymbol;
				if(pgs.lineColorId === markerColor.id) {
					return $scope.hideOptions();
				}
				pgs.lineColorId = markerColor.id;
				pgs.lineColor = markerColor.color;

				firePolygonSymbolSetEvent();
			};

			$scope.selectPolygonFillColor = function(markerColor) {
				var pgs = $scope.polygonSymbol;
				if(pgs.fillColorId === markerColor.id) {
					return $scope.hideOptions();
				}
				pgs.fillColorId = markerColor.id;
				pgs.fillColor = markerColor.color;
				firePolygonSymbolSetEvent();
			};

			var subscribeToEvents = function() {
				eventBus.subscribe("layoutChanged", onLayoutChanged);
				eventBus.subscribe("startupDataReceived", onStartupDataReceived);
				eventBus.subscribe("windowWidthChanged", onWindowWidthChanged);
			};

			var onLayoutChanged = function(/* String */ layoutType) {
				$scope.small = layoutType === "small";
				$scope.large = layoutType === "large";

				$scope.markerTypesOpen = !$scope.small;

				updateStyles();
			};

			var onWindowWidthChanged = function(/* Number */ newWidth) {
				var optionsMaxWidth = newWidth - SELECT_MARKER_TYPES_WIDTH - OPTIONS_EXPANDER_WIDTH - OPTIONS_OFFSET_WIDTH;
				optionsMaxWidth = optionsMaxWidth > MAX_OPTIONS_WIDTH ? MAX_OPTIONS_WIDTH : optionsMaxWidth;
				$scope.styles.symbolOptions["max-width"] = optionsMaxWidth + "px";
			};

			var onStartupDataReceived = function(/* StartupData */ startupData) {
				var pos = $scope.pointSymbol;
				var pls = $scope.polylineSymbol;
				var pgs = $scope.polygonSymbol;
				if(!pos.iconId) {
					$scope.markerIcons.length = 0;
					$scope.markerColors.length = 0;

					pos.iconId = 1;
					pls.lineColorId = 1;
					pls.lineWidth = 2;
					pgs.lineColorId = 1;
					pgs.fillColorId = 1;
					pgs.lineWidth = 2;

					var markerIcons = startupData.markerIcons;
					for(var key in markerIcons) {
						if(markerIcons.hasOwnProperty(key)) {
							$scope.markerIcons.push({id: parseInt(key), url: markerIcons[key]});
						}
					}

					var markerColors = startupData.markerColors;
					for(key in markerColors) {
						if(markerColors.hasOwnProperty(key)) {
							$scope.markerColors.push({id: parseInt(key), color: markerColors[key]});
						}
					}

					pos.iconUrl = markerIcons[pos.iconId];
					firePointSymbolSetEvent();

					pls.lineColor = markerColors[pls.lineColorId];
					firePolylineSymbolSetEvent();

					pgs.lineColor = markerColors[pgs.lineColorId];
					pgs.fillColor = markerColors[pgs.fillColorId];
					firePolygonSymbolSetEvent();
				}
			};

			var updateStyles = function() {
				var styles = $scope.styles;
				var optionScrollerStyles = styles.optionScroller;

				optionScrollerStyles.icons.inner.width =
					$scope.small ?
					($scope.markerIcons.length * SELECT_MARKER_TYPES_WIDTH) + "px" :
					"100%";
				optionScrollerStyles.color.inner.width =
					$scope.small ?
					($scope.markerColors.length * SELECT_MARKER_TYPES_WIDTH) + "px" :
					"100%";
			};

			var firePointSymbolSetEvent = function() {
				var pos = $scope.pointSymbol;
				var pointSymbol = new symbols.PointSymbol(pos.iconId);
				eventBus.publishSticky("pointSymbolSet", pointSymbol);
			};

			var firePolylineSymbolSetEvent = function() {
				var pls = $scope.polylineSymbol;
				var polylineSymbol = new symbols.PolylineSymbol(pls.lineColorId, pls.lineWidth);
				eventBus.publishSticky("polylineSymbolSet", polylineSymbol);
			};

			var firePolygonSymbolSetEvent = function() {
				var pgs = $scope.polygonSymbol;
				var polygonSymbol = new symbols.PolygonSymbol(pgs.lineColorId, pgs.fillColorId, pgs.lineWidth);
				eventBus.publishSticky("polygonSymbolSet", polygonSymbol);
			};

			subscribeToEvents();
		}
	]
);
