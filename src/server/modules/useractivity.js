var activityArray = [
	{id: 1, code: "connect_to_site"},
	{id: 2, code: "disconnect_from_site"},
	{id: 3, code: "create_site"},
	{id: 4, code: "create_marker"},
	{id: 5, code: "delete_marker"},
	{id: 6, code: "edit_marker"}
];

var activitiesByCode = {};
var activitiesById = [];

for(var i = 0; i < activityArray.length; i++) {
	activitiesByCode[activityArray[i].code] = activityArray[i];
	activitiesById[activityArray[i].id] = activityArray[i];
}

function getActivityCode(/* Number */ id) {
	"use strict";
	return id < 1 || id >= activitiesById.length ? null : activitiesById[id].code;
}

exports.activityTypes = activitiesByCode;
exports.getActivityCode = getActivityCode;
