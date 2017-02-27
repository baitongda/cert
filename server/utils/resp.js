'use strict'

module.exports = function* (next) {
  this.resp = {
    send: (data) => {
      this.body = {
        code: 0,
        data
      }
    },
    error: (error, errcode = 1) => {
      this.body = {
        code: errcode,
        data: error
      }
    }
  }
  yield next;
}
