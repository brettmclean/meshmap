meshmap.namespace("meshmap.startup");

meshmap.startup.StartupWorkflowService = (function() {

	// imports
	var dm = meshmap.models,
		ConnectInfo = dm.ConnectInfo;

	var SECRET_STORAGE_KEY = "userSecret";
	var SECRET_STORAGE_LENGTH_SECONDS = 10 * 365 * 24 * 60 * 60;

	var StartupWorkflowService = function(deps) {
		deps = deps || /* istanbul ignore next */ {};

		this._eventBus = deps.eventBus || null;
		this._commsService = deps.commsService || null;
		this._pageStateService = deps.pageStateService || null;
		this._storageService = deps.storageService || null;
		this._secretGenerator = deps.secretGenerator || null;
		this._logger = deps.logger || null;

		this._subscribeToEvents();
	};

	StartupWorkflowService.prototype._subscribeToEvents = function() {
		if(this._eventBus) {
			this._eventBus.subscribe("connected", this._onConnected.bind(this));
		}
	};

	StartupWorkflowService.prototype._onConnected = function() {
		if(this._commsService) {
			var siteId = getSiteId.call(this);
			var secret = getOrCreateSecret.call(this);

			var connectInfo = new ConnectInfo(siteId, secret);
			this._commsService.sendConnectInfo(connectInfo, onConnectInfoAccepted.bind(this));
			logDebug.call(this, "Sent connect info.");
		}
	};

	var getSiteId = function() {
		var siteId = null;
		if(this._pageStateService) {
			var path = this._pageStateService.getPath();
			siteId = path.substring(1);
		}
		return siteId;
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
		return this._storageService ? this._storageService.get(SECRET_STORAGE_KEY) : null;
	};

	var setSecretInStorage = function(secret) {
		if(this._storageService) {
			this._storageService.set(SECRET_STORAGE_KEY, secret, SECRET_STORAGE_LENGTH_SECONDS);
		}
	};

	var generateSecret = function() {
		return this._secretGenerator ? this._secretGenerator.generate() : null;
	};

	var onConnectInfoAccepted = function(startupData) {
		if(startupData) {
			logDebug.call(this, "Received startup data.");
		}
	};

	var logDebug = function(msg) {
		if(this._logger) {
			this._logger.debug(msg);
		}
	};

	return StartupWorkflowService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.startup.StartupWorkflowService;
}
