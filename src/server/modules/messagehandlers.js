/* Requires */
var dm = require("./datamodel");
var mm = require("./meshmap");
var sm = require("./sitemanager");
var store = require("./store");
var ua = require("./useractivity");
var util = require("./util");
var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");

var loggingService = loggingServiceFactory.create();

function handleUserMessage(
	/* Message */ message,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	switch(message.type) {
		case "mapEvent":
			var mapEvent = message.data;
			handleMapEvent(mapEvent, client, site);
			break;
		case "chatMessage":
			var chatMessage = message.data;
			handleChatMessage(chatMessage, client, site);
			break;
		case "updateSiteSetting":
			var siteSettingUpdate = message.data;
			handleUpdateSiteSetting(siteSettingUpdate, client, site);
			break;
		case "updateUserSetting":
			var userSettingUpdate = message.data;
			handleUpdateUserSetting(userSettingUpdate, client, site);
			break;
		default:
			break;
	}
}

function handleMapEvent(
	/* MapEvent */ mapEvent,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	loggingService.debug("Received " + mapEvent.type + " map event from User ID " + client.user.id + ".");

	switch(mapEvent.type) {
		case "changeExtent":
			handleChangeExtentEvent(mapEvent, client, site);
			break;
		case "addMarker":
			handleAddMarker(mapEvent, client, site);
			break;
		case "removeMarker":
			handleRemoveMarker(mapEvent, client, site);
			break;
		case "updateMarker":
			handleUpdateMarker(mapEvent, client, site);
			break;
		default:
			loggingService.warn("Unknown map event type from User ID " + client.user.id + ": " + mapEvent.type);
			break;
	}
}

function handleChangeExtentEvent(
	/* MapEvent */ mapEvent,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	sm.changeUserExtent(client, mapEvent.data, site);
}

function handleAddMarker(
	/* MapEvent */ mapEvent,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	var marker = mapEvent.data;
	marker.ownerId = client.user.id;

	var markerType = util.getMarkerType(marker);
	if(markerType === util.MARKER_TYPE_POLYLINE || markerType === util.MARKER_TYPE_POLYGON) {
		var lineWidth = parseInt(marker.width);
		lineWidth = isNaN(lineWidth) ? 2 : lineWidth;
		lineWidth = lineWidth < 1 ? 1 : lineWidth;
		lineWidth = lineWidth > 10 ? 10 : lineWidth;
		marker.width = lineWidth;
	}

	store.insertMarker(site, marker, function(err) {

		if(err) {
			loggingService.error("Failed to insert new marker from " + client.ipAddress + ": " + err);
			return;
		}

		mm.sendMessageToAll(
			"mapEvent",
			mapEvent,
			site
		);

		store.insertUserActivity(ua.activityTypes.create_marker.id,
			client.user.id,
			site.id,
			marker.id,
			function(err) {
				if(err) {
					loggingService.error("Failed to log user's create_marker activity: " + err);
				}
			}
		);
	});
}

function handleRemoveMarker(
	/* MapEvent */ mapEvent,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	var markerId = mapEvent.data;

	var markers = site.markers;
	for(var i = 0; i < markers.length; i++) {
		if(markers[i].id === markerId) {
			if(!util.canUserEditMarker(site, client.user, markers[i])) {
				return;
			} else {
				break;
			}
		}
	}

	if(markerId) {
		store.deleteMarker(site, markerId, function(err) {

			if(err) {
				loggingService.error("Failed to delete marker with ID " + markerId + ": " + err);
				return;
			}

			mm.sendMessageToExclude(
				"mapEvent",
				mapEvent,
				[client],
				site
			);

			store.insertUserActivity(ua.activityTypes.delete_marker.id,
				client.user.id,
				site.id,
				markerId,
				function(err) {
					if(err) {
						loggingService.error("Failed to log user's delete_marker activity: " + err);
					}
				}
			);
		});
	} else {
		loggingService.warn("User with ID " + client.user.id + " wants to remove marker but did not provide a marker ID.");
	}
}

function handleUpdateMarker(
	/* MapEvent */ mapEvent,
	/* Client */ client,
	/* Site */ site) {
	"use strict";

	var eventMarker = mapEvent.data;

	if(eventMarker) {
		if(!eventMarker.id) {
			return loggingService.warn("User with ID " + client.user.id + " wants to update marker but did not provide a marker ID.");
		} else if(!eventMarker.name) {
			return loggingService.warn("User with ID " + client.user.id + " wants to update marker but did not provide a marker name.");
		}
	} else {
		return loggingService.warn("User with ID " + client.user.id + " wants to update marker but did not provide one.");
	}

	var markers = site.markers;
	var marker = null;
	for(var i = 0; i < markers.length; i++) {
		if(markers[i].id === eventMarker.id) {
			marker = markers[i];
			if(!util.canUserEditMarker(site, client.user, markers[i])) {
				return;
			} else {
				break;
			}
		}
	}

	if(marker) {
		marker.name = eventMarker.name;
		marker.description = eventMarker.description;

		store.updateMarker(site, marker, function(err) {

			if(err) {
				loggingService.error("Failed to update marker with ID " + marker.id + ": " + err);
				return;
			}

			mm.sendMessageToExclude(
				"mapEvent",
				mapEvent,
				[client],
				site
			);

			store.insertUserActivity(
				ua.activityTypes.edit_marker.id,
				client.user.id,
				site.id,
				marker.id,
				function(err) {
					if(err) {
						loggingService.error("Failed to log user's edit_marker activity: " + err);
					}
				}
			);
		});
	} else {
		loggingService.warn("User with ID " + client.user.id + " wants to update marker but provided marker could not be found in this site.");
	}
}

