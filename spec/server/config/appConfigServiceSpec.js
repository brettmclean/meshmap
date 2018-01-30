require("../testUtils/init");
var loader = require("../testUtils/loader");

var AppConfig = loader.load("config/AppConfig");
var AppConfigService = loader.load("config/AppConfigService");
var AppConfigCacheService = loader.load("config/AppConfigCacheService");
var DefaultAppConfigService = loader.load("config/DefaultAppConfigService");
var FileAppConfigService = loader.load("config/FileAppConfigService");

describe("An app config service", function() {

	describe("getAppConfig method", function() {

		it("returns an AppConfig", function() {
			var acs = createAppConfigService();

			var appConfig = acs.getAppConfig();

			expect(appConfig instanceof AppConfig).toBe(true);
		});

		it("calls getAppConfig on provided app config cache service", function() {
			var accs = createAppConfigCacheServiceWhichReturnsUndefined(),
				acsDeps = { appConfigCacheService: accs },
				acs = createAppConfigService(acsDeps);

			acs.getAppConfig();

			expect(accs.getAppConfig).toHaveBeenCalled();
		});

		it("returns app config returned by app config cache service", function() {
			var appConfig = new AppConfig(),
				accs = createAppConfigCacheServiceWhichReturnsAppConfig(appConfig),
				acsDeps = { appConfigCacheService: accs },
				acs = createAppConfigService(acsDeps);

			var returnedAppConfig = acs.getAppConfig();

			expect(returnedAppConfig).toBe(appConfig);
		});

		it("calls setAppConfig on provided app config cache service with AppConfig returned from file app config service", function() {
			var appConfig = new AppConfig(),
				accs = createAppConfigCacheServiceWhichReturnsUndefined(),
				facs = createFileAppConfigServiceWithConfigApplyLogic(function() {
					return appConfig;
				}),
				acsDeps = {
					appConfigCacheService: accs,
					fileAppConfigService: facs
				},
				acs = createAppConfigService(acsDeps);

			acs.getAppConfig();

			expect(accs.setAppConfig).toHaveBeenCalledWith(appConfig);
		});

		it("calls generateDefaultConfig on provided default app config service when cache service returns nothing", function() {
			var accs = createAppConfigCacheServiceWhichReturnsUndefined(),
				dacs = createDefaultAppConfigServiceWhichReturnsEmptyAppConfig(),
				acsDeps = {
					appConfigCacheService: accs,
					defaultAppConfigService: dacs
				},
				acs = createAppConfigService(acsDeps);

			acs.getAppConfig();

			expect(dacs.generateDefaultConfig).toHaveBeenCalled();
		});

		it("does not call generateDefaultConfig on provided default app config service when cache service returns app config", function() {
			var accs = createAppConfigCacheServiceWhichReturnsAppConfig(new AppConfig()),
				dacs = createDefaultAppConfigServiceWhichReturnsEmptyAppConfig(),
				acsDeps = {
					appConfigCacheService: accs,
					defaultAppConfigService: dacs
				},
				acs = createAppConfigService(acsDeps);

			acs.getAppConfig();

			expect(dacs.generateDefaultConfig).not.toHaveBeenCalled();
		});

		it("calls readJsonFileAndApplyConfig on file app config service with AppConfig returned from default app config service", function() {
			var appConfig = new AppConfig(),
				dacs = createDefaultAppConfigServiceWhichReturnsAppConfig(appConfig),
				facs = createFileAppConfigServiceWithPassthrough(),
				acsDeps = {
					defaultAppConfigService: dacs,
					fileAppConfigService: facs
				},
				acs = createAppConfigService(acsDeps);

			acs.getAppConfig();

			expect(facs.readJsonFileAndApplyConfig).toHaveBeenCalledWith(appConfig);
		});

		it("returns AppConfig returned by file app config service", function() {
			var myAppConfig = new AppConfig(),
				facs = createFileAppConfigServiceWithConfigApplyLogic(function() {
					return myAppConfig;
				}),
				acsDeps = {
					fileAppConfigService: facs
				},
				acs = createAppConfigService(acsDeps);

			var returnedAppConfig = acs.getAppConfig();

			expect(returnedAppConfig).toBe(myAppConfig);
		});

	});

	describe("reloadAppConfig", function() {

		it("calls removeAppConfig on cache service", function() {
			var accs = createAppConfigCacheServiceWhichReturnsUndefined(),
				acsDeps = {
					appConfigCacheService: accs
				},
				acs = createAppConfigService(acsDeps);

			acs.reloadAppConfig();

			expect(accs.removeAppConfig).toHaveBeenCalled();
		});

		it("calls getAppConfig", function() {
			var acs = createAppConfigService();
			spyOn(acs, "getAppConfig");

			acs.reloadAppConfig();

			expect(acs.getAppConfig).toHaveBeenCalled();
		});

		it("returns AppConfig returned by getAppConfig", function() {
			var appConfig = new AppConfig(),
				acs = createAppConfigService();
			spyOn(acs, "getAppConfig").and.returnValue(appConfig);

			var returnedAppConfig = acs.reloadAppConfig();

			expect(returnedAppConfig).toBe(appConfig);
		});

	});

});

function createAppConfigService(deps) {
	deps = deps || {};
	deps.appConfigCacheService = deps.appConfigCacheService || createAppConfigCacheServiceWhichReturnsUndefined();
	deps.defaultAppConfigService = deps.defaultAppConfigService || createDefaultAppConfigServiceWhichReturnsEmptyAppConfig();
	deps.fileAppConfigService = deps.fileAppConfigService || createFileAppConfigServiceWithPassthrough();

	return new AppConfigService(deps);
}

function createAppConfigCacheServiceWhichReturnsUndefined() {
	return createAppConfigCacheServiceWhichReturnsAppConfig(undefined);
}

function createAppConfigCacheServiceWhichReturnsAppConfig(appConfig) {
	var accs = new AppConfigCacheService({});
	spyOn(accs, "getAppConfig").and.returnValue(appConfig);
	spyOn(accs, "setAppConfig");
	spyOn(accs, "removeAppConfig");
	return accs;
}

function createDefaultAppConfigServiceWhichReturnsEmptyAppConfig() {
	return createDefaultAppConfigServiceWhichReturnsAppConfig(new AppConfig());
}

function createDefaultAppConfigServiceWhichReturnsAppConfig(appConfig) {
	var dacs = new DefaultAppConfigService();
	spyOn(dacs, "generateDefaultConfig").and.returnValue(appConfig);
	return dacs;
}

function createFileAppConfigServiceWithPassthrough() {
	return createFileAppConfigServiceWithConfigApplyLogic(function(appConfig) {
		return appConfig;
	});
}

function createFileAppConfigServiceWithConfigApplyLogic(fakeFunc) {
	var facs = new FileAppConfigService({}, null);
	spyOn(facs, "readJsonFileAndApplyConfig").and.callFake(fakeFunc);
	return facs;
}
