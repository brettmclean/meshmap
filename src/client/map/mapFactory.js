meshmap.namespace("meshmap.map");

meshmap.map.mapFactory = (function() {

	// imports
	var MapBase = meshmap.map.MapBase,
		GoogleMap = meshmap.map.google.GoogleMap;

	var MAP_TYPES = {
		GOOGLE: "googleMaps"
	};

	var create = function(deps) {
		var mapConfig = deps.mapConfig;
		var apiProvider = deps.apiProvider;
		var markerSelectionContext = deps.markerSelectionContext;
		var viewInjectionService = deps.viewInjectionService;

		var MapCtor = getMapConstructor(mapConfig.type);
		var mapOptions = getMapOptions(mapConfig);
		var mapDeps = {
			apiProvider: apiProvider,
			markerSelectionContext: markerSelectionContext,
			viewInjectionService: viewInjectionService
		};

		return new MapCtor(mapDeps, mapOptions);
	};

	var getMapConstructor = function(mapType) {
		var mapCtor = MapBase;
		if(mapType === MAP_TYPES.GOOGLE) {
			mapCtor = GoogleMap;
		}
		return mapCtor;
	};

	var getMapOptions = function(mapConfig) {
		var opts = {};

		if(mapConfig.key) {
			opts.key = mapConfig.key;
		}

		return opts;
	};

	return {
		create: create
	};

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.mapFactory;
}
