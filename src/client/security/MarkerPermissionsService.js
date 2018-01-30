meshmap.namespace("meshmap.security");

meshmap.security.MarkerPermissionsService = (function() {

	// imports
	var dm = meshmap.models;

	function MarkerPermissionsService(siteService) {
		this._siteService = siteService;
	}

	MarkerPermissionsService.prototype.getUserCanEditMarker = function(marker) {
		if(!objectIsMarker(marker)) {
			throw new TypeError("marker must be of type Marker");
		}

		var onlyMarkerOwnerCanEditMarkers = this._siteService.getOnlyOwnerCanEdit();

		if(!onlyMarkerOwnerCanEditMarkers) {
			return true;
		}

		var currentUserId = this._siteService.getCurrentUserId();
		return currentUserId === marker.ownerId;
	};

	var objectIsMarker = function(obj) {
		return obj instanceof dm.Marker;
	};

	return MarkerPermissionsService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.security.MarkerPermissionsService;
}
