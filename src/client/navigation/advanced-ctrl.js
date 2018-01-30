meshmap.angular.controllers.controller("AdvancedCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBus = meshmap.events.EventBus.instance;

			var allViews = [];
			var siteOwnershipDetermined = false;

			$scope.views = [];
			$scope.currView = null;

			$scope.backToMenu = function() {
				eventBus.publish("advancedViewChanged", null);
			};

			var subscribeToEvents = function() {
				eventBus.subscribe("sectionChanged", onSectionChanged);
				eventBus.subscribe("advancedViewChanged", onAdvancedViewChanged);
				eventBus.subscribe("startupDataReceived", onStartupDataReceived);
			};

			var onSectionChanged = function(/* String */ sectionId) {
				if(sectionId !== "advanced" && $scope.currView) {
					$scope.backToMenu();
				}
			};

			var onAdvancedViewChanged = function(/* String */ advancedViewId) {
				changeView(findView(advancedViewId));
			};

			var populateViews = function() {

				allViews = [];
				allViews.push({
					id: "site-settings",
					text: "Map Settings",
					partial: "html/partials/site-settings.html",
					classes: { icon: ["glyphicon-wrench"] },
					siteOwnerOnly: true
				});
				allViews.push({
					id: "settings",
					text: "Settings",
					partial: "html/partials/user-settings.html",
					classes: { icon: ["glyphicon-cog"] }
				});
				allViews.push({
					id: "about-map",
					text: "About this Map",
					partial: "html/partials/about-map.html",
					classes: { icon: ["glyphicon-map-marker"] }
				});
				allViews.push({
					id: "about-app",
					text: "About this App",
					partial: "html/partials/about-app.html",
					classes: { icon: ["glyphicon-info-sign"] }
				});

				for(var i = 0; i < allViews.length; i++) {
					allViews[i].buttonClick = onClickViewButton;
					if(!allViews[i].siteOwnerOnly) {
						$scope.views.push(allViews[i]);
					}
				}
			};

			var findView = function(viewId) {
				var views = $scope.views;
				for(var i = 0; i < views.length; i++) {
					if(views[i].id === viewId) {
						return views[i];
					}
				}

				return null;
			};

			var onClickViewButton = function(viewId) {
				eventBus.publish("advancedViewChanged", viewId);
			};

			var changeView = function(newView) {
				$scope.currView = newView;
			};

			var onStartupDataReceived = function(/* StartupData */ startupData) {
				if(!siteOwnershipDetermined && startupData.currUserId === startupData.siteOwnerId) {
					for(var i = allViews.length - 1; i >= 0; i--) {
						if(allViews[i].siteOwnerOnly) {
							$scope.views.unshift(allViews[i]);
						}
					}
				}
				siteOwnershipDetermined = true;
			};

			populateViews();
			subscribeToEvents();
		}
	]
);
