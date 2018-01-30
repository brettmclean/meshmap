require("../testUtils/init");
var loader = require("../testUtils/loader");

var AppConfig = loader.load("config/AppConfig");

var FileAppConfigService = loader.load("config/FileAppConfigService");
var FileReadService = loader.load("utils/FileReadService");

var dm = loader.load("datamodel");

var DEFAULT_CONFIG_FILE_PATH = "/path/to/config/server.json";

describe("A file app config service", function() {

	describe("readJsonFileAndApplyConfig method", function() {

		it("returns same AppConfig object provided to it", function() {
			var facs = createFileAppConfigService(),
				appConfig = new AppConfig();

			var returnedAppConfig = facs.readJsonFileAndApplyConfig(appConfig);

			expect(returnedAppConfig).toBe(appConfig);
		});

		it("calls readAsUtf8StringSync on file read service with provided config file path", function() {
			var frs = createFileReadServiceWhichReturnsEmptyJsonObject(),
				configFilePath = "/my/configured/file/path/server.json",
				facsDeps = { fileReadService: frs },
				facs = createFileAppConfigService(facsDeps, configFilePath);

			facs.readJsonFileAndApplyConfig(new AppConfig());

			expect(frs.readAsUtf8StringSync).toHaveBeenCalledWith(configFilePath);
		});

		it("throws SyntaxError when file read service provides malformed JSON string", function() {
			var frs = createFileReadServiceWhichReturnsString("{ whoops }"),
				facs = createFileAppConfigService({ fileReadService: frs });

			expect(function() {
				facs.readJsonFileAndApplyConfig(new AppConfig());
			}).toThrowError(SyntaxError);
		});

		it("overrides portNumber in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("portNumber", 7777, 9999);
		});

		it("does not override portNumber in provided AppConfig when not set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("portNumber", 7777);
		});

		it("overrides siteCodeLength in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("siteCodeLength", 6, 7);
		});

		it("does not override siteCodeLength in provided AppConfig when not set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("siteCodeLength", 8);
		});

		it("overrides apiPath in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("apiPath", "/api", "/myapi");
		});

		it("does not override apiPath in provided AppConfig when not set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("apiPath", "/api");
		});

		it("overrides apiKey in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("apiKey", "654bc564dea", "234ffe677c");
		});

		it("does not override apiKey in provided AppConfig when not set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("apiKey", "654bc564dea");
		});

		it("overrides store type in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("store.type", "memory", "postgresql");
		});

		it("does not override store type in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("store.type", "memory");
		});

		it("overrides store connection string in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("store.connectionString", "proto://localhost", "proto://remotehost");
		});

		it("does not override store connection string in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("store.connectionString", "proto://localhost");
		});

		it("overrides store max connections in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("store.maxConnections", 10, 50);
		});

		it("does not override store max connections in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("store.maxConnections", 10);
		});

		it("overrides logging level in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("logging.level", "info", "warn");
		});

		it("does not override logging level in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("logging.level", "debug");
		});

		it("overrides logging directory in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("logging.directory", "logs", "mylogs");
		});

		it("does not override logging directory in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("logging.directory", "mylogs");
		});

		it("overrides logging console output in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("logging.logToConsole", false, true);
		});

		it("does not override logging console output in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("logging.logToConsole", true);
		});

		it("overrides site defaults only owner can edit markers in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("siteDefaults.onlyOwnerCanEdit", false, true);
		});

		it("does not override site defaults only owner can edit markers in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("siteDefaults.onlyOwnerCanEdit", true);
		});

		it("overrides limits new site per IP per hour in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("limits.newSitesPerIpPerHour", 10, 100);
		});

		it("does not override limits new site per IP per hour in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("limits.newSitesPerIpPerHour", 50);
		});

		it("overrides limits allowed event loop lag in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("limits.allowedEventLoopLagMs", 100, 300);
		});

		it("does not override limits allowed event loop lag in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("limits.allowedEventLoopLagMs", 200);
		});

		it("overrides limits avoid caching above heap size in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsOverridenWhenSetInConfigFile("limits.avoidCachingAboveHeapSizeMib", 64, 128);
		});

		it("does not override limits avoid caching above heap size in provided AppConfig when set in config file JSON", function() {
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("limits.avoidCachingAboveHeapSizeMib", 256);
		});

		it("overrides site defaults initial extent in provided AppConfig when set in config file JSON", function() {
			var SITE_DEFAULTS_INITIAL_EXTENT_JSON = "{ \"siteDefaults\": { \"initialExtent\": { \"minLat\": 20, \"minLng\": -140, \"maxLat\": 60, \"maxLng\": -55 } } }";

			var frs = createFileReadServiceWhichReturnsString(SITE_DEFAULTS_INITIAL_EXTENT_JSON),
				facs = createFileAppConfigService({ fileReadService: frs }),
				appConfig = new AppConfig();
			appConfig.siteDefaults.initialExtent = new dm.MapExtent(new dm.Location(0, 0), new dm.Location(20, 20));

			var returnedAppConfig = facs.readJsonFileAndApplyConfig(appConfig);
			var assignedInitialExtent = returnedAppConfig.siteDefaults.initialExtent;

			expect(assignedInitialExtent instanceof dm.MapExtent).toBe(true);
			expect(assignedInitialExtent.min.lat).toBe(20);
			expect(assignedInitialExtent.min.lng).toBe(-140);
			expect(assignedInitialExtent.max.lat).toBe(60);
			expect(assignedInitialExtent.max.lng).toBe(-55);
		});

		it("does not override site defaults initial extent in provided AppConfig when set in config file JSON", function() {
			var INITIAL_EXTENT = new dm.MapExtent(new dm.Location(20, -140), new dm.Location(60, -55));
			testThatPropertyIsNotOverridenWhenNotSetInConfigFile("siteDefaults.initialExtent", INITIAL_EXTENT);
		});

		it("does not override store connection string when store type is set in config file JSON", function() {
			var expectedConnStr = "proto://localhost";
			var jsonString = getJsonStringForPropertyPathAndValue("store.type".split("."), "memory");

			var frs = createFileReadServiceWhichReturnsString(jsonString),
				facs = createFileAppConfigService({ fileReadService: frs }),
				appConfig = new AppConfig();
			appConfig.store.connectionString = expectedConnStr;

			var returnedAppConfig = facs.readJsonFileAndApplyConfig(appConfig);

			expect(returnedAppConfig.store.connectionString).toBe(expectedConnStr);
		});

		it("does not set properties which do not exist on AppConfig", function() {
			var jsonString = getJsonStringForPropertyPathAndValue("store.doesnotexist".split("."), "myvalue");

			var frs = createFileReadServiceWhichReturnsString(jsonString),
				facs = createFileAppConfigService({ fileReadService: frs }),
				appConfig = new AppConfig();

			var returnedAppConfig = facs.readJsonFileAndApplyConfig(appConfig);

			expect(typeof returnedAppConfig.store.doesnotexist).toBe("undefined");
		});

	});

});

