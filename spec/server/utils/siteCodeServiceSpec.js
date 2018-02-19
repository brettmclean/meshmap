require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteCodeService = loader.load("utils/SiteCodeService");

describe("A site code service", function() {

	describe("createSiteCode method", function() {

		it("exists", function() {
			var scs = createSiteCodeService();

			expect(typeof scs.createSiteCode).toBe("function");
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

function createSiteCodeService() {
	return new SiteCodeService();
}
