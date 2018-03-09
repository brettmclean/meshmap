meshmap.angular.controllers.controller("ChatCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBusFactory = meshmap.events.factories.eventBusFactory,
				commsService = meshmap.utils.comms.CommsService.instance,
				siteService = meshmap.state.SiteService.instance;

			var dm = meshmap.models;

			$scope.myUserId = null;
			$scope.siteOwnerId = null;

			$scope.chatLog = [];
			$scope.userInput = "";

			$scope.sendChat = function() {
				if($scope.userInput) {
					commsService.sendMessage(
						"chatMessage",
						new dm.ChatMessage($scope.userInput)
					);
				}
				$scope.userInput = "";
			};

			$scope.onInputKeyPress = function(e) {
				if(e.keyCode === 13) {
					if(!e.shiftKey) {
						$scope.sendChat();
						e.preventDefault();
					}
				}
			};

			var subscribeToEvents = function() {
				var eventBus = eventBusFactory.create();
				eventBus.subscribe("currentUserIdSet", onCurrentUserIdSet);
				eventBus.subscribe("siteOwnerIdSet", onSiteOwnerIdSet);

				eventBus.subscribe("chatMessageReceived", onChatMessageReceived);
				eventBus.subscribe("systemMessageRequested", onSystemMessageRequested);
			};

			var onCurrentUserIdSet = function(/* Number */ userId) {
				$scope.myUserId = userId;
			};

			var onSiteOwnerIdSet = function(/* Number */ userId) {
				$scope.siteOwnerId = userId;
			};

			var onChatMessageReceived = function(/* ChatMessage */ chatMessage) {
				var username = "?";
				var users = siteService.getUsers();
				for(var i = 0; i < users.length; i++) {
					if(users[i].id === chatMessage.userId) {
						username = users[i].name;
					}
				}

				var lines = chatMessage.text.split("\n");
				for(i = 0; i < lines.length; i++) {
					lines[i] = {text: lines[i]};
				}

				$scope.$apply(function() {
					$scope.chatLog.push({
						userId: chatMessage.userId,
						username: username,
						lines: lines,
						date: formatDateAsTime(new Date(chatMessage.date)),
						messageType: "chat"
					});
				});
			};

			var onSystemMessageRequested = function(/* String */ messageText) {
				$scope.$apply(function() {
					addSystemMessage(messageText);
				});
			};

			var addSystemMessage = function(/* String */ text) {
				$scope.chatLog.push(
					{
						text: text,
						date: formatDateAsTime(new Date()),
						messageType: "system"
					}
				);
			};

			var formatDateAsTime = function(/* Date */ date) {
				var hours = date.getHours();
				var minutes = date.getMinutes();
				var ampm = hours >= 12 ? "PM" : "AM";

				hours -= hours > 12 ? 12 : 0;
				hours = hours === 0 ? 12 : hours;

				minutes = minutes < 10 ? "0" + minutes : minutes;

				return hours + ":" + minutes + " " + ampm;
			};

			subscribeToEvents();
			addSystemMessage("Welcome!");
		}
	]
);
