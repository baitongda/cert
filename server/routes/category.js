'use strict'

var router = require('koa-router')();
var category = require('../controllers/category');

router
  .get('/', category.getAll);

module.exports = router;
