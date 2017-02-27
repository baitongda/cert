'use strict'

const ObjectId = require('mongodb').ObjectID;
const Certificate = require('../models/certificate');
const shared = require('./shared');
const image = require('./shared/image');

exports.getAll = shared.getAll(Certificate)
exports.getImageList = image.getImageList('certificate');
