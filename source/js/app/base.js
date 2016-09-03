console.time();
var App = {};

(function(App) {
	'use strict';

	App.controller = {};

	App.controller.make = function(name, methods) {
		this[name] = methods;
	}

}(App));