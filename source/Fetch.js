const _request = new XMLHttpRequest(),
	_extend = Core.$extend;

export default Fetch = {
	get(options) {
		return _makeRequest(_extend({
			method: 'get'
		}, options));
	},

	post(options) {
		return _makeRequest(_extend({
			method: 'post'
		}, options));
	},

	put(options) {
		return _makeRequest(_extend({
			method: 'put'
		}, options));
	},

	patch(options) {
		return _makeRequest(_extend({
			method: 'patch'
		}, options));
	},

	delete(options) {
		return _makeRequest(_extend({
			method: 'delete'
		}, options));
	}
};

function _makeRequest(options) {
	_request.open(options.method, options.url);

	if (options.send) {
		options.send();
	}

	_request.send();

	_request.onreadystatechange = function() {
		_handleStateChange(_request, options)
	}
}

function _handleStateChange(request, options) {
	if (request.readyState === 4) {
		let code = request.status;

		if (code >= 200 && code < 400) {
			if (options.success) {
				_success(_request, options)
			}
		} else if (options.error) {
			options.error();
		}

		if (options.complete) {
			options.complete();
		}
	}
}

function _success(request, options) {
	let response = ! options.responseType || options.responseType == 'text' ?
		request.responseText : request.response;

	if (options.json) {
		try {
			response = JSON.parse(response);
		} catch (e) {
			response = {};
		}
	}

	options.success(response);
}