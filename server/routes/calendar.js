'use strict'

const router = require('koa-router')();
const calendar = require('../controllers/calendar');

router
  .get('/', calendar.get);

module.exports = router;
