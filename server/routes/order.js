'use strict'

const router = require('koa-router')();
const order = require('../controllers/order');

router
  .get('/', order.getCount)
  .get('/:id', order.getByOpenId)
  // .post('/', order.add);

module.exports = router;
