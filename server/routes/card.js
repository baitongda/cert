'use strict'

const router = require('koa-router')();
const card = require('../controllers/card');

router
  .post('/get', card.get);

module.exports = router;
