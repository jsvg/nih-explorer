'use strict';
const livereload = require('gulp-livereload'), 
      nodemon = require('gulp-nodemon'),
      mocha = require('gulp-mocha'),
      logger = require('bragi'),
      gulp = require('gulp');

function test() {
  setTimeout(() => {
    gulp.src('test/tests.js', {read: false})
      .pipe(mocha({reporter: 'spec', ui: 'bdd'}))
      .once('error', (err) => {
        logger.log('warn: error bubbled to gulp test task', err);
      });
  }, 1000);
}

gulp.task('nodemon', (cb) => {
  let started = false;
  livereload.listen();
  return nodemon({
    script: 'api/server.js',
    }).on('start', () => {
      if (!started) {
        cb();
        started = true;
        //test();
      }
    }).on('restart', () => {
      setTimeout(() => {
        //test();
        gulp.src('api/server.js')
          .pipe(livereload());
      }, 1000);
    });
});

gulp.task('default', ['nodemon'], () => {});
