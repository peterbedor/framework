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

	add(path, action, middleware = false) {
		this.routes.push(_path);
		this.routeMap[_path] = action;

		if (middleware) {
			middleware();
		}
	},

	run() {
		let i = 0;

		for (; i < this.routes.length; i++) {
			let route = this.routes[i],
				match = _match(
					_routeToRegExp(route)
				);

			if (match) {

				// If second parameter is a closure, run it and return
				if (typeof this.routeMap[route] === 'function') {
					this.routeMap[route]();

					return;
				}

				let matched = _extract(
					this.routeMap[route]
				);

				let variables = _extractVariables(
					_routeToRegExp(route)
				);

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
	let split = methodAction.split(':');

	return {
		controller: split[0],
		action: split[1]
	}
}