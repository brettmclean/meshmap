var VALID_SITE_CODE_CHARS_REGEX = /^[0-9a-z]+$/;

var SiteCodeService = function() {

};

SiteCodeService.prototype.createSiteCode = function() {

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
