
'use strict';

const gulp = require('gulp');

const fs = require('fs');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = import('gulp-uglify');
const cleanCSS = import('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixerPromise = import('gulp-autoprefixer');
const exit = import('gulp-exit');
// @todo Image Optimization https://www.npmjs.com/package/gulp-imagemin

const nodemon = require('nodemon');




exports.start = () => {
  nodemon({
    script: 'web/server.js',
    ext: 'js mustache',
    env: {'NODE_ENV': 'development'}
  });
};

exports.exit = () => {
  exit();
};

exports.sass = async () => {

  gulp.src('./node_modules/font-awesome/fonts/**/*.*')
    .pipe(gulp.dest('./www/compiled/fonts/'));

  const { default : autoprefixer } = await autoprefixerPromise;

  return gulp.src('./www/scss/bootstrap.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('app.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./www/compiled/css/'));
};

exports.sassBuild = async () => {

  const { default : autoprefixer } = await autoprefixerPromise;

  return gulp.src('./www/scss/bootstrap.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('app.min.css'))
    .pipe(cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./www/compiled/css/'));
};

exports.sassWatch = () => {
  gulp.watch('./www/scss/*.scss', exports.sass);
};




exports.preScripts = () => {
  return gulp.src('./www/js/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./www/compiled/js/'));
}

exports.scripts = async () => {

  const files = [
    './node_modules/babel-polyfill/dist/polyfill.js',
    './node_modules/@popperjs/core/dist/umd/popper.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    // './node_modules/bootstrap/dist/js/bootstrap.js',
  ];

  const appFile = './www/compiled/js/app.js';
  if (fs.existsSync(appFile)) {
    files.push(appFile);
  }

  await exports.preScripts();

  return gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./www/compiled/js/'));
};

exports.scriptsBuild = async () => {

  const files = [
    './node_modules/babel-polyfill/dist/polyfill.js',
    './node_modules/@popperjs/core/dist/umd/popper.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    // './node_modules/bootstrap/dist/js/bootstrap.js',
  ];

  const appFile = './www/compiled/js/app.js';
  if (fs.existsSync(appFile)) {
    files.push(appFile);
  }

  await exports.preScripts();

  return gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./www/compiled/js/'));
};

exports.scriptsWatch = () => {
  gulp.watch('./www/js/*.js', exports.scripts);
};




exports.default = gulp.series(
  gulp.parallel(
    exports.sass,
    exports.scripts,
  ),
  gulp.parallel(
    exports.sassWatch,
    exports.scriptsWatch,
    exports.start,
  ),
);

exports.build = gulp.series(
  gulp.parallel(
    exports.sassBuild,
    exports.scriptsBuild,
  ),
  exports.exit,
);
