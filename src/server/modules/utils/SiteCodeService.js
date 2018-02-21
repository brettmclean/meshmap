var SITE_CODE_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
var VALID_SITE_CODE_CHARS_REGEX = /^[0-9a-z]+$/;

var SiteCodeService = function(deps) {
	this._appConfigService = deps.appConfigService;
};

SiteCodeService.prototype.createSiteCode = function() {
	var siteCode = "";

	var appConfig = this._appConfigService.getAppConfig();

	for(var i = 0; i < appConfig.siteCodeLength; i++) {
		var randomIndex = Math.floor(Math.random() * SITE_CODE_CHARS.length);
		siteCode += SITE_CODE_CHARS.charAt(randomIndex);
	}

	return siteCode;
};

SiteCodeService.prototype.isSiteCode = function(siteCode) {
	if(!siteCode) {
		return false;
	}

	if(typeof siteCode !== "string") {
		return false;
	}

	if(!VALID_SITE_CODE_CHARS_REGEX.test(siteCode)) {
		return false;
	}

	return true;
};

module.exports = SiteCodeService;
