'use strict'

// 外接其他平台
const router = require('koa-router')();
const platform = require('../controllers/platform');
const card = require('../controllers/platform-card');
const send = require('koa-send');

router
  .post('/pay', platform.pay)
  .post('/pay/getPrepayId', platform.getPrepayId)
  .post('/pay/getPayForm', platform.getPayForm)
  .post('/pay/notify', platform.notify)
  .post('/getcard', card.get)
  .post('/test', platform.test)

module.exports = router;
