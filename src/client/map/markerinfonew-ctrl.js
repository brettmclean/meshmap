meshmap.angular.controllers.controller("MarkerInfoNewCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var siteService = meshmap.state.SiteService.instance,
				DialogButton = meshmap.ui.dialogs.DialogButton,
				ConfirmDialog = meshmap.ui.dialogs.ConfirmDialog,
				ViewDialog = meshmap.ui.dialogs.ViewDialog,
				DialogService = meshmap.ui.DialogService;

			var dialogService = DialogService.instance;

			var editMarkerScope = $scope.$new();

			/*
				Available from parent scope:
				$scope.marker: PointMarker|PolylineMarker|PolygonMarker
			*/

			$scope.deleteMarker = function() {
				if(userCanEditMarker()) {

					// Dismiss current dialog in case it hosts this MarkerInfo view (i.e. in "small" layout).
					// In the "large" layout, there can't be a dialog open if the user was able to click
					// the button that triggers this function, so this would be a NOOP.
					dialogService.dismissCurrentDialog();

					var doDelete = function() {
						siteService.removeMarker($scope.ctx.marker.id);
					};

					var confirmDeletion = siteService.getUserSettings().confirmMarkerDeletion;
					if(confirmDeletion) {
						var dialog = new ConfirmDialog(
							"Delete Location?",
							"Are you sure you want to delete \"" + $scope.ctx.marker.name + "\"? This cannot be undone.",
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

					editMarkerScope.marker = $scope.ctx.marker;
					editMarkerScope.data = {
						name: $scope.ctx.marker.name,
						description: $scope.ctx.marker.description
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

			var userCanEditMarker = function() {
				return $scope.ctx.userCanEditMarker;
			};
		}
	]
);
