require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteCodeService = loader.load("utils/SiteCodeService");
var AppConfigService = loader.load("config/AppConfigService");
var AppConfig = loader.load("config/AppConfig");

var DEFAULT_SITE_CODE_LENGTH = 7;

var VALID_SITE_CODE_CHARS_REGEX = /^[0-9a-z]+$/;

describe("A site code service", function() {

	describe("createSiteCode method", function() {

		it("exists", function() {
			var scs = createSiteCodeService();

			expect(typeof scs.createSiteCode).toBe("function");
		});

		it("calls getAppConfig on app config service", function() {
			var acs = createAppConfigService(),
				scs = createSiteCodeService({ appConfigService: acs });

			scs.createSiteCode();

			expect(acs.getAppConfig).toHaveBeenCalled();
		});

		it("returns a string object", function() {
			var acs = createAppConfigService(),
				scs = createSiteCodeService({ appConfigService: acs });

			var returnedSiteCode = scs.createSiteCode();

			expect(typeof returnedSiteCode).toBe("string");
		});

		it("returns 6-character site code when app config specifies site codes should be 6 characters long", function() {
			var	siteCodeLength = 6,
				acs = createAppConfigServiceWhichSpecifiesSiteCodeLength(siteCodeLength),
				scs = createSiteCodeService({ appConfigService: acs });

			var returnedSiteCode = scs.createSiteCode();

			expect(returnedSiteCode.length).toBe(siteCodeLength);
		});

		it("returns 8-character site code when app config specifies site codes should be 8 characters long", function() {
			var	siteCodeLength = 8,
				acs = createAppConfigServiceWhichSpecifiesSiteCodeLength(siteCodeLength),
				scs = createSiteCodeService({ appConfigService: acs });

			var returnedSiteCode = scs.createSiteCode();

			expect(returnedSiteCode.length).toBe(siteCodeLength);
		});

		it("returns a site code with only lowercase alphanumeric characters", function() {
			var	acs = createAppConfigService(),
				scs = createSiteCodeService({ appConfigService: acs });

			var returnedSiteCode = scs.createSiteCode();

			expect(VALID_SITE_CODE_CHARS_REGEX.test(returnedSiteCode)).toBe(true);
		});

		it("returns unique site codes", function() {
			var	acs = createAppConfigService(),
				scs = createSiteCodeService({ appConfigService: acs });

			var firstSiteCode = scs.createSiteCode();
			var secondSiteCode = scs.createSiteCode();

			expect(firstSiteCode).not.toBe(secondSiteCode);
		});

	});

	describe("isSiteCode method", function() {

		it("exists", function() {
			var scs = createSiteCodeService();

			expect(typeof scs.isSiteCode).toBe("function");
		});

		it("returns false when given null", function() {
			var scs = createSiteCodeService();

			var isValidSiteCode = scs.isSiteCode(null);

			expect(isValidSiteCode).toBe(false);
		});

		it("returns false when given a non-string type", function() {
			var scs = createSiteCodeService();

			var isValidSiteCode = scs.isSiteCode(987);

			expect(isValidSiteCode).toBe(false);
		});

		it("returns false when given string containing invalid site code characters", function() {
			var scs = createSiteCodeService();

			var isValidSiteCode = scs.isSiteCode("abc|76");

			expect(isValidSiteCode).toBe(false);
		});

		it("returns true when given valid site code", function() {
			var scs = createSiteCodeService();

			var isValidSiteCode = scs.isSiteCode("bdy84e");

			expect(isValidSiteCode).toBe(true);
		});

	});

});

function createSiteCodeService(deps) {
	deps = deps || {};
	deps.appConfigService = deps.appConfigService || createAppConfigService();

	return new SiteCodeService(deps);
}

function createAppConfigService() {
	return createAppConfigServiceWhichSpecifiesSiteCodeLength(DEFAULT_SITE_CODE_LENGTH);
}

function createAppConfigServiceWhichSpecifiesSiteCodeLength(siteCodeLength) {
	var returnedAppConfig = createAppConfigWithSiteCodeLength(siteCodeLength);

	var acs = new AppConfigService({});
	spyOn(acs, "getAppConfig").and.returnValue(returnedAppConfig);
	return acs;
}

function createAppConfigWithSiteCodeLength(siteCodeLength) {
	var ac = new AppConfig();
	ac.siteCodeLength = siteCodeLength;
	return ac;
}
