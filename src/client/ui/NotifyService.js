meshmap.namespace("meshmap.ui");

meshmap.ui.NotifyService = (function() {

	var NotifyService = function(deps) {
		deps = deps || /* istanbul ignore next */ {};

		this._eventBus = deps.eventBus || null;
		this._site = deps.siteService || null;

		this._activeSection = null;
		this._sidePanelIsOpen = true;
		this._layoutType = null;
		this._unreadChats = 0;

		subscribeToEvents.call(this);
	};

	var fireEventWithArg = function(eventName, eventArg) {
		callEventBusPublish.call(this, [eventName, eventArg]);
	};

	var callEventBusPublish = function(publishArgs) {
		this._eventBus.publish.apply(this._eventBus, publishArgs);
	};

	var subscribeToEvents = function() {
		if(this._eventBus) {
			this._eventBus.subscribe("startupDataReceived", onStartupDataReceived.bind(this));
			this._eventBus.subscribe("userAdded", onUserAdded.bind(this));
			this._eventBus.subscribe("userRemoved", onUserRemoved.bind(this));
			this._eventBus.subscribe("sectionChanged", onSectionChanged.bind(this));
			this._eventBus.subscribe("layoutChanged", onLayoutChanged.bind(this));
			this._eventBus.subscribe("sidePanelToggled", onSidePanelToggled.bind(this));
			this._eventBus.subscribe("chatMessageReceived", onChatMessageReceived.bind(this));
		}
	};

	var onStartupDataReceived = function(startupData) {
		this._updateSectionTinyText(SECTIONS.USERS, startupData.users.length, null);
	};

	var onUserAdded = function(userInfo) {
		/* jshint unused:vars */
		var notifyColor = !this._canSeeSection(SECTIONS.USERS) ? COLORS.GREEN : null;
		this._updateSectionTinyText(SECTIONS.USERS, this._site.getUsers().length, notifyColor);
	};

	var onUserRemoved = function(userInfo) {
		/* jshint unused:vars */
		var notifyColor = !this._canSeeSection(SECTIONS.USERS) ? COLORS.RED : null;
		this._updateSectionTinyText(SECTIONS.USERS, this._site.getUsers().length, notifyColor);
	};

	var onSectionChanged = function(sectionId) {
		var priorActiveSection = this._activeSection;
		this._activeSection = sectionId;

		var changed = priorActiveSection !== this._activeSection;
		if(changed) {
			onSectionActive.call(this, sectionId);
		}
	};

	var onSectionActive = function(sectionId) {
		if(sectionId === SECTIONS.CHAT) {
			onChatSectionActive.call(this);
		}
	};

	var onChatSectionActive = function() {
		this._unreadChats = 0;
		this._updateSectionTinyText(SECTIONS.CHAT, "", null);
	};

	var onLayoutChanged = function(layoutType) {
		this._layoutType = layoutType;
	};

	var onSidePanelToggled = function(sidePanelOpen) {
		this._sidePanelIsOpen = sidePanelOpen;
	};

	var onChatMessageReceived = function(chatMessage) {
		/* jshint unused:vars */
		if(!this._canSeeSection(SECTIONS.CHAT)) {
			this._unreadChats++;
			this._updateSectionTinyTextWithColorLinger(SECTIONS.CHAT, this._unreadChats, COLORS.GREEN);
		}
	};

	NotifyService.prototype._canSeeSection = function(sectionId) {
		return this._activeSection === sectionId &&
			(this._layoutType === LAYOUT.SMALL || this._sidePanelIsOpen);
	};

	NotifyService.prototype._updateSectionTinyTextWithColorLinger = function(sectionId, text, flashColor) {
		var change = createTinyTextChange(sectionId, text, flashColor);

		change.notifyRemain = !!change.notifyColor;
		fireEventWithArg.call(this, "taskTinyTextChanged", change);
	};

	NotifyService.prototype._updateSectionTinyText = function(sectionId, text, flashColor) {
		var change = createTinyTextChange(sectionId, text, flashColor);
		fireEventWithArg.call(this, "taskTinyTextChanged", change);
	};

	var createTinyTextChange = function(sectionId, text, flashColor) {
		return new TinyTextChange(sectionId, text, flashColor);
	};

	var COLORS = {
		RED: "red",
		GREEN: "green"
	};

	var SECTIONS = {
		USERS: "users",
		CHAT: "chat"
	};

	var LAYOUT = {
		SMALL: "small",
		LARGE: "large"
	};

	NotifyService.COLORS = COLORS;
	NotifyService.SECTIONS = SECTIONS;

	var TinyTextChange = function(sectionId, text, notifyColor) {
		this.sectionId = sectionId;
		this.text = text;
		this.notifyColor = notifyColor;
		this.notifyRemain = false;
	};

	return NotifyService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.NotifyService;
}
