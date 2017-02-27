'use strict'

var router = require('koa-router')();
var institution = require('../controllers/institution');

router
  .get('/', institution.getAll)
  .get('/:id', institution.getOne);

module.exports = router;
