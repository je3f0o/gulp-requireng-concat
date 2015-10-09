/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : gulp-requireng-concat.js
* Purpose    :
* Created at : 2015-05-15
* Updated at : 2015-10-06
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

var Builder = require("./src/builder");

module.exports = {
	CreateBuilder: function(options) {
		return new Builder(options || {});
	}
};
