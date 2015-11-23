var gulp		= require('gulp'),
	run			= require('gulp-run'),
	concat		= require('gulp-concat'),
	livereload	= require('gulp-livereload'),
	sass		= require('gulp-sass'),
	minifycss	= require('gulp-minify-css'),
	bourbon		= require('node-bourbon');

var source = {
	styles		: 'css',
	images		: 'img'
};

var destination = {
	styles		: 'build/css',
	images		: 'build/images'
};

gulp.task('default', ['scripts', 'styles', 'images', 'run', 'watch']);

gulp.task('scripts', function () {
	run('babel --presets react js/ --watch --out-dir build/js').exec();
});

gulp.task('styles', function () {
	return gulp.src(source.styles + '/*.scss')
		.pipe(sass({includePaths: bourbon.with(source.styles)}))
		.pipe(concat('style.css'))
		.pipe(minifycss())
		.pipe(gulp.dest(destination.styles))
		.pipe(livereload())
});

gulp.task('images', function () {
	return gulp.src(source.images + '/**/*.svg')
		.pipe(gulp.dest(destination.images));
});

gulp.task('run', function () {
	run('npm start').exec();
});

gulp.task('watch', ['scripts', 'styles'], function () {
	livereload.listen();
	gulp.watch([source.scripts + '/**/*.js*'], ['scripts']);
	gulp.watch(source.styles + '/**/*.scss', ['styles']);
});
