var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('rollup-plugin-babel');
    rollup = require('gulp-rollup'),
    concat = require('gulp-concat');

gulp.task('concatControllers', function() {
  return gulp.src('./source/controllers/*.js')
    .pipe(concat('Controllers.js'))
    .pipe(gulp.dest('./source/'));
});

gulp.task('rollup', function () {
  gulp.src([
    './source/main.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(rollup({
    treeshake: false,
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['es2015-rollup'],
      }),
    ],
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task('watch', function() {
  var watcher = gulp.watch('./source/**/*', ['concatControllers', 'rollup']);

  gulp.run(['concatControllers', 'rollup']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});