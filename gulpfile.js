var gulp		= require('gulp'),
	run			= require('gulp-run'),
	electron	= require('gulp-electron'),
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

gulp.task('default', ['scripts', 'styles', 'run', 'watch']);

gulp.task('scripts', function () {});

gulp.task('styles', function () {
	return gulp.src(source.styles + '/*.scss')
		.pipe(sass({includePaths: bourbon.with(source.styles)}))
		.pipe(concat('style.css'))
		.pipe(minifycss())
		.pipe(gulp.dest(destination.styles))
		.pipe(livereload())
});

gulp.task('run', function () {
	return run('npm start').exec();
});

gulp.task('watch', ['scripts', 'styles'], function () {
	livereload.listen();
	//gulp.watch([source.scripts + '/**/*.js'], ['scripts']);
	gulp.watch(source.styles + '/**/*.scss', ['styles']);
});
