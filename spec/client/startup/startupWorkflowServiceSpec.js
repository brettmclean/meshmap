require("../testUtils/init");
var loader = require("../testUtils/loader");

var StartupWorkflowService = loader.load("startup/StartupWorkflowService"),
	EventBus = loader.load("events/EventBus"),
	CommsService = loader.load("utils/comms/CommsService"),
	PageStateService = loader.load("state/PageStateService"),
	StorageService = loader.load("utils/StorageService"),
	SecretGenerator = loader.load("utils/SecretGenerator"),
	Logger = loader.load("utils/logging/Logger"),
	dm = loader.load("model/datamodel"),
	ConnectInfo = dm.ConnectInfo;

var SITE_CODE = "abc123";
var SECRET = "secret987";

describe("A startup workflow service", function() {

	it("sends connect info when connected", function() {
		// jshint unused: false
		var eb = createEventBus(),
			cs = createCommsService(),
			sws = createStartupWorkflowService({
				eventBus: eb,
				commsService: cs
			});

		sws.init();
		eb.publish("connected");

		expect(cs.sendConnectInfo).toHaveBeenCalledWith(jasmine.any(ConnectInfo), jasmine.any(Function));
	});

	it("provides a site code and secret in connection info", function() {
		var mySiteCode = "123456",
			mySecret = "lkjsfoijsr",
			cs = createCommsService(),
			pss = createPageStateServiceWhichReturnsSiteCode(mySiteCode),
			sg = createSecretGeneratorWhichGeneratesSecret(mySecret),
			sws = createStartupWorkflowService({
				commsService: cs,
				pageStateService: pss,
				secretGenerator: sg
			});

		simulateConnected(sws);

		var callArgs = cs.sendConnectInfo.calls.argsFor(0);
		var connectInfo = callArgs[0];
		var siteCode = connectInfo.siteCode;
		var secret = connectInfo.secret;

		expect(siteCode).toBe(mySiteCode);
		expect(secret).toEqual(mySecret);
	});

	it("queries the provided secret generator when storage service does not contain secret", function() {
		var cs = createCommsService(),
			ss = createStorageServiceWhichReturnsValue(null),
			sg = createSecretGeneratorWhichGeneratesSecret(SECRET),
			sws = createStartupWorkflowService({
				commsService: cs,
				storageService: ss,
				secretGenerator: sg
			});

		simulateConnected(sws);

		expect(sg.generate).toHaveBeenCalled();
	});

	it("does not query the secret generator when storage service already contains secret", function() {
		var cs = createCommsService(),
			ss = createStorageServiceWhichReturnsValue(SECRET),
			sg = createSecretGeneratorWhichGeneratesSecret(null),
			sws = createStartupWorkflowService({
				commsService: cs,
				storageService: ss,
				secretGenerator: sg
			});

		simulateConnected(sws);

		expect(sg.generate).not.toHaveBeenCalled();
	});

});

function simulateConnected(startupWorkflowService) {
	startupWorkflowService._onConnected();
}

function createStartupWorkflowService(deps) {
	deps = deps || {};

	deps.eventBus = deps.eventBus || createEventBus();
	deps.commsService = deps.commsService || createCommsService();
	deps.pageStateService = deps.pageStateService || createPageStateServiceWhichReturnsSiteCode(SITE_CODE);
	deps.storageService = deps.storageService || createStorageServiceWhichReturnsValue(null);
	deps.secretGenerator = deps.secretGenerator || createSecretGeneratorWhichGeneratesSecret(SECRET);
	deps.logger = deps.logger || createLogger();

	return new StartupWorkflowService(deps);
}

function createEventBus() {
	return new EventBus();
}

function createCommsService() {
	var cs = new CommsService({});
	spyOn(cs, "sendConnectInfo");
	return cs;
}

function createPageStateServiceWhichReturnsSiteCode(siteCode) {
	var pss = new PageStateService({});
	spyOn(pss, "getPath").and.returnValue(`/m/${siteCode}`);
	return pss;
}

function createStorageServiceWhichReturnsValue(value) {
	var ss = new StorageService();
	spyOn(ss, "get").and.returnValue(value);
	spyOn(ss, "set");
	return ss;
}

function createSecretGeneratorWhichGeneratesSecret(secret) {
	var sg = new SecretGenerator();
	spyOn(sg, "generate").and.returnValue(secret);
	return sg;
}

function createLogger() {
	var logger = new Logger("info", null);
	spyOn(logger, "debug");
	return logger;
}
