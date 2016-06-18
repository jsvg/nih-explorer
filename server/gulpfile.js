'use strict';
const livereload = require('gulp-livereload'), 
      nodemon = require('gulp-nodemon'),
      gulp = require('gulp');

gulp.task('nodemon', (cb) => {
  let started = false;
  livereload.listen();
  return nodemon({
    script: 'app.js',
    }).on('start', () => {
      if (!started) {
        started = true;
        cb();
      }
    }).on('restart', () => {
      setTimeout(() => {
        gulp.src('app.js')
          .pipe(livereload());
      }, 1000);
    });
});

gulp.task('default', ['nodemon'], () => {});
