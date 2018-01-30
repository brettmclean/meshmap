meshmap.namespace("meshmap.map");

meshmap.map.mapApiProviderFactory = (function() {

	// imports
	var MapApiProviderBase = meshmap.map.MapApiProviderBase,
		GoogleMapsApiProvider = meshmap.map.google.GoogleMapsApiProvider;

	var MAP_TYPES = {
		GOOGLE: "googleMaps"
	};

	var create = function(mapConfig, containerEl, viewInjectionService) {
		mapConfig = mapConfig || {};
		var ProviderCtor = getApiProviderConstructor(mapConfig.type);
		var providerDeps = {
			containerEl: containerEl,
			viewInjectionService: viewInjectionService
		};

		return new ProviderCtor(providerDeps);
	};

	var getApiProviderConstructor = function(mapType) {
		var providerCtor = MapApiProviderBase;
		if(mapType === MAP_TYPES.GOOGLE) {
			providerCtor = GoogleMapsApiProvider;
		}
		return providerCtor;
	};

	return {
		create: create
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.mapApiProviderFactory;
}
