var api = require("./api");
var configLocationManagement = require("./config/configLocationManagement");
var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");
var appConfigServiceFactory = require("./config/appConfigServiceFactory");
var path = require("path");
var sm = require("./sitemanager");
var stc = require("node-static");
var store = require("./store");
var streamifier = require("streamifier");
var sw = require("./stopwatch");
var url = require("url");
var util = require("./util");
var zlib = require("zlib");

var NEW_PATH = "/new";
var CLIENT_CONFIG_PATH = "/config.json";

var webFileServer = getFileServerForWebDirectory();
var clientConfigFileServer = getFileServerForDirectory(configLocationManagement.getConfigDirectory());

var loggingService = loggingServiceFactory.create();

function handleHttpRequest(
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response) {
	"use strict";

	try {

		var appConfig = appConfigServiceFactory.create().getAppConfig();

		var ipAddress = util.getIpAddressFromHttpRequest(request);
		var handleRequest = function() {
			var pathname = url.parse(request.url).pathname.toLowerCase();
			var segments = pathname.split("/");

			segments.shift(); // Remove first empty string due to leading slash
			var firstSegment = segments.length > 0 ? "/" + segments[0] : "";

			if(firstSegment === CLIENT_CONFIG_PATH) {
				serveClientConfig(request, response);
			} else if(firstSegment === NEW_PATH) {
				createNewSite(request, response);
			} else if(firstSegment === appConfig.apiPath) {
				serveApiRequest(request, response);
			} else {
				var siteCode = firstSegment.substring(1); // See if pathname represents site code
				siteCode = siteCode.toLowerCase();

				if(util.isSiteCode(siteCode)) {
					serveSite(request, response, siteCode);
				} else {
					serveFile(webFileServer, request, response);
				}
			}
		};

		store.getIpAddressBanned(ipAddress, function(err, isBanned) {

			if(err) {
				loggingService.error("Failed to retrieve whether IP address \"" + ipAddress + "\" is banned: " + err);
				sendHttpError(request, response, 500);
				return;
			}

			if(isBanned) {
				loggingService.info("Rejected request for " + url.parse(request.url).pathname + " from banned IP address " + ipAddress + ".");
				sendHttpError(request, response, 403);
				return;
			}

			handleRequest();
		});

	} catch(err) {
		loggingService.error("An error occurred while handling an HTTP request: " + err.stack);
		sendHttpError(request, response, 500);
		return;
	}
}

function serveClientConfig(
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response) {
	"use strict";

	serveFile(clientConfigFileServer, request, response, {path: "client.json" });
}

function serveSite(
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response,
	/* String */ siteCode) {
	"use strict";

	sm.getSite(siteCode, function(err, site) {
		if(err) {
			var ipAddress = util.getIpAddressFromHttpRequest(request);
			loggingService.error("Failed to retrieve site with site code \"" + siteCode + "\" for connection from " + ipAddress + ": " + err);
			sendHttpError(request, response, 500);
			return;
		}

		if(!site) {
			sendHttpError(request, response, 404);
			return;
		}

		// A valid site code is being requested. Serve the map so that we can display the site.
		serveFile(webFileServer, request, response, {path: "html/map.html"});
	});
}

function serveFile(
	/* node-static.Server */ fileServer,
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response,
	/* { path: String, statusCode: Number } */ override) {
	"use strict";

	if(!override) {
		override = {};
	}

	request.addListener("end", function () {
		if(!override.path) {
			fileServer.serve(request, response, function(err) {
				if(err) {
					fileServer.serveFile(getErrorPageForStatusCode(err.status), err.status, {}, request, response);
				}
			});
		} else { // Serve specified file
			var path = override.path;
			var statusCode = override.statusCode ? override.statusCode : 200;
			var promise = fileServer.serveFile(path, statusCode, {}, request, response);
			promise.on("error", function(err) {
				if(statusCode === 200) {
					loggingService.error("Failed to serve file at " + path + ": " + err.message);
					fileServer.serveFile(getErrorPageForStatusCode(500), 500, {}, request, response);
				}
			});
		}
	}).resume();
}

function encodeData(
	/* http.IncomingMessage */ request,
	/* fs.ReadStream */ readStream,
	/* Object */ responseHeaders) {
	"use strict";

	// Figure out how to compress/encode this.
	var srcStream = readStream;
	var acceptEncodings = request.headers["accept-encoding"] ? request.headers["accept-encoding"].split(",") : [];

	for(var i = 0; i < acceptEncodings.length; i++) {
		var encoding = acceptEncodings[i];

		if (encoding.match(/\bdeflate\b/)) {
			responseHeaders["content-encoding"] = "deflate";
			srcStream = zlib.createDeflate();
			readStream.pipe(srcStream);
			break;
		} else if (encoding.match(/\bgzip\b/)) {
			responseHeaders["content-encoding"] = "gzip";
			srcStream = zlib.createGzip();
			readStream.pipe(srcStream);
			break;
		}
	}

	return srcStream;
}

function getErrorPageForStatusCode(/* Number */ httpStatusCode) {
	"use strict";

	var errorPage = "";
	switch(httpStatusCode) {
		case 403:
			errorPage = "forbidden";
			break;
		case 404:
			errorPage = "not_found";
			break;
		default:
			httpStatusCode = 500;
			errorPage = "server_error";
			break;
	}
	return "html/errors/" + errorPage + ".html";
}

function sendHttpError(
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response,
	/* Number */ httpStatusCode) {
	"use strict";

	serveFile(
		webFileServer,
		request,
		response,
		{
			path: getErrorPageForStatusCode(httpStatusCode),
			statusCode: httpStatusCode
		});
}

function createNewSite(
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response) {
	"use strict";

	var ipAddress = util.getIpAddressFromHttpRequest(request);

	sm.createNewSite(ipAddress, function(err, tooManyNewSites, newSiteCode) {

		if(err) {
			loggingService.error("Failed to create new site: " + err);
			response.writeHead(500);
			response.end("An error occurred while creating a new site. Please try again later.");
		} else if(tooManyNewSites) {
			response.writeHead(403);
			response.end("You have created too many new sites in the last hour. Please wait a few minutes before trying again.");
		} else {
			response.writeHead(302, {
				"Location": "/" + newSiteCode
			});
			response.end();
		}
	});
}

function serveApiRequest(
	/* http.IncomingMessage */ request,
	/* http.ServerResponse */ response) {
	"use strict";

	var pathname = url.parse(request.url).pathname.toLowerCase();

	var stopwatch = new sw.Stopwatch("Handle API request to " + pathname);

	api.handleApiRequest(request, function(err, json) {

		if(err) {
			loggingService.warn("Unable to handle API request to " + pathname + ": " + err);
		}

		var responseHeaders = {
			"content-type": "application/json"
		};
		var s = streamifier.createReadStream(json);
		var srcStream = encodeData(request, s, responseHeaders);

		response.writeHead(200, responseHeaders);
		srcStream.pipe(response);
		stopwatch.stop();
	});
}

function getFileServerForWebDirectory() {
	var webDir = path.resolve(__dirname, "../web");
	return getFileServerForDirectory(webDir);
}

function getFileServerForDirectory(dir) {
	return new stc.Server(
		dir,
		{ gzip: true }
	);
}

exports.handleHttpRequest = handleHttpRequest;
