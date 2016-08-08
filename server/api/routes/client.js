/**
 * Simple route for handling static files
 */

'use strict';
const Router = require('express').Router;

module.exports = new Router().get('/', (req, res) => {
  //res.sendfile('./public/index.html');
  res.render('index', {});
});