function handleChatMessage(
	/* ChatMessage */ chatMessage,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";
	chatMessage.userId = client.user.id;
	chatMessage.date = Date.now();

	// Prevent large chat messages from being sent to other users.
	if(chatMessage.text.length > 4096) {
		chatMessage.text = chatMessage.text.substring(0, 4096);
	}

	mm.sendMessageToAll(
		"chatMessage",
		chatMessage,
		site
	);
}

function handleUpdateSiteSetting(
	/* SettingUpdate */ settingUpdate,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";

	if(!util.isUserSiteOwner(site, client.user)) {
		return;
	}

	switch(settingUpdate.key) {
		case "siteName":
			handleUpdateSiteName(settingUpdate.value, client, site);
			break;
		case "siteDescription":
			handleUpdateSiteDescription(settingUpdate.value, client, site);
			break;
		case "onlyOwnerCanEdit":
			handleUpdateOnlyOwnerCanEdit(settingUpdate.value, client, site);
			break;
		case "initialExtent":
			handleUpdateInitialExtent(settingUpdate.value, client, site);
			break;
		default:
			break;
	}
}

function handleUpdateSiteName(
	/* String */ siteName,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";

	if(typeof siteName === "string") {
		site.name = siteName;

		mm.sendMessageToExclude(
			"updateSiteSetting",
			new dm.SettingUpdate("siteName", siteName),
			[client],
			site
		);

		store.updateSite(site, function(err) {
			if(err) {
				return loggingService.error("Failed to update siteName from " + client.ipAddress + ": " + err);
			}
		});
	}
}

function handleUpdateSiteDescription(
	/* String */ siteDescription,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";

	if(typeof siteDescription === "string") {
		site.description = siteDescription;

		mm.sendMessageToExclude(
			"updateSiteSetting",
			new dm.SettingUpdate("siteDescription", siteDescription),
			[client],
			site
		);

		store.updateSite(site, function(err) {
			if(err) {
				return loggingService.error("Failed to update siteDescription from " + client.ipAddress + ": " + err);
			}
		});
	}
}

function handleUpdateOnlyOwnerCanEdit(
	/* Boolean */ onlyOwnerCanEdit,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";

	if(typeof onlyOwnerCanEdit === "boolean") {
		site.settings.onlyOwnerCanEdit = onlyOwnerCanEdit;

		mm.sendMessageToExclude(
			"updateSiteSetting",
			new dm.SettingUpdate("onlyOwnerCanEdit", onlyOwnerCanEdit),
			[client],
			site
		);

		store.updateSite(site, function(err) {
			if(err) {
				return loggingService.error("Failed to update onlyOwnerCanEdit from " + client.ipAddress + ": " + err);
			}
		});
	}
}

function handleUpdateInitialExtent(
	/* MapExtent */ extent,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";

	if(extent && extent.min && extent.max) {
		site.settings.initialExtent = extent;

		store.updateSite(site, function(err) {
			if(err) {
				return loggingService.error("Failed to update initialExtent from " + client.ipAddress + ": " + err);
			}
		});
	}
}

function handleUpdateUserSetting(
	/* SettingUpdate */ settingUpdate,
	/* Client */ client,
	/* Site */ site
	) {
	"use strict";

	switch(settingUpdate.key) {
		case "username":
			handleUpdateUsername(settingUpdate.value, client, site);
			break;
		case "confirmMarkerDeletion":
			handleUpdateConfirmMarkerDeletion(settingUpdate.value, client);
			break;
		default:
			break;
	}
}

function handleUpdateUsername(
	/* String */ newUsername,
	/* Client */ client,
	/* String */ site
	) {
	"use strict";

	if(newUsername) {
		client.user.name = newUsername;

		var userEvent = new dm.UserEvent(
			"userUpdate",
			client.user.toUserInfo()
		);

		mm.sendMessageToExclude(
			"userEvent",
			userEvent,
			[client],
			site
		);

		store.updateUser(client.user, function(err) {
			if(err) {
				loggingService.error("Failed to update user: " + err);
			}
		});
	}
}

function handleUpdateConfirmMarkerDeletion(
	/* Boolean */ confirmMarkerDeletion,
	/* Client */ client
	) {
	"use strict";

	if(typeof confirmMarkerDeletion === "boolean") {
		client.user.settings.confirmMarkerDeletion = confirmMarkerDeletion;

		store.updateUser(client.user, function(err) {
			if(err) {
				return loggingService.error("Failed to update confirmMarkerDeletion from " + client.ipAddress + ": " + err);
			}
		});
	}
}

exports.handleUserMessage = handleUserMessage;
