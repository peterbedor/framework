App.controller.make('test', {
	__construct() {
		console.log('test:__construct');
	},
	init() {
		console.log('test:init');
	},
	common(...variables) {
		// var $appDiv = document.getElementById('app');

		// console.log(variables);

		// $appDiv.innerText = variables;
	}
})