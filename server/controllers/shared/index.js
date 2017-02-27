'use strict'

const ObjectId = require('mongodb').ObjectID;

exports.Model = {};

exports.getAll = function(Model, validator) {
  if (validator && !validator(Model)) {
    return this.resp.error("valid error");
  }

  return function* (next) {
    try {
      let data = yield Model.find().exec();
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}

// GET
exports.getOne = function(Model, validator) {
  if (validator && !validator(Model)) {
    return this.resp.error("valid error");
  }

  return function* (next) {
    try {
      let data = yield Model.findOne({ _id: ObjectId(this.params.id) }).exec();
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}

// POST
exports.addOne = function(Model, validator) {
  if (validator && !validator(Model)) {
    return this.resp.error("valid error");
  }

  return function* (next) {
    let req = this.request.body;
    let category = new Model(req.params);

    let error = category.validateSync();
    if (error) {
      return this.resp.error(error.message);
    }

    try {
      let data = yield category.save();
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}

// PUT
exports.updateOne = function(Model, validator) {
  if (validator && !validator(Model)) {
    return this.resp.error("valid error");
  }

  return function* (next) {
    let req = this.request.body;
    try {
      let data = yield Model.findOneAndUpdate(
        { _id: ObjectId(this.params.id) },
        req.params,
        { runValidators: true }
      );
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}

// DELETE
exports.deleteOne = function(Model, validator) {
  if (validator && !validator(Model)) {
    return this.resp.error("valid error");
  }

  return function* (next) {
    try {
      let data =
        yield Model.findOneAndRemove({ _id: ObjectId(this.params.id) });
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}
