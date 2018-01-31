/* Requires */
var dm = require("./datamodel");
var logger = require("./logger");
var mmHandlers = require("./messagehandlers");
var sm = require("./sitemanager");
var store = require("./store");
var sw = require("./stopwatch");
var ua = require("./useractivity");
var util = require("./util");

function handleConnectInfo(
	/* Message */ message,
	/* String */ ipAddress,
	/* Function */ callback) {
	"use strict";

	var stopwatch = new sw.Stopwatch("Handle connect info from " + ipAddress);

	var origCallback = callback;
	callback = function(/* String */ err, /* User */ user, /* Site */ site, /* UserSiteState */ state) {
		if(origCallback) {
			origCallback(err, user, site, state);
		}
		stopwatch.stop();
	};

	var connectInfo = message.data;

	var err = null;

	if(connectInfo && connectInfo.siteCode && connectInfo.secret) {

		sm.getSite(connectInfo.siteCode, function(err, site) {

			if(err) {
				logger.error("Failed to get site " + connectInfo.siteCode + ": " + err);
				callback(err, null, null, null);
				return;
			}

			if(!site) {
				callback("Cannot find site " + connectInfo.siteCode + ".", null, null, null);
				return;
			}

			store.getUser(connectInfo.secret, function(err, user) {

				if(err) {
					logger.error("Failed to get user connecting from " + ipAddress + ": " + err);
					callback(err, null, null, null);
					return;
				}

				var getUserSiteState = function(err, user, site) {
					store.getUserSiteState(user.id, site.id, function(err, userSiteState) {
						if(err) {
							logger.error("Failed to get user-site state for site " + site.siteCode + " and user with ID " + user.id + ": " + err);
							return callback(err, user, site, userSiteState);
						}

						if(!userSiteState.extent) {
							userSiteState.extent = site.settings.initialExtent;
						}

						callback(err, user, site, userSiteState);
					});
				};

				if(!user) {
					user = new dm.User(connectInfo.secret);
					user.name = "Guest " + Math.floor(Math.random()*10000);
					store.insertUser(user, function(err) {
						if(err) {
							logger.error("Failed to insert user: " + err);
							return callback(err, user, site, null);
						}
						getUserSiteState(err, user, site);
					});
				} else {
					getUserSiteState(err, user, site);
				}
			});
		});

	} else {
		if(!connectInfo) {
			err = "Failed to parse connect info.";
		} else if(!connectInfo.siteCode) {
			err = "Connect info did not provide site code.";
			err += " " + message;
		} else if(!connectInfo.secret) {
			err = "Connect info did not provide secret.";
		}
	}

	if(err) {
		callback(err, null, null);
		stopwatch.stop();
	}
}

function handleUserMessage(
	/* Message */ message,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	var stopwatch = new sw.Stopwatch("Handle message from User ID " + client.user.id);

	mmHandlers.handleUserMessage(message, client, site);

	stopwatch.stop();
}

function handleUserConnect(
	/* Client */ client,
	/* Site */ site,
	/* Function */ callback) {
	"use strict";

	logger.debug("User ID " + client.user.id + " has connected to site " + site.siteCode + ".");

	// First user to connect to a site is the owner
	if(!site.ownerId) {
		site.ownerId = client.user.id;
		store.updateSite(site);
	}

	var userAlreadyConnectedToSite = util.isUserConnectedToSite(site, client.user);

	site.clients.push(client);
	sendUserStartupData(client, site, callback);

	if(!userAlreadyConnectedToSite) {
		var userEvent = new dm.UserEvent("userConnect", client.user.toUserInfo());
		sendMessageToExclude("userEvent", userEvent, [client], site);
	}

	store.insertUserActivity(ua.activityTypes.connect_to_site.id,
		client.user.id,
		site.id,
		null,
		function(err) {
			if(err) {
				logger.error("Failed to log user's connect_to_site activity: " + err);
			}
		}
	);

	store.insertConnectionLog(client, function(err) {
		if(err) {
			logger.error("Failed to log user connection: " + err);
		}
	});
}

