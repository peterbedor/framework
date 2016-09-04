const U = undefined;

export default Core = {
	$extend(target, object, deep, _set) {
		if (! object) {
			return target;
		}

		_set = _set || [];

		for (var key in object) {
			var src = object[key],
				// TODO: Why can't I use this?  this is the global window object
				// in this contentx?
				type = Core.$type(src);

			if (deep && type == 'object') {
				var len = _set.length,
					i = 0,
					val;

				for (; i < len; i++) {
					if (_set[i] === src) {
						val = src;
						break;
					}
				}

				if (val) {
					target[key] = val;
				} else {
					_set.push(src);
					target[key] = _extend(target[key] || {}, src, deep, _set);
				}
			} else if (src !== U) {
				target[key] = type == 'array' ? src.slice(0) : src;
			}
		}

		return target;
	},
	/**
	 * Serialize object
	 *
	 * @param {object} obj
	 * @returns {string} value
	 */
	$serialize(obj) {
		var arr = [];

		Object.keys(obj || {}).forEach(function(key) {
			var val = obj[key];
			key = encodeURIComponent(key);

			if (typeof val != 'object') {
				arr.push(key + '=' + encodeURIComponent(val));
			} else if (Array.isArray(val)) {
				val.forEach(function(el) {
					arr.push(key + '[]=' + encodeURIComponent(el));
				});
			}
		});

		return arr.length ? arr.join('&').replace(/%20/g, '+') : '';
	},

	/**
	 * Convert serialized string back into an object
	 *
	 * @param {string} str
	 * @returns {object} value
	 */
	$unserialize(str) {
		var obj = {};

		decodeURIComponent(str)
			.replace(/^\?/, '')
			.split('&').forEach(function(el) {
				var split = el.split('='),
					key = split[0],
					val = split[1].replace('+', ' ') || '';

				if (obj[key]) {
					obj[key] = W.$toArray(obj[key]);
					obj[key].push(val);
				} else {
					obj[key] = val;
				}
			});

		return obj;
	},

	/**
	 * Cast value to array if it isn't one
	 *
	 * @param {*} val
	 * @returns {Array} value
	 */
	$toArray(val) {
		return val !== U ? (Array.isArray(val) ? val : [val]) : [];
	},

	/**
	 * Determine the JavaScript type of an object
	 *
	 * @param {*} obj
	 * @returns string
	 */
	$type(obj) {
		return obj === U ? 'undefined' :
			Object.prototype.toString.call(obj)
				.replace(/^\[object (.+)]$/, '$1')
				.toLowerCase();
	},

	/**
	 * Determine if value is an array
	 *
	 * @param {*} obj
	 * @returns {boolean}
	 */
	$isArray(obj) {
		return Array.isArray(obj);
	},
}