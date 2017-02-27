'use strict'

const router = require('koa-router')();
const pay = require('../controllers/pay');

router
  .post('/', pay.getOrderId)
  .post('/notify', pay.notify);

module.exports = router;