function handleUserDisconnect(
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	logger.debug("User ID " + client.user.id + " has disconnected from site " + site.siteCode + ".");

	// Remove disconnected client from clients list.
	var clients = site.clients;
	for(var i = 0; i < clients.length; i++) {
		if(clients[i] === client) {
			clients.splice(i,1);
			break;
		}
	}

	if(!util.isUserConnectedToSite(site, client.user)) {
		var userEvent = new dm.UserEvent("userDisconnect", client.user.toUserInfo());
		sendMessageToAll("userEvent", userEvent, site);
	}

	store.insertUserActivity(ua.activityTypes.disconnect_from_site.id,
		client.user.id,
		site.id,
		null,
		function(err) {
			if(err) {
				logger.error("Failed to log user's disconnect_from_site activity: " + err);
			}
		}
	);
}

function sendUserStartupData(
	/* Client */ client,
	/* Site */ site,
	/* Function */ callback) {
	"use strict";

	if(!callback) {
		return;
	}

	var stopwatch = new sw.Stopwatch("Send startup data to User ID " + client.user.id);

	var err = null;

	// Gather user infos
	var representedUsers = {};
	var userInfos = [];
	for(var i = 0; i < site.clients.length; i++) {
		var currClient = site.clients[i];
		if(currClient && currClient.user && !representedUsers[currClient.user.id]) {
			userInfos.push(currClient.user.toUserInfo());
			representedUsers[currClient.user.id] = true;
		}
	}

	var startupData = new dm.StartupData(
		site.markers,
		userInfos,
		client.user.id,
		site.ownerId,
		store.markerIcons,
		store.markerColors,
		site.settings,
		client.user.settings,
		client.state
	);
	startupData.siteName = site.name;
	startupData.siteDescription = site.description;
	startupData.createDate = site.createDate.getTime();

	// Use connectInfo acknowledgement function to send back startupData
	if(callback) {
		callback(err, startupData);
	}

	stopwatch.stop();
}

function sendErrorMessage(/* Socket */ socket, /* String*/ errorMsg) {
	"use strict";

	socket.emit("message", new dm.Message("error", errorMsg));
}

function sendMessageToAll(
	/* String */ messageType,
	/* Object */ messageData,
	/* Site */ site) {
	"use strict";

	sendMessageTo(messageType, messageData, site.clients);
}

function sendMessageToExclude(
	/* String */ messageType,
	/* Object */ messageData,
	/* Client[] */ excludedClientsList,
	/* Site */ site) {
	"use strict";

	var clientList = [];

	if(excludedClientsList) {

		for(var i = 0; i < site.clients.length; i++) {

			var client = site.clients[i];

			// Figure out if we are supposed to send message to this client.
			var sendToClient = true;
			for(var j = 0; j < excludedClientsList.length; j++) {
				if(excludedClientsList[j] === client) {
					sendToClient = false;
					break;
				}
			}

			if(sendToClient) {
				clientList.push(client);
			}
		}

		sendMessageTo(messageType, messageData, clientList, site);
	}
}

function sendMessageTo(
	/* String */ messageType,
	/* Object */ messageData,
	/* Client[] */ clientList) {
	"use strict";

	var stopwatch = new sw.Stopwatch("Send " + messageType + " message to " + clientList.length + " user(s)");

	if(clientList) {
		for(var i = 0; i < clientList.length; i++) {
			var client = clientList[i];
			sendMessage(client, messageType, messageData);
		}
	}

	stopwatch.stop();
}

function sendMessage(
	/* Client */ client,
	/* String */ messageType,
	/* Object */ messageData) {
	"use strict";

	var message = new dm.Message(
		messageType,
		messageData
	);
	if(client && client.connection) {
		client.connection.emit("message", message);
	}
}

exports.handleConnectInfo = handleConnectInfo;
exports.handleUserMessage = handleUserMessage;
exports.handleUserConnect = handleUserConnect;
exports.handleUserDisconnect = handleUserDisconnect;
exports.sendUserStartupData = sendUserStartupData;
exports.sendErrorMessage = sendErrorMessage;
exports.sendMessageToAll = sendMessageToAll;
exports.sendMessageToExclude = sendMessageToExclude;
exports.sendMessageTo = sendMessageTo;