function testThatPropertyIsOverridenWhenSetInConfigFile(propertyName, previousValue, jsonValue) {
	var propertyNamePath = propertyName.split(".");
	var jsonString = getJsonStringForPropertyPathAndValue(propertyNamePath, jsonValue);

	var frs = createFileReadServiceWhichReturnsString(jsonString),
		facs = createFileAppConfigService({ fileReadService: frs }),
		appConfig = new AppConfig();
	assignValueToPropertyPath(appConfig, propertyNamePath, previousValue);

	var returnedAppConfig = facs.readJsonFileAndApplyConfig(appConfig);

	var assignedValue = getValueAtPropertyPath(returnedAppConfig, propertyNamePath);
	expect(assignedValue).toBe(jsonValue);
}

function testThatPropertyIsNotOverridenWhenNotSetInConfigFile(propertyName, value) {
	var propertyNamePath = propertyName.split(".");
	var frs = createFileReadServiceWhichReturnsEmptyJsonObject(),
		facs = createFileAppConfigService({ fileReadService: frs }),
		appConfig = new AppConfig();
	assignValueToPropertyPath(appConfig, propertyNamePath, value);

	var returnedAppConfig = facs.readJsonFileAndApplyConfig(appConfig);

	var assignedValue = getValueAtPropertyPath(returnedAppConfig, propertyNamePath);
	expect(assignedValue).toBe(value);
}

function getJsonStringForPropertyPathAndValue(propertyNamePath, value) {
	if(propertyNamePath.length === 1) {
		var valueStr = typeof value === "string" ? `"${value}"` : `${value}`;
		return `{ "${propertyNamePath[0]}": ${valueStr} }`;
	}

	var valueObj = getJsonStringForPropertyPathAndValue(propertyNamePath.slice(1), value);
	return `{ "${propertyNamePath[0]}": ${valueObj} }`;
}

function assignValueToPropertyPath(obj, propertyNamePath, value) {
	if(propertyNamePath.length === 1) {
		obj[propertyNamePath[0]] = value;
		return;
	}

	assignValueToPropertyPath(obj[propertyNamePath[0]], propertyNamePath.slice(1), value);
}

function getValueAtPropertyPath(obj, propertyNamePath) {
	for(var i = 0; i < propertyNamePath.length; i++) {
		obj = obj[propertyNamePath[i]];
	}
	return obj;
}

function createFileAppConfigService(deps, configFilePath) {
	deps = deps || {};
	deps.fileReadService = deps.fileReadService || createFileReadServiceWhichReturnsEmptyJsonObject();

	configFilePath = configFilePath || DEFAULT_CONFIG_FILE_PATH;

	return new FileAppConfigService(deps, configFilePath);
}

function createFileReadServiceWhichReturnsEmptyJsonObject() {
	return createFileReadServiceWhichReturnsString("{}");
}

function createFileReadServiceWhichReturnsString(str) {
	var frs = new FileReadService();
	spyOn(frs, "readAsUtf8StringSync").and.returnValue(str);
	return frs;
}
