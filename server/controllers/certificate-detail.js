'use strict'

const ObjectId = require('mongodb').ObjectID;
const CertDetail = require('../models/certificate-detail');
const shared = require('./shared');

exports.getOne = shared.getOne(CertDetail);
