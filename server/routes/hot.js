'use strict'

const router = require('koa-router')();
const hot = require('../controllers/hot');

router
  .get('/', hot.get);

module.exports = router;
