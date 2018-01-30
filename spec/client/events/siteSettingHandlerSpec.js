require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteSettingHandler = loader.load("events/messageHandlers/SiteSettingHandler"),
	SiteService = loader.load("state/SiteService"),
	dm = loader.load("model/datamodel"),
	SettingUpdate = dm.SettingUpdate;

var SITE_NAME = "My awesome map";
var SITE_DESCRIPTION = "I totally made this map all by myself!";

var createSiteSettingHandler = function() {
	return new SiteSettingHandler();
};

var createSiteSettingHandlerWithSiteService = function(siteService) {
	return new SiteSettingHandler({
		siteService: siteService
	});
};

describe("A site setting handler", function() {

	it("will not throw an error if site service is not provided", function() {
		var ssh = createSiteSettingHandler();

		expect(function() {
			ssh.handle(new SettingUpdate(SettingUpdate.SITE_NAME, SITE_NAME));
			ssh.handle(new SettingUpdate(SettingUpdate.SITE_DESCRIPTION, SITE_DESCRIPTION));
		}).not.toThrow();
	});

	it("will defer site name changes to the site service", function() {
		var ss = new SiteService(),
			ssh = createSiteSettingHandlerWithSiteService(ss),
			su = new SettingUpdate(SettingUpdate.SITE_NAME, SITE_NAME);

		spyOn(ss, "setName");
		ssh.handle(su);

		expect(ss.setName).toHaveBeenCalledWith(SITE_NAME);
	});

	it("will defer site description changes to the site service", function() {
		var ss = new SiteService(),
			ssh = createSiteSettingHandlerWithSiteService(ss),
			su = new SettingUpdate(SettingUpdate.SITE_DESCRIPTION, SITE_DESCRIPTION);

		spyOn(ss, "setDescription");
		ssh.handle(su);

		expect(ss.setDescription).toHaveBeenCalledWith(SITE_DESCRIPTION);
	});

	it("will defer marker editing by ownership to the site service", function() {
		var ss = new SiteService(),
			ssh = createSiteSettingHandlerWithSiteService(ss),
			su = new SettingUpdate(SettingUpdate.ONLY_OWNER_CAN_EDIT, true);

		spyOn(ss, "setOnlyOwnerCanEdit");
		ssh.handle(su);

		expect(ss.setOnlyOwnerCanEdit).toHaveBeenCalledWith(true);
	});

});
