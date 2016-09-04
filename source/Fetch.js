const _request = new XMLHttpRequest(),
	_extend = Core.$extend;

export default Fetch = {
	get(options) {
		return _makeRequest(_extend({
			method: 'GET'
		}, options));
	},

	post(options) {
		return _makeRequest(_extend({
			method: 'POST'
		}, options));
	},

	put(options) {
		return _makeRequest(_extend({
			method: 'PUT'
		}, options));
	},

	patch(options) {
		return _makeRequest(_extend({
			method: 'PATCH'
		}, options));
	},

	delete(options) {
		return _makeRequest(_extend({
			method: 'DELETE'
		}, options));
	}
};

function _makeRequest(options) {
	let contentTypeHeader = 'Content-Type',
		send = null,
		headers = [];

	if (options.method == 'GET') {
		options.url = _getUrl(options);
	} else {
		var string = typeof options.data == 'string';

		if (! string && ! options.type) {
			options.type = 'json';
		}

		send = string || options.processData === false ?
			options.data :
			options.type == 'json' ?
				JSON.stringify(options.data) :
				Core.$serialize(options.data);
	}

	_request.open(options.method, options.url);

	// Add content type header
	if (options.type == 'json') {
		headers[contentTypeHeader] = 'application/json';
	} else if (options.type == 'xml') {
		headers[contentTypeHeader] = 'text/xml';
	} else if (options.method == 'POST' || options.type == 'form') {
		headers[contentTypeHeader] =
			'application/x-www-form-urlencoded';
	}

	// Accept JSON header
	if (options.json) {
		headers.Accept = 'application/json, text/javascript, */*; q=0.01';
	}

	// Add X-Requested-With header for same domain requests
	var a = document.createElement('a');
	a.href = options.url;

	if (! a.host || a.host == location.host) {
		headers['X-Requested-With'] = 'XMLHttpRequest';
	}

	// Append character set to content type header
	headers[contentTypeHeader] += '; charset=UTF-8';

	// Extend configured headers into defaults
	headers = Core.$extend(headers, options	.headers);

	// Set request headers
	for (var key in headers) {
		var val = headers[key];

		if (val !== false) {
			_request.setRequestHeader(key, val);
		}
	}

	if (options.send) {
		options.send();
	}

	// Set response type
	if (options.responseType) {
		_request.responseType = options.responseType;
	}

	_request.send(send);

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

function _getUrl(options) {
	var url = options.url.replace(/[\?&]$/, '');

	if (options.data && Object.keys(options.data).length) {
		url += (url.indexOf('?') < 0 ? '?' : '&') +
			Core.$serialize(options.data);
	}

	if (url[0] != '/' && ! /^(?:[a-z]+:)?\/\//i.test(url)) {
		url = '/' + url;
	}

	return url;
}