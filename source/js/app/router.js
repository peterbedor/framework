App.router = {
	/**
	 * Set up object variables
	 */
	__construct() {
		var path = window.location.pathname;

		this.optionalParam = /\((.*?)\)/g;
		this.namedParam = /(\(\?)?:\w+/g;
		this.splatParam = /\*\w+/g;
		this.escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
		this.routeStripper = /^[#\/]|\s+$/g;
		this.rootStripper = /^\/+|\/+$/g;
		this.pathStripper = /#.*$/;

		this.routes = [];
		this.routeMap = {};

		if (path.length > 1) {
			this.path = path.replace(this.rootStripper, '');
		} else {
			this.path = path;
		}
	},

	/**
	 * Add a route to route list
	 *
	 * @param {string} path - URI
	 * @param {string} action - method and action
	 * @param {bool|callback} middleware - callback middleware
	 */
	add(path, action, middleware = false) {
		if (path.length > 1) {
			path = path.replace(this.rootStripper, '');
		}

		this.routes.push(path);
		this.routeMap[path] = action;

		if (middleware) {
			middleware();
		}

		return this;
	},

	/**
	 * Execute routing logic
	 */
	run() {
		var i = 0,
			routes = this.routes,
			routeMap = this.routeMap;

		for (; i < routes.length; i++) {
			var route = routes[i],
				match = this._match(
					this._routeToRegExp(route)
				);

			if (match) {

				// If second parameter is a closure, run it and return
				if (typeof routeMap[route] === 'function') {
					routeMap[route]();

					return;
				}

				var matched = this._extract(
					routeMap[route]
				);

				var variables = this._extractVariables(
					this._routeToRegExp(route)
				);

				var controller = App.controller[matched.controller];

				// Run __construct and init methods if exist
				if (! matched.action) {
					if (controller.hasOwnProperty('__construct')) {
						controller.__construct();
					}
					if (controller.hasOwnProperty('init')) {
						controller.init();
					}
				} else if (controller[matched.action]) {
					if (typeof controller[matched.action] == 'function') {
						if (controller.hasOwnProperty('__construct')) {
							controller.__construct();
						}
						controller[matched.action](variables);
					}
				}

				break;
			}
		}
	},

	/**
	 * Match route to path
	 * @param  {[type]} routeRegExp - Route regular expression
	 * @return {bool}
	 */
	_match(routeRegExp) {
		return new RegExp(routeRegExp).test(this.path);
	},

	/**
	 * Extracts variables from route string
	 * @param  {string} routeRegExp - regular expression of route
	 * @return {array} - array of variables
	 */
	_extractVariables(routeRegExp) {
		var variables = new RegExp(routeRegExp).exec(this.path);

		return variables.slice(1, variables.length - 1);
	},

	/**
	 * Turn route string into a regular expression to be matched.
	 *
	 * @param  {string} route - Route string
	 * @return {string}
	 */
	_routeToRegExp(route) {
		route = route.replace(this.escapeRegExp, '\\$&')
			.replace(this.optionalParam, '(?:$1)?')
			.replace(this.namedParam, function(match, optional) {
				return optional ? match : '([^/?]+)';
			})
			.replace(this.splatParam, '([^?]*?)');

		return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
	},

	/**
	 * Extract controller and action from string
	 *
	 * @param  {string} methodAction - method and action delimited by :
	 * @return {object}
	 */
	_extract(methodAction) {
		var split = methodAction.split(':');

		return {
			controller: split[0],
			action: split[1]
		}
	}
}