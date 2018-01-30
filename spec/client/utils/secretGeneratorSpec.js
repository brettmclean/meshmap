require("../testUtils/init");
var loader = require("../testUtils/loader");

var SecretGenerator = loader.load("utils/SecretGenerator");

var EXPECTED_SECRET_LENGTH = 64;
var EXPECTED_SECRET_CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyz";

describe("The secret generator", function() {

	it("generates a 64-character string", function() {
		var secretGenerator = new SecretGenerator();
		var secret = secretGenerator.generate();
		expect(secret.length).toBe(EXPECTED_SECRET_LENGTH);
	});

	it("generates secrets containing only lowercase alphanumeric characters", function() {
		var secretGenerator = new SecretGenerator();
		var secret = secretGenerator.generate();

		for(var i = 0; i < secret.length; i++) {
			expect(EXPECTED_SECRET_CHARACTERS).toContain(secret.charAt(i));
		}
	});

	it("generates unique secrets", function() {
		var secretGenerator = new SecretGenerator();
		var secret1 = secretGenerator.generate();
		var secret2 = secretGenerator.generate();

		expect(secret1).not.toEqual(secret2);
	});

});
