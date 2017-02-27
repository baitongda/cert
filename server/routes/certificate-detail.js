'use strict'

const router = require('koa-router')();
const detail = require('../controllers/certificate-detail');

router
  .get('/:id', detail.getOne)

module.exports = router;
