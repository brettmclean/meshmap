meshmap.angular.controllers.controller("MarkerInfoCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBusFactory = meshmap.events.factories.eventBusFactory,
				siteService = meshmap.state.SiteService.instance,
				DialogButton = meshmap.ui.dialogs.DialogButton,
				ConfirmDialog = meshmap.ui.dialogs.ConfirmDialog,
				ViewDialog = meshmap.ui.dialogs.ViewDialog,
				DialogService = meshmap.ui.DialogService;

			var eventBus = eventBusFactory.create();
			var dialogService = DialogService.instance;

			var editMarkerScope = $scope.$new();

			/*
				Available from parent scope:
				$scope.marker: PointMarker|PolylineMarker|PolygonMarker
			*/
			$scope.userCanEditMarker = false;
			$scope.smallOnStart = undefined;
			$scope.largeOnStart = undefined;

			$scope.deleteMarker = function() {
				if(userCanEditMarker()) {

					// Dismiss current dialog in case it hosts this MarkerInfo view (i.e. in "small" layout).
					// In the "large" layout, there can't be a dialog open if the user was able to click
					// the button that triggers this function, so this would be a NOOP.
					dialogService.dismissCurrentDialog();

					var doDelete = function() {
						siteService.removeMarker($scope.marker.id);
					};

					var confirmDeletion = siteService.getUserSettings().confirmMarkerDeletion;
					if(confirmDeletion) {
						var dialog = new ConfirmDialog(
							"Delete Location?",
							"Are you sure you want to delete \"" + $scope.marker.name + "\"? This cannot be undone.",
							{
								positiveButtonText: "Yes, delete it",
								positiveCallback: doDelete,
								negativeButtonText: "No, keep it"
							}
						);

						dialog.buttons[0].classes = ["btn-danger"];

						dialogService.showDialog(dialog);
					} else {
						doDelete();
					}
				}
			};

			$scope.editMarker = function() {
				if(userCanEditMarker()) {

					// Dismiss current dialog in case it hosts this MarkerInfo view (i.e. in "small" layout).
					// In the "large" layout, there can't be a dialog open if the user was able to click
					// the button that triggers this function, so this would be a NOOP.
					dialogService.dismissCurrentDialog();

					editMarkerScope.marker = $scope.marker;
					editMarkerScope.data = {
						name: $scope.marker.name,
						description: $scope.marker.description
					};
					editMarkerScope.funcs = {
					};

					var updateMarker = function() {
						var marker = editMarkerScope.marker;
						marker.name = editMarkerScope.data.name;
						marker.description = editMarkerScope.data.description;
						siteService.updateMarker(marker);
					};

					var dialog = new ViewDialog(
						"Edit Location",
						"EditMarkerCtrl",
						"html/partials/editmarker.html",
						editMarkerScope);

					var doneBtn = new DialogButton(
						"Done",
						true,
						updateMarker);
					doneBtn.addClass("btn-primary");
					dialog.buttons.push(doneBtn);

					dialogService.showDialog(dialog);
				}
			};

			var subscribeToEvents = function() {
				eventBus.subscribe("layoutChanged", onLayoutChanged);
			};

			var onLayoutChanged = function(/* String */ layoutType) {
				if(typeof $scope.smallOnStart === "undefined") {
					$scope.smallOnStart = layoutType === "small";
				}
				if(typeof $scope.largeOnStart === "undefined") {
					$scope.largeOnStart = layoutType === "large";
				}
			};

			var userCanEditMarker = function() {
				var canEditMarker = !siteService.getOnlyOwnerCanEdit();

				if(!canEditMarker) {
					var myUserId = siteService.getCurrentUserId();
					canEditMarker = myUserId === $scope.marker.ownerId || myUserId === siteService.getOwnerUserId();
				}

				$scope.userCanEditMarker = canEditMarker;
				return canEditMarker;
			};

			subscribeToEvents();
			userCanEditMarker(); // Initial call to populate $scope.userCanEditMarker
		}
	]
);
