var keys = Object.keys(App);

for (var i = 0; i < keys.length; i++) {
	if (typeof App[keys[i]]['__construct'] === 'function') {
		App[keys[i]]['__construct']();
	}
}