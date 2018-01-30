meshmap.namespace("meshmap.map.google");

meshmap.map.google.GoogleMapsApiProvider = (function() {

	// imports
	var MapApiProviderBase = meshmap.map.MapApiProviderBase,
		dm = meshmap.models,
		Location = dm.Location,
		MapExtent = dm.MapExtent,
		PointMarker = dm.PointMarker;

	var MAX_ZOOM_LEVEL = 20;

	var baseClass = MapApiProviderBase,
		baseProto = baseClass.prototype;
	var GoogleMapsApiProvider = function(deps) {
		baseClass.call(this, deps);

		this._viewInjectionService = deps.viewInjectionService;

		this._mapImpl = null;
		this._infoWindow = null;
		this._drawingManager = null;
		this._googleMarkers = {};
	};
	GoogleMapsApiProvider.prototype = Object.create(baseProto);
	GoogleMapsApiProvider.prototype.constructor = GoogleMapsApiProvider;

	GoogleMapsApiProvider.prototype.initMap = function() {
		baseProto.initMap.call(this);

		initGoogleMap.call(this);
	};

	GoogleMapsApiProvider.prototype.getMarkerSelectionContainer = function() {
		this._markerSelectorContainerEl = baseProto.getMarkerSelectionContainer.call(this);

		if(!this._markerSelectorContainerEl) {
			this._markerSelectorContainerEl = document.createElement("div");
			this._mapImpl.controls[google.maps.ControlPosition.LEFT_TOP].push(this._markerSelectorContainerEl);
		}

		return this._markerSelectorContainerEl;
	};

	var initGoogleMap = function() {
		var mapOptions = getGoogleMapOptions();

		this._mapImpl = new google.maps.Map(this._containerEl, mapOptions);

		google.maps.event.addListener(this._mapImpl, "click", this._onMapClicked.bind(this));
		google.maps.event.addListener(this._mapImpl, "idle", onMapMove.bind(this));
		google.maps.event.addListenerOnce(this._mapImpl, "idle", onMapReady.bind(this));

		initInfoWindow.call(this);
		initDrawingManager.call(this);
	};

	var getGoogleMapOptions = function() {
		return {
			center: new google.maps.LatLng(0,0),
			zoom: 1,
			fullscreenControl: false,
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
	};

	var initInfoWindow = function() {
		this._infoWindow = new google.maps.InfoWindow();
	};

	var initDrawingManager = function() {
		this._drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: null,
			drawingControl: false
		});
		this._drawingManager.setMap(this._mapImpl);

		google.maps.event.addListener(this._drawingManager, "markercomplete", onDrawingManagerPointComplete.bind(this));
		google.maps.event.addListener(this._drawingManager, "polylinecomplete", onDrawingManagerPolylineComplete.bind(this));
		google.maps.event.addListener(this._drawingManager, "polygoncomplete", onDrawingManagerPolygonComplete.bind(this));
	};

	var onDrawingManagerPointComplete = function(googleMarker) {
		googleMarker.setMap(null);

		var location = convertGoogleLatLngToLocation(googleMarker.getPosition());
		this._onPointMarkerCreated(location);
	};

	var onDrawingManagerPolylineComplete = function(polylineOverlay) {
		polylineOverlay.setMap(null);

		var latLngArray = polylineOverlay.getPath().getArray();
		var locations = convertGoogleLatLngArrayToLocationArray(latLngArray);

		this._onPolylineMarkerCreated(locations);
	};

	var onDrawingManagerPolygonComplete = function(polygonOverlay) {
		polygonOverlay.setMap(null);

		var latLngArray = polygonOverlay.getPath().getArray();
		var locations = convertGoogleLatLngArrayToLocationArray(latLngArray);

		this._onPolygonMarkerCreated(locations);
	};

	GoogleMapsApiProvider.prototype.clearMarkers = function() {
		for(var markerId in this._googleMarkers) {
			if(this._googleMarkers.hasOwnProperty(markerId)) {
				this._googleMarkers[markerId].setMap(null);
				delete this._googleMarkers[markerId];
			}
		}
	};

	GoogleMapsApiProvider.prototype.setDrawingMode = function(drawingMode) {
		baseProto.setDrawingMode.call(this, drawingMode);

		var drawingOverlayType = getDrawingOverlayTypeFromDrawingMode.call(this, drawingMode);
		this._drawingManager.setOptions({ drawingMode: drawingOverlayType });
	};

	var getDrawingOverlayTypeFromDrawingMode = function(drawingMode) {
		var ot = google.maps.drawing.OverlayType;

		switch(drawingMode) {
			case this.DRAWING_POINT:
				return ot.MARKER;
			case this.DRAWING_POLYLINE:
				return ot.POLYLINE;
			case this.DRAWING_POLYGON:
				return ot.POLYGON;
		}

		return null;
	};

	GoogleMapsApiProvider.prototype.addPointMarker = function(pointMarker) {
		baseProto.addPointMarker.call(this, pointMarker);

		var latLng = convertLocationToGoogleLatLng(pointMarker.location);
		var iconId = pointMarker.iconId || 1;
		var mapMarker = new google.maps.Marker({
			position: latLng,
			icon: this._markerIcons[iconId]
		});

		addMarkerToMap.call(this, pointMarker, mapMarker);
	};

	GoogleMapsApiProvider.prototype.addPolylineMarker = function(polylineMarker) {
		baseProto.addPolylineMarker.call(this, polylineMarker);

		var latLngs = polylineMarker.locations.map(convertLocationToGoogleLatLng);
		if(latLngs.length) {
			var strokeColor = this._markerColors[polylineMarker.lineColorId] || this._markerColors[1];

			var mapMarker = new google.maps.Polyline({
				path: latLngs,
				strokeColor: strokeColor,
				strokeWeight: polylineMarker.width
			});

			addMarkerToMap.call(this, polylineMarker, mapMarker);
		}
	};

	GoogleMapsApiProvider.prototype.addPolygonMarker = function(polygonMarker) {
		baseProto.addPolygonMarker.call(this, polygonMarker);

		var latLngs = polygonMarker.locations.map(convertLocationToGoogleLatLng);
		if(latLngs.length) {
			var strokeColor = this._markerColors[polygonMarker.lineColorId] || this._markerColors[1];
			var fillColor = this._markerColors[polygonMarker.fillColorId] || this._markerColors[1];

			var mapMarker = new google.maps.Polygon({
				path: latLngs,
				strokeColor: strokeColor,
				fillColor: fillColor,
				fillOpacity: 0.7,
				strokeWeight: polygonMarker.width
			});

			addMarkerToMap.call(this, polygonMarker, mapMarker);
		}
	};

	var addMarkerToMap = function(meshmapMarker, googleMarker) {
		googleMarker.setMap(this._mapImpl);
		google.maps.event.addListener(googleMarker, "click", onMarkerClick.bind(this, meshmapMarker));
		this._googleMarkers[meshmapMarker.id] = googleMarker;
	};

	var onMarkerClick = function(marker, gMapEvent) {
		var location = convertGoogleLatLngToLocation(gMapEvent.latLng);
		this._onMarkerClicked(marker, location);
	};

	var convertGoogleLatLngArrayToLocationArray = function(latLngArray) {
		return latLngArray.map(function(latLng) {
			return convertGoogleLatLngToLocation(latLng);
		});
	};

	var convertLocationToGoogleLatLng = function(location) {
		return new google.maps.LatLng(location.lat, location.lng);
	};

	var convertGoogleLatLngToLocation = function(latLng) {
		return new Location(latLng.lat(), latLng.lng());
	};

	GoogleMapsApiProvider.prototype.removeMarker = function(marker) {
		if(this._googleMarkers[marker.id]) {
			this._googleMarkers[marker.id].setMap(null);
			delete this._googleMarkers[marker.id];
			this._infoWindow.close();
		}
	};

	GoogleMapsApiProvider.prototype.setExtent = function(mapExtent) {
		var mapImpl = this._mapImpl;

		this._mapImpl.fitBounds(
			new google.maps.LatLngBounds(
				new google.maps.LatLng(mapExtent.min.lat, mapExtent.min.lng),
				new google.maps.LatLng(mapExtent.max.lat, mapExtent.max.lng)
			)
		);

		// A hack to better represent initial extent on map load
		google.maps.event.addListenerOnce(mapImpl, "bounds_changed", function() {
			var zoom = mapImpl.getZoom();
			if(zoom < MAX_ZOOM_LEVEL) {
				mapImpl.setZoom(zoom + 1);
			}
		});
	};

	GoogleMapsApiProvider.prototype.setMapHeight = function(mapHeightPx) {
		// jshint unused:vars
		google.maps.event.trigger(this._mapImpl, "resize");
	};

	GoogleMapsApiProvider.prototype.showMarkerInfo = function(markerInfoContext, anchorLocation) {
		this._infoWindow.close();

		var anchorLatLng = convertLocationToGoogleLatLng(anchorLocation);

		var contentContainerEl = document.createElement("div");
		var options = {
			content: contentContainerEl,
			position: anchorLatLng
		};
		this._infoWindow.setOptions(options);

		var marker = markerInfoContext.marker;
		var anchor = markerIsPointMarker(marker) ? this._googleMarkers[marker.id] : undefined;
		this._infoWindow.open(this._mapImpl, anchor);

		this._viewInjectionService.injectAndCreate(contentContainerEl, "MarkerInfoNewCtrl", "html/partials/markerinfo-new.html", markerInfoContext);
	};

	GoogleMapsApiProvider.prototype._onMapClicked = function() {
		baseProto._onMapClicked.call(this);
		this._infoWindow.close();
	};

	var onMapMove = function() {
		var bounds = this._mapImpl.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();

		var min = new Location(sw.lat(), sw.lng());
		var max = new Location(ne.lat(), ne.lng());

		var mapExtent = new MapExtent(min, max);
		baseProto._onMapMoved.call(this, mapExtent);
	};

	var onMapReady = function() {
		this.trigger("mapReady");
	};

	var markerIsPointMarker = function(marker) {
		return marker instanceof PointMarker;
	};

	return GoogleMapsApiProvider;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.google.GoogleMapsApiProvider;
}
