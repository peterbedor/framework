# Router

Routing module to execute methods on controllers based on the current uri.

### Adding Routes
By not specificying the method, the `__construct` and `init` methods on your controller will be executed.  Otherwise, the `__construct` and method you specify will be executed.

```
Router.add('/home', 'home:action');
```

The above route will execute the `action` method on the `home` controller when the uri matches `/home`.

The `Router.add` method is chainable:

```
Router.add('/', 'index')
    .add('/home', 'controller')
    .add('/about', 'about')
    .add('/contact' 'contact');
```

### Variables
You may pass variables to your controller.  The variables will be available in order as an array to your method.

```
Router.add('/posts/:id/:title', 'posts:show');
```

With a uri strcture match `/posts/2/post-title` will be available inside the spread and rest operators:

```
export let posts = {
	show(...args) {
		console.log(...args);
	},
}
```

Will output `['2', 'post-title']`

### Multiple Controller Actions

You may specify multiple controller actions for each uri.

```
Router.add('/posts/:id/', ['posts:show', 'posts:comments']);
```

### Closures

You may also pass in a closure as the second parameter to immediately execute routing logic.  The spread and rest operators work here exactly like in a controller method.

```
Router.add('/posts/:id/', function(...args) {
    console.log(...args)
});
```

With a uri match of `/posts/2/`, the above will output ['2'].

# Controllers

Using ES2015 module exports, you may specify any number of object controllers.  You may use just one file or multiple files, as anything inside the `controllers` folder will be concatenated into one single file.

```
export let posts = {
    __construct(postId) {
        this.postId = postId;
    },

	init() {
		//
	},

	getPostId() {
	    reutrn this.postId;
	}
}
```