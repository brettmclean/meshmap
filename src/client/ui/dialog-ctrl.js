meshmap.angular.controllers.controller("DialogCtrl",
	[
		"$scope",
		function($scope) {

			// imports
			var eventBusFactory = meshmap.events.factories.eventBusFactory,
				ViewInjectionService = meshmap.angular.ViewInjectionService;

			var UI_TYPE_MESSAGE = "message";
			var UI_TYPE_VIEW = "view";

			var dialogQueue = []; // Dialog[]

			var viewContainerElem = null;

			$scope.currDialog = null;
			$scope.currDialogUiType = null;

			$scope.safeApply = function(fn) {
				var phase = this.$root.$$phase;
				if(phase === "$apply" || phase === "$digest") {
					if(fn && (typeof(fn) === "function")) {
						fn();
					}
				} else {
					this.$apply(fn);
				}
			};

			$scope.setViewContainer = function(/* HTMLElement */ elem) {
				viewContainerElem = elem;
			};

			var subscribeToEvents = function() {
				var eventBus = eventBusFactory.create();
				eventBus.subscribe("dialogRequested", onDialogRequested);
				eventBus.subscribe("dialogDismissalRequested", onDialogDismissalRequested);
				eventBus.subscribe("currentDialogDismissalRequested", onCurrentDialogDismissalRequested);
			};

			var onDialogRequested = function(/* Dialog */ dialog) {
				dialogQueue.push(dialog);
				if(!$scope.currDialog) {
					$scope.safeApply(function() {
						nextDialog();
					});
				}
			};

			var onDialogDismissalRequested = function(/* Number */ handle) {
				for(var i = dialogQueue.length - 1; i >= 0; i--) {
					var dialog = dialogQueue[i];
					if(dialog.handle === handle) {
						dialogQueue.splice(i, 1);
					}
				}

				if($scope.currDialog && $scope.currDialog.handle === handle) {
					nextDialog();
				}
			};

			var onCurrentDialogDismissalRequested = function() {
				if($scope.currDialog) {
					nextDialog();
				}
			};

			var nextDialog = function() {
				$scope.currDialogUiType = $scope.currDialog = null;

				if(dialogQueue.length < 1) {
					return;
				}

				var dialog = dialogQueue.shift();

				var createClickHandler = function(button) {
					return function() {
						var view = dialog.view;
						if(view) {
							var viewScope = view.scope;
							if(viewScope) {
								var funcs = viewScope.funcs;
								if(funcs && typeof funcs.isValid === "function") {
									if(!funcs.isValid()) {
										return;
									}
								}
							}
						}
						if(typeof button.callback === "function") {
							button.callback(dialog, button.value);
						}
						nextDialog();
					};
				};

				for(var i = 0; i < dialog.buttons.length; i++) {
					var button = dialog.buttons[i];
					button.onclick = createClickHandler(button);
				}

				$scope.currDialog = dialog;
				$scope.currDialogUiType = dialog.message ? UI_TYPE_MESSAGE : UI_TYPE_VIEW;
				if(dialog.view) {
					loadView();
				}
			};

			var loadView = function() {
				var viewInfo = $scope.currDialog.view;
				if(viewInfo) {
					angular.element(viewContainerElem).empty();

					var viewInjectionService = new ViewInjectionService(angular, false);
					viewInjectionService.injectAndCreate(viewContainerElem, viewInfo.controller, viewInfo.includePath, viewInfo.scope);
				}
			};

			subscribeToEvents();
		}
	]
);
