const Router = require('express').Router;

module.exports = new Router().get('/', (req, res) => {
  res.sendfile('./public/index.html');
});
