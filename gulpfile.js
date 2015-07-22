var gulp = require('gulp'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	gutil = require('gulp-util'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	minifyCSS = require('gulp-minify-css'),
	path = require('path'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	browserify = require('browserify'),
	reactify = require('reactify'); 

gulp.task('browserify', function () {
	var bundler = browserify('./app/HumphreyApp.react.js');

	bundler
		.transform('reactify')
		.bundle()
		.pipe(source('./app/HumphreyApp.react.js'))
		.pipe(buffer())
		.pipe(rename('humphrey.js'))
		.pipe(gulp.dest('./public/'))
		.pipe(uglify().on('error', gutil.log))
		.pipe(rename('humphrey.min.js'))
		.pipe(gulp.dest('./public/'));
});

gulp.task('less', function () {
	gulp.src('./styles/humphrey.less')
		.pipe(less({ 
			paths: [ './styles/*.css' ],
			compress: true
		}))
		.pipe(autoprefixer('last 10 versions', 'ie 9'))
		.pipe(minifyCSS({ keepBreaks: false }))
		.pipe(gulp.dest('./public/'))
		.pipe(rename('humphrey.min.css'))
		.pipe(gulp.dest('./public/'));
});

gulp.task('watch', function () {
	gulp.watch('./app/**/*.js', ['browserify']);
	gulp.watch('./styles/**/*.less', ['less']);
});

gulp.task('default', ['browserify', 'less', 'watch']);
