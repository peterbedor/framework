var gulp = require("gulp");
var babel = require("gulp-babel");
var uglify = require('gulp-uglify');
var pump = require('pump');
var concat = require('gulp-concat');

gulp.task('scripts', function() {
	return gulp.src([
		'source/js/app/base.js',
		'source/js/app/controllers/*.js',
		'source/js/app/router.js',
		'source/js/app/start.js',
		'source/js/routes.js'
		])
	.pipe(concat('app.js'))
	.pipe(babel())
	.pipe(uglify())
	.pipe(gulp.dest('public/assets/js'))
});

gulp.task('watch', function(){
	gulp.watch('source/js/**', ['scripts']);
})