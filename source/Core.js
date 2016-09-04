const U = undefined;

export default Core = {
	$extend(target, object, deep, _set) {
		if (! object) {
			return target;
		}

		_set = _set || [];

		for (var key in object) {
			var src = object[key],
				type = $type(src);

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
	}
}

/**
 * Determine the JavaScript type of an object
 *
 * @param {*} obj
 * @returns string
 */
function $type(obj) {
	return obj === U ? 'undefined' :
		Object.prototype.toString.call(obj)
			.replace(/^\[object (.+)]$/, '$1')
			.toLowerCase();
}