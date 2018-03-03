require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteSettingHandler = loader.load("events/messageHandlers/SiteSettingHandler"),
	SiteService = loader.load("state/SiteService"),
	dm = loader.load("model/datamodel"),
	SettingUpdate = dm.SettingUpdate;

var SITE_NAME = "My awesome map";
var SITE_DESCRIPTION = "I totally made this map all by myself!";

describe("A site setting handler", function() {

	it("will defer site name changes to the site service", function() {
		var ss = createSiteService(),
			ssh = createSiteSettingHandler({ siteService: ss }),
			su = new SettingUpdate(SettingUpdate.SITE_NAME, SITE_NAME);

		ssh.handle(su);

		expect(ss.setName).toHaveBeenCalledWith(SITE_NAME);
	});

	it("will defer site description changes to the site service", function() {
		var ss = createSiteService(),
			ssh = createSiteSettingHandler({ siteService: ss }),
			su = new SettingUpdate(SettingUpdate.SITE_DESCRIPTION, SITE_DESCRIPTION);

		ssh.handle(su);

		expect(ss.setDescription).toHaveBeenCalledWith(SITE_DESCRIPTION);
	});

	it("will defer marker editing by ownership to the site service", function() {
		var ss = createSiteService(),
			ssh = createSiteSettingHandler({ siteService: ss }),
			su = new SettingUpdate(SettingUpdate.ONLY_OWNER_CAN_EDIT, true);

		ssh.handle(su);

		expect(ss.setOnlyOwnerCanEdit).toHaveBeenCalledWith(true);
	});

});

function createSiteSettingHandler(deps) {
	deps = deps || {};

	deps.siteService = deps.siteService || createSiteService();

	return new SiteSettingHandler(deps);
}

function createSiteService() {
	var ss = new SiteService({});
	spyOn(ss, "setName");
	spyOn(ss, "setDescription");
	spyOn(ss, "setOnlyOwnerCanEdit");
	return ss;
}
