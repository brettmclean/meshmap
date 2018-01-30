meshmap.angular.controllers.controller("UsersCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBus = meshmap.events.EventBus.instance;

			$scope.users = [];
			$scope.myUserId = null;
			$scope.siteOwnerId = null;

			var subscribeToEvents = function() {
				eventBus.subscribe("userAdded", onUserAdded);
				eventBus.subscribe("userRemoved", onUserRemoved);
				eventBus.subscribe("userUpdated", onUserUpdated);
				eventBus.subscribe("usersCleared", onUsersCleared);
				eventBus.subscribe("currentUserIdSet", onCurrentUserIdSet);
				eventBus.subscribe("siteOwnerIdSet", onSiteOwnerIdSet);
			};

			var onUserAdded = function(userInfo) {
				if(!findUserById(userInfo.id)) {
					$scope.$apply(function() {
						$scope.users.push(userInfo);
					});
				}
			};

			var onUserRemoved = function(userInfo) {
				var pos = findUserPositionById(userInfo.id);
				if(pos >= 0) {
					$scope.$apply(function() {
						$scope.users.splice(pos, 1);
					});
				}
			};

			var onUserUpdated = function(userInfo) {
				var pos = findUserPositionById(userInfo.id);
				if(pos >= 0) {
					$scope.$apply(function() {
						$scope.users[pos] = userInfo;
					});
				}
			};

			var onUsersCleared = function() {
				$scope.$apply(function() {
					$scope.users = [];
				});
			};

			var onCurrentUserIdSet = function(/* Number */ userId) {
				$scope.$apply(function() {
					$scope.myUserId = userId;
				});
			};

			var onSiteOwnerIdSet = function(/* Number */ userId) {
				$scope.$apply(function() {
					$scope.siteOwnerId = userId;
				});
			};

			var findUserById = function(userId) {
				var matchingUsers = $scope.users.filter(function(userInfo) {
					return userInfo.id === userId;
				});
				return matchingUsers.length > 0 ? matchingUsers[0] : null;
			};

			var findUserPositionById = function(userId) {
				var users = $scope.users;
				for(var i = 0; i < users.length; i++) {
					if(users[i].id === userId) {
						return i;
					}
				}
				return -1;
			};

			subscribeToEvents();
		}
	]
);
