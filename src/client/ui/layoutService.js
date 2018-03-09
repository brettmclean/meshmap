meshmap.namespace("meshmap.ui");

meshmap.ui.layoutService = (function() {
	// imports
	var eventBusFactory = meshmap.events.factories.eventBusFactory;

	var eventBus = eventBusFactory.create();

	var MAX_WIDTH_SMALL_LAYOUT = 1024; // px
	var TOOLBAR_HEIGHT = 50; // px

	var state = {
		width: 0,
		height: 0,
		layout: ""
	};

	var onWindowResize = function() {
		var oldWidth = state.width;
		var oldHeight = state.height;
		state.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		state.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

		if(state.width !== oldWidth) {
			onWidthChange(oldWidth, state.width);
		}
		if(state.height !== oldHeight) {
			onHeightChange(oldHeight, state.height);
		}
	};

	var onWidthChange = function(oldWidth, newWidth) {
		triggerWidthChangedEvents();

		var smallLayoutBefore = oldWidth <= MAX_WIDTH_SMALL_LAYOUT;
		var smallLayoutAfter = newWidth <= MAX_WIDTH_SMALL_LAYOUT;

		state.layout = smallLayoutAfter ? "small" : "large";

		if(smallLayoutBefore !== smallLayoutAfter) {
			triggerLayoutChangedEvent();
		}
	};

	var onHeightChange = function(oldHeight, newHeight) {
		/* jshint unused:vars */
		triggerHeightChangedEvents();
	};

	var triggerLayoutChangedEvent = function() {
		eventBus.publishSticky("layoutChanged", state.layout);
	};

	var triggerHeightChangedEvents = function() {
		eventBus.publishSticky("windowHeightChanged", state.height);
	};

	var triggerWidthChangedEvents = function() {
		eventBus.publishSticky("windowWidthChanged", state.width);
	};

	if(window.attachEvent) {
		window.attachEvent("onresize", onWindowResize);
	} else {
		window.addEventListener("resize", onWindowResize);
	}

	onWindowResize();
	triggerLayoutChangedEvent();
	triggerHeightChangedEvents();

	return {
		TOOLBAR_HEIGHT: TOOLBAR_HEIGHT
	};
}());
