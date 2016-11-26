/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Purpose    :
* Created at : 2015-05-15
* Updated at : 2015-10-06
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

let //Builder        = require("./src/builder"),
	//JeefoBuilder   = require("./src/jeefo_builder"),
	AngularBuilder = require("./src/angular/builder");

module.exports = {
	/*
	CreateBuilder: options => {
		return new Builder(options || {});
	},

	CreateJeefoBuilder: options => {
		return new JeefoBuilder(options || {});
	},
	*/

	CreateAngularBuilder: options => {
		return new AngularBuilder(options || {});
	}
};
