App.router
	.add('/', 'home')
	.add('test', 'test', function() {
		console.log('test');
	})
	.add('test/:id1/:id2', function() {
		console.log('123');
	})
	.run();

console.timeEnd();

// Find better place for this
window.App = App;