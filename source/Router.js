// #Public

const _optionalParam = /\((.*?)\)/g,
	_namedParam = /(\(\?)?:\w+/g,
	_splatParam = /\*\w+/g,
	_escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g,
	_routeStripper = /^[#\/]|\s+$/g,
	_rootStripper = /^\/+|\/+$/g,
	_pathStripper = /#.*$/,
	_path = _parsePath(window.location.pathname);

export default Router = {
	routes: [],
	routeMap: {},
	middlewareMap: {},

	add(path, action, middleware = false) {
		path = _parsePath(path);

		this.routes.push(path);

		this.routeMap[path] = {};

		this.routeMap[path].action = action;
		this.routeMap[path].middleware = {};

		if (middleware) {
			if (Core.$isArray(middleware)) {
				let i = 0;

				for (; i < middleware.length; i++) {
					this.routeMap[path].middleware[middleware[i]] = this.middlewareMap[middleware[i]];
				}
			} else {
				this.routeMap[path].middleware[middleware] = this.middlewareMap[middleware];
			}
		}

		return this;
	},

	middleware(name, callback) {
		this.middlewareMap[name] = callback;

		return this;
	},

	run() {
		let routes = this.routes,
			map = this.routeMap,
			i = 0;

		for (; i < routes.length; i++) {
			let route = routes[i],
				match = _match(
					_routeToRegExp(route)
				);

			if (match) {

				// If second parameter is a closure, run it and return
				if (typeof map[route] === 'function') {
					map[route]();

					return;
				}

				let middlewares = Object.keys(map[route].middleware),
					c = 0;

				for (; c < middlewares.length; c++) {
					map[route].middleware[middlewares[c]](_path);
				}

				let matched = _extract(
					map[route].action
				);

				let variables = _extractVariables(
					_routeToRegExp(route)
				);

				if (Core.$isArray(matched.controller)) {
					let b = 0;

					for (; b < matched.controller.length; b++) {
						let controller = window[matched.controller[i]];

						// Run __construct and init methods if exist
						if (! matched.action[b]) {
							if (controller.hasOwnProperty('__construct')) {
								controller.__construct();
							}

							if (controller.hasOwnProperty('init')) {
								controller.init();
							}
						} else if (controller[matched.action[b]]) {
							if (typeof controller[matched.action[b]] == 'function') {
								if (controller.hasOwnProperty('__construct')) {
									controller.__construct();
								}

								controller[matched.action[b]](variables);
							}
						}
					}
				} else {
					let controller = window[matched.controller];

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
		}
	}
}

// #Private

function _parsePath(path) {
	if (path.length > 1) {
		path = path.replace(_rootStripper, '');
	}

	return path;
}

/**
 * Match route to path
 * @param  {[type]} routeRegExp - Route regular expression
 * @return {bool}
 */
function _match(routeRegExp) {
	return new RegExp(routeRegExp).test(_path);
}

/**
 * Extracts variables from route string
 * @param  {string} routeRegExp - regular expression of route
 * @return {array} - array of variables
 */
function _extractVariables(routeRegExp) {
	let variables = new RegExp(routeRegExp).exec(_path);

	return variables.slice(1, variables.length - 1);
}

/**
 * Turn route string into a regular expression to be matched.
 *
 * @param  {string} route - Route string
 * @return {string}
 */
function _routeToRegExp(route) {
	route = route.replace(_escapeRegExp, '\\$&')
		.replace(_optionalParam, '(?:$1)?')
		.replace(_namedParam, function(match, optional) {
			return optional ? match : '([^/?]+)';
		})
		.replace(_splatParam, '([^?]*?)');

	return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
}

/**
 * Extract controller and action from string
 *
 * @param  {string} methodAction - method and action delimited by :
 * @return {object}
 */
function _extract(methodAction) {
	if (Core.$isArray(methodAction)) {
		let i = 0,
			controllers = [],
			actions = [];

		for (; i < methodAction.length; i++) {
			let split = methodAction[i].split(':');

			controllers.push(split[0]);
			actions.push(split[1]);
		}

		return {
			controller: controllers,
			action: actions
		}
	} else {
		let split = methodAction.split(':');

		return {
			controller: split[0],
			action: split[1]
		}
	}
}