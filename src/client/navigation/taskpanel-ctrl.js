(function() {

	var Task = function(id, partial, icon, opts) {
		opts = opts || {};

		this.id = id;
		this.partial = partial;
		this.classes = {
			icon: [icon]
		};
		this.tinyText = opts.tinyText || "";
		this.smallLayoutOnly = opts.smallLayoutOnly || false;

		this.notify = new NotifySettings();
	};

	var NotifySettings = function() {
		this.colors = {
			green: false,
			red: false
		};
		this.persist = false;
	};

	meshmap.angular.controllers.controller("TaskPanelCtrl",
		[
			"$scope",
			"$timeout",
			function($scope, $timeout) {

				// imports
				var eventBusFactory = meshmap.events.factories.eventBusFactory;

				// should match CSS transition length on .task-button-notify
				var NOTIFY_TRANSITION_LENGTH_MS = 500;

				var eventBus = eventBusFactory.create();

				var mapTask = new Task("map", null, "glyphicon-globe", { smallLayoutOnly: true });
				var userTask = new Task("users", "html/partials/users.html", "glyphicon-user");
				var chatTask = new Task("chat", "html/partials/chat.html", "glyphicon-comment");
				var advancedTask = new Task("advanced", "html/partials/advanced.html", "glyphicon-list");

				$scope.tasks = [
					mapTask,
					userTask,
					chatTask,
					advancedTask
				];
				$scope.currTask = mapTask;

				$scope.LAYOUT_SMALL = "small";
				$scope.LAYOUT_LARGE = "large";
				$scope.currLayout = null;

				$scope.taskButtonStyle = {
					width: 0
				};

				$scope.collapsed = false;

				$scope.toggleSidePanel = function() {
					$scope.collapsed = !$scope.collapsed;
					var sidePanelOpen = !$scope.collapsed;
					eventBus.publish("sidePanelToggled", sidePanelOpen);
				};

				$scope.taskButtonClick = function(task) {
					if($scope.collapsed) {
						$scope.toggleSidePanel();
					}
					changeTask(task);
				};

				$scope.currentLayoutIsSmall = function() {
					return $scope.currLayout === $scope.LAYOUT_SMALL;
				};

				$scope.currentLayoutIsLarge = function() {
					return $scope.currLayout === $scope.LAYOUT_LARGE;
				};

				$scope.taskShouldBeAvailable = function(task) {
					var taskUnavailable = $scope.currentLayoutIsLarge() && task.smallLayoutOnly;
					return !taskUnavailable;
				};

				var init = function() {
					subscribeToEvents();
					recalculateTaskButtonWidth();
				};

				var subscribeToEvents = function() {
					eventBus.subscribe("layoutChanged", onLayoutChanged);
					eventBus.subscribe("taskTinyTextChanged", onTaskTinyTextChanged);
				};

				var onLayoutChanged = function(layoutType) {
					$scope.currLayout = layoutType;
					recalculateTaskButtonWidth();
					ensureCurrTaskIsValidForLayout();
				};

				var recalculateTaskButtonWidth = function() {
					var buttonCount = $scope.tasks.filter(function(task) {
						return $scope.taskShouldBeAvailable(task);
					}).length;

					var hasCollapseButton = $scope.currentLayoutIsLarge();
					if(hasCollapseButton) {
						buttonCount++;
					}

					$scope.taskButtonStyle.width = (100 / buttonCount) + "%";
				};

				var ensureCurrTaskIsValidForLayout = function() {
					var isValidForCurrentLayout = $scope.currentLayoutIsSmall() ? isValidForSmallLayout : isValidForLargeLayout;

					if(!isValidForCurrentLayout($scope.currTask)) {
						for(var i = 0; i < $scope.tasks.length; i++) {
							var task = $scope.tasks[i];
							if(isValidForCurrentLayout(task)) {
								changeTask(task);
								break;
							}
						}
					}
				};

				var isValidForSmallLayout = function(task) {
					/* jshint unused:vars */
					return true;
				};

				var isValidForLargeLayout = function(task) {
					return !task.smallLayoutOnly;
				};

				var changeTask = function(task) {
					$scope.currTask = task;
					eventBus.publish("sectionChanged", task.id);
				};

				var onTaskTinyTextChanged = function(tinyTextChange) {
					var task = findTask(tinyTextChange.sectionId);

					if(!task) {
						return;
					}

					task.tinyText = tinyTextChange.text;
					handleNotify(task, tinyTextChange);
				};

				var findTask = function(taskId) {
					var matches = $scope.tasks.filter(function(task) {
						return task.id === taskId;
					});
					return matches.length > 0 ? matches[0] : null;
				};

				var handleNotify = function(task, tinyTextChange) {
					if(tinyTextChange.notifyColor) {
						showNotifyColor(task, tinyTextChange);
					} else {
						clearNotifyColors(task);
					}
				};

				var showNotifyColor = function(task, tinyTextChange) {
					var notifySettings = task.notify;
					var notifyColors = notifySettings.colors;

					var newNotifyColor = tinyTextChange.notifyColor;
					var newPersistValue = tinyTextChange.notifyRemain;

					// If notification is already on and is to remain solid,
					// flash color off and then back on to show a new event has occurred.
					if(notifyColors[newNotifyColor] && notifySettings.persist) {

						notifyColors[newNotifyColor] = false;

						$timeout(function() {
							notifyColors[newNotifyColor] = true;
						}, NOTIFY_TRANSITION_LENGTH_MS);
					} else {
						notifyColors[newNotifyColor] = true;
						if(!newPersistValue) {
							$timeout(function() {
								notifyColors[newNotifyColor] = false;
							}, NOTIFY_TRANSITION_LENGTH_MS);
						}
						notifySettings.persist = newPersistValue;
					}
				};

				var clearNotifyColors = function(task) {
					var notifySettings = task.notify;
					clearAllColorsOnNotifySettings(notifySettings);
					notifySettings.persist = false;
				};

				var clearAllColorsOnNotifySettings = function(notifySettings) {
					var colors = notifySettings.colors;
					for(var color in colors) {
						if(colors.hasOwnProperty(color)) {
							colors[color] = false;
						}
					}
				};

				init();
			}
		]
	);

}());
