meshmap.namespace("meshmap.utils");

meshmap.utils.SecretGenerator = (function() {

	var SECRET_LENGTH = 64;
	var SECRET_CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyz";

	var SecretGenerator = function() {};

	SecretGenerator.prototype.generate = function() {
		var secret = "";

		for(var i = 0; i < SECRET_LENGTH; i++) {
			var index = Math.floor(Math.random() * SECRET_CHARACTERS.length);
			secret += SECRET_CHARACTERS.charAt(index);
		}

		return secret;
	};

	return SecretGenerator;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.SecretGenerator;
}
