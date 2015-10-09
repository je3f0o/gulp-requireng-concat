/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name  : utils.js
* Purpose    :
* Created at : 2015-10-01
* Updated at : 2015-10-01
* Author     : jeefo
_._._._._._._._._._._._._._._._._._._._._.*/

"use strict";

if (String.prototype.capatalize === void 0) {
	String.prototype.capatalize = function () {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};
}

