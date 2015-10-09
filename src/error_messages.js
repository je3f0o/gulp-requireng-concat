/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : error_messages.js
* Purpose    :
* Created at : 2015-10-01
* Updated at : 2015-10-01
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var event_dispatcher = require("jeefo-event-dispatcher");

function ErrorMessages (messages) {
	this.messages = {
	};

	return this;
}
var p = ErrorMessages.prototype;

p.exit = function (message) {
	console.error("ERROR : " + message);
	process.exit(1);
};

module.exports = {
	Create : function (messages) {
		messages = messages || {};
		return new ErrorMessages(messages);
	}
};
