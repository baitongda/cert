'use strict'

var router = require('koa-router')();
var chapter = require('../controllers/qbank-chapter');

router
  .get('/:id', chapter.getByCategateId)


module.exports = router;
