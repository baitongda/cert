'use strict'

const router = require('koa-router')();
const verification = require('../controllers/verification');

router
  .get('/:phone', verification.getCode)

module.exports = router;
