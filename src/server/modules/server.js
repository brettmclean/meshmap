var dm = require("./datamodel");
var http = require("http");
var httpHandlers = require("./httphandlers");
var mm = require("./meshmap");
var sm = require("./sitemanager");
var socketio = require("socket.io");
var store = require("./store");
var sw = require("./stopwatch");
var util = require("./util");
var appConfigServiceFactory = require("./config/appConfigServiceFactory");
var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");
var applicationLoadServiceFactory = require("./appload/applicationLoadServiceFactory");

var loggingService = loggingServiceFactory.create();
var applicationLoadService = applicationLoadServiceFactory.create();

var httpServer = null;
var sioServer = null;

function init() {
	"use strict";

	var appConfig = appConfigServiceFactory.create().getAppConfig();

	createHttpServer();
	startSocketIo();
	loggingService.info("Server started on port " + appConfig.portNumber + ".");
}

function shutdown() {
	"use strict";

	httpServer.close(); // Close HTTP server
	sioServer = null;
	httpServer = null;
}

function createHttpServer() {
	"use strict";

	var appConfig = appConfigServiceFactory.create().getAppConfig();

	var stopwatch = new sw.Stopwatch("Create HTTP server");

	httpServer = http.createServer(handleHttpRequest);
	httpServer.listen(appConfig.portNumber);

	stopwatch.stop();
}

function startSocketIo() {
	"use strict";

	sioServer = socketio.listen(httpServer, {log: false});
	sioServer.set("log level", 1); // Socket.IO log levels: 0 = error, 1 = warn, 2 = info, 3 = debug
	sioServer.enable("browser client minification");
	sioServer.enable("browser client etag");
	sioServer.enable("browser client gzip");

	// For each user that establishes a Socket.IO connection.
	sioServer.sockets.on("connection", handleSocketIoConnection);
}

function handleHttpRequest(request, response) {
	"use strict";
	httpHandlers.handleHttpRequest(request, response);
}

function handleSocketIoConnection(socket) {
	"use strict";

	var ipAddress = util.getIpAddressFromSocketIoRequest(socket);

	if(applicationLoadService.appIsOverloaded()) {
		loggingService.warn(`Rejected socket.io connection from ${ipAddress} because server is too busy`);
		mm.sendErrorMessage(socket, "Server busy. Please try again later.");
		socket.disconnect();
		return;
	}

	try {
		subscribeToSocketIoConnectionEvents(socket, ipAddress);
		checkIpAddressBanned(socket, ipAddress, function() {});
	} catch(err) {
		loggingService.error("An error occurred while handling a new Socket.IO connection: " + err.stack);
		if(socket) {
			socket.disconnect();
		}
		return;
	}
}

function checkIpAddressBanned(socket, ipAddress, callback) {
	"use strict";

	if(!callback) {
		return;
	}

	store.getIpAddressBanned(ipAddress, function(err, isBanned) {
		if(err) {
			loggingService.error("Failed to retrieve whether IP address \"" + ipAddress + "\" is banned: " + err);
			mm.sendErrorMessage(socket, "An error occurred while looking up your IP address.");
			socket.disconnect();
			return callback(false);
		}

		if(isBanned) {
			loggingService.info("Rejected Socket.IO connection for from banned IP address " + ipAddress + ".");
			mm.sendErrorMessage(socket, "You have been banned.");
			socket.disconnect();
			return callback(false);
		}

		callback(true);
	});
}

function subscribeToSocketIoConnectionEvents(socket, ipAddress) {
	"use strict";

	var stopwatch = new sw.Stopwatch("Handle new Socket.IO connection");

	var context = {
		socket: socket,
		client: null, /* dm.Client */
		site: null, /* dm.Site */
		ipAddress: ipAddress /* String */
	};

	socket.on("connectInfo", function(message, ackFunc) {
		handleSocketIoConnectInfoEvent(context, message, ackFunc);
	});

	socket.on("message", function(/* Message */ message) {
		handleSocketIoMessageEvent(context, message);
	});

	socket.on("disconnect", function() {
		handleSocketIoDisconnectEvent(context);
	});

	stopwatch.stop();
}

function handleSocketIoConnectInfoEvent(
	context, /* { socket: Socket, client: dm.Client, site: dm.Site, ipAddress : String } */
	message, /* Object */
	ackFunc /* Function */) {
	"use strict";

	try {
		mm.handleConnectInfo(message, context.ipAddress, function(err, user, site, userSiteState) {
			if(err) {
				loggingService.error("Failed to handle connect info from user at " + context.ipAddress + ": " + err);
				mm.sendErrorMessage(context.socket, "Provided connection information is not valid.");
				context.socket.disconnect();
				return;
			}

			context.client = new dm.Client(context.socket, context.ipAddress, user, userSiteState);
			context.site = site;

			sm.ensureUserIsAssociatedWithSite(context.client, context.site, function(err) {
				if(err) {
					loggingService.error("Failed to associate user ID " + context.client.user.id + " with site " + context.site.siteCode + ": " + err);
				}
			});

			var userConnectCallback = null;
			if(ackFunc && typeof ackFunc === "function") {
				userConnectCallback = function(err, startupData) {
					ackFunc(startupData);
				};
			}

			mm.handleUserConnect(context.client, context.site, userConnectCallback);
		});
	} catch(err) {
		loggingService.error("An error occurred while handling connect info from " + context.ipAddress + "." +
			"\nThe connect info was as follows: " + JSON.stringify(message) +
			"\n" + err.stack);
	}
}

function handleSocketIoMessageEvent(
	context, /* { socket: Socket, client: dm.Client, site: dm.Site, ipAddress : String } */
	message /* Object */) {
	"use strict";

	try {
		if(context.client) {
			mm.handleUserMessage(
				message,
				context.client,
				context.site
			);
		}
	} catch(err) {
		loggingService.error("An error occurred while handling a user message from " + context.ipAddress + "." +
			"\nThe message was as follows: " + JSON.stringify(message) +
			"\n" + err.stack);
	}
}

function handleSocketIoDisconnectEvent(
	context /* { socket: Socket, client: dm.Client, site: dm.Site, ipAddress : String } */
	) {
	"use strict";

	try {
		if(context.client) {
			mm.handleUserDisconnect(
				context.client,
				context.site
			);
		}

		delete context.socket;
		delete context.client;
		delete context.site;
		delete context.ipAddress;

	} catch(err) {
		loggingService.error("An error occurred while handling a user disconnect from " + context.ipAddress + "." +
			"\n" + err.stack);
	}
}

exports.init = init;
exports.shutdown = shutdown;
