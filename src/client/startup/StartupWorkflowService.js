meshmap.namespace("meshmap.startup");

meshmap.startup.StartupWorkflowService = (function() {

	// imports
	var dm = meshmap.models,
		ConnectInfo = dm.ConnectInfo;

	var SECRET_STORAGE_KEY = "userSecret";
	var SECRET_STORAGE_LENGTH_SECONDS = 10 * 365 * 24 * 60 * 60;

	var StartupWorkflowService = function(deps) {
		this._eventBus = deps.eventBus;
		this._commsService = deps.commsService;
		this._pageStateService = deps.pageStateService;
		this._storageService = deps.storageService;
		this._secretGenerator = deps.secretGenerator;
		this._logger = deps.logger;
	};

	StartupWorkflowService.prototype.init = function() {
		this._subscribeToEvents();
	};

	StartupWorkflowService.prototype._subscribeToEvents = function() {
		this._eventBus.subscribe("connected", this._onConnected.bind(this));
	};

	StartupWorkflowService.prototype._onConnected = function() {
		var siteId = getSiteId.call(this);
		var secret = getOrCreateSecret.call(this);

		var connectInfo = new ConnectInfo(siteId, secret);
		this._commsService.sendConnectInfo(connectInfo, onConnectInfoAccepted.bind(this));
		logDebug.call(this, "Sent connect info.");
	};

	var getSiteId = function() {
		var path = this._pageStateService.getPath();
		return extractSiteIdFromPath(path);
	};

	var extractSiteIdFromPath = function(path) {
		return path.replace(/^\/m\//, "");
	};

	var getOrCreateSecret = function() {
		var secret = getSecretFromStorage.call(this);

		if(!secret) {
			secret = generateSecret.call(this);
			setSecretInStorage.call(this, secret);
		}

		return secret;
	};

	var getSecretFromStorage = function() {
		return this._storageService.get(SECRET_STORAGE_KEY);
	};

	var setSecretInStorage = function(secret) {
		this._storageService.set(SECRET_STORAGE_KEY, secret, SECRET_STORAGE_LENGTH_SECONDS);
	};

	var generateSecret = function() {
		return this._secretGenerator.generate();
	};

	var onConnectInfoAccepted = function(startupData) {
		if(startupData) {
			logDebug.call(this, "Received startup data.");
		}
	};

	var logDebug = function(msg) {
		this._logger.debug(msg);
	};

	return StartupWorkflowService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.startup.StartupWorkflowService;
}
