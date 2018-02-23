require("../testUtils/init");
var loader = require("../testUtils/loader");

var StartupWorkflowService = loader.load("startup/StartupWorkflowService"),
	EventBus = loader.load("events/EventBus"),
	CommsService = loader.load("utils/comms/CommsService"),
	PageStateService = loader.load("state/PageStateService"),
	StorageService = loader.load("utils/StorageService"),
	SecretGenerator = loader.load("utils/SecretGenerator"),
	dm = loader.load("model/datamodel"),
	ConnectInfo = dm.ConnectInfo;

var SITE_CODE = "abc123";
var SECRET = "secret987";

var simulateConnected = function(startupWorkflowService) {
	startupWorkflowService._onConnected();
};

var createStartupWorkflowServiceWithEventBusAndCommsService = function(eventBus, commsService) {
	return new StartupWorkflowService({
		eventBus: eventBus,
		commsService: commsService
	});
};

var createStartupWorkflowServiceWithCommsServiceAndPageStateServiceAndSecretGenerator = function(
	commsService,
	pageStateService,
	secretGenerator) {

	return new StartupWorkflowService({
		commsService: commsService,
		pageStateService: pageStateService,
		secretGenerator: secretGenerator
	});
};

var createStartupWorkflowServiceWithCommsServiceAndStorageServiceAndSecretGenerator = function(
	commsService,
	storageService,
	secretGenerator) {

	return new StartupWorkflowService({
		commsService: commsService,
		storageService: storageService,
		secretGenerator: secretGenerator
	});
};

describe("A startup workflow service", function() {

	it("sends connect info when connected", function() {
		// jshint unused: false
		var eb = new EventBus(),
			cs = new CommsService(),
			sws = createStartupWorkflowServiceWithEventBusAndCommsService(eb, cs);

		spyOn(cs, "sendConnectInfo");
		eb.publish("connected");

		expect(cs.sendConnectInfo).toHaveBeenCalledWith(jasmine.any(ConnectInfo), jasmine.any(Function));
	});

	it("provides a site code and secret in connection info", function() {
		// jshint unused: false
		var cs = new CommsService(),
			pss = new PageStateService(),
			sg = new SecretGenerator(),
			sws = createStartupWorkflowServiceWithCommsServiceAndPageStateServiceAndSecretGenerator(cs, pss, sg);

		spyOn(pss, "getPath").and.returnValue("/m/" + SITE_CODE);
		spyOn(cs, "sendConnectInfo");
		simulateConnected(sws);

		var callArgs = cs.sendConnectInfo.calls.argsFor(0);
		var connectInfo = callArgs[0];
		var siteCode = connectInfo.siteCode;
		var secret = connectInfo.secret;

		expect(siteCode).toBe(SITE_CODE);
		expect(secret).toEqual(jasmine.any(String));
	});

	it("queries the provided secret generator when storage service does not contain secret", function() {
		// jshint unused: false
		var cs = new CommsService(),
			ss = new StorageService(),
			sg = new SecretGenerator(),
			sws = createStartupWorkflowServiceWithCommsServiceAndStorageServiceAndSecretGenerator(cs, ss, sg);

		spyOn(ss, "get").and.returnValue(null);
		spyOn(ss, "set");
		spyOn(cs, "sendConnectInfo");
		spyOn(sg, "generate");
		simulateConnected(sws);

		expect(cs.sendConnectInfo).toHaveBeenCalledWith(jasmine.any(ConnectInfo), jasmine.any(Function));
		expect(sg.generate).toHaveBeenCalled();
	});

	it("does not query the secret generator when storage service already contains secret", function() {
		// jshint unused: false
		var cs = new CommsService(),
			ss = new StorageService(),
			sg = new SecretGenerator(),
			sws = createStartupWorkflowServiceWithCommsServiceAndStorageServiceAndSecretGenerator(cs, ss, sg);

		spyOn(ss, "get").and.returnValue(SECRET);
		spyOn(cs, "sendConnectInfo");
		spyOn(sg, "generate");
		simulateConnected(sws);

		var callArgs = cs.sendConnectInfo.calls.argsFor(0);
		var connectInfo = callArgs[0];

		expect(sg.generate).not.toHaveBeenCalled();
		expect(connectInfo.secret).toBe(SECRET);
	});

});
