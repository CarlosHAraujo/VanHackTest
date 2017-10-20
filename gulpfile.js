var gulp = require('gulp');
var jshint = require('gulp-jshint');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var inject = require('gulp-inject');
var flatten = require('gulp-flatten');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');

var paths = {
    scripts: 'modules/**/*.js'
};
var usingJS = [
    './bower_components/angular/angular.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    './bower_components/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js',
    './bower_components/angular-srph-age-filter/angular-age-filter.js'
];
var usingCSS = [
    './bower_components/bootstrap/dist/css/bootstrap.css',
    './bower_components/bootstrap/dist/css/bootstrap-theme.css'
];
var usingFonts = './bower_components/bootstrap/dist/fonts/*';
var vendorcss = './lib/vendorcss';
var vendorfonts = './lib/fonts';
var vendorjs = './lib/vendorjs';
var webserver = require('gulp-webserver');

gulp.task('watch', [], function () {
    return gulp.watch(paths.scripts).on('change', function (event) {
        if (event.type === 'changed') {
            gulp.src(event.path)
                .pipe(jshint('.jshintrc'))
                .pipe(jshint.reporter('jshint-stylish'));
        }
    });
});

gulp.task('jshint', [], function () {
    return gulp.src(paths.scripts)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('webserver', function () {
    return gulp.src('./')
        .pipe(webserver({
            livereload: {
                enable: true
            },
            open: 'http://localhost:8000/modules/',
            fallback: 'index.html'
        }));
});

gulp.task('copy-js', function () {
    return gulp.src(usingJS)
        .pipe(flatten({ includeParents: 0 }))
        .pipe(gulp.dest(vendorjs));
});

gulp.task('copy-css', function () {
    return gulp.src(usingCSS)
        .pipe(flatten({ includeParents: 0 }))
        .pipe(gulp.dest(vendorcss));
});

gulp.task('copy-fonts', function () {
    return gulp.src(usingFonts)
        .pipe(flatten({ includeParents: 0 }))
        .pipe(gulp.dest(vendorfonts));
});

gulp.task('min-js', function () {
    return gulp.src([vendorjs + '/*.js', paths.scripts])
        .pipe(minify({
            ext: {
                min: '.min.js'
            },
            noSource: true,
            ignoreFiles: ['*.min.js']
        }))
        .pipe(flatten({ includeParents: 0 }))
        .pipe(gulp.dest(vendorjs));
});

gulp.task('min-css', () => {
    return gulp.src([vendorcss + '/*.css', '!' + vendorcss + '/*.min.css'])
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(flatten({ includeParents: 0 }))
        .pipe(gulp.dest(vendorcss));
});

gulp.task('inject', function () {
    var target = gulp.src('./modules/index.html');
    var finalJs = gulp.src([
        vendorjs + '/angular.min.js',
        vendorjs + '/angular-ui-router.min.js',
        vendorjs + '/ui-bootstrap-tpls.min.js',
        vendorjs + '/angular-bootstrap-checkbox.min.js',
        vendorjs + '/angular-age-filter.min.js',
        vendorjs + '/user.module.min.js',
        vendorjs + '/app.module.min.js'
    ], { read: false });
    var finalCss = gulp.src([
        vendorcss + '/bootstrap.min.css',
        vendorcss + '/bootstrap-theme.min.css'
    ], { read: false });

    return target
        .pipe(inject(finalCss))
        .pipe(inject(finalJs))
        .pipe(gulp.dest('./modules'));
});

gulp.task('run', function () {
    return runSequence(['copy-css', 'copy-fonts', 'copy-js'], 'min-css', 'min-js', 'inject', 'webserver');
});