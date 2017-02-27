'use strict'

const parseString = require('xml2js').parseString;
const crypto = require('crypto');

exports.strcat = function (obj) {
  let first = true;
  let str = "";
  for (let key in obj) {
    if (first) first = false;
    else str += "&";
    str += `${key}=${obj[key]}`;
  }
  return str;
}

exports.xml2js = function(xml) {
  return new Promise(function(resolve, reject) {
    parseString(xml, {
      trim: true,
      explicitArray: false
    }, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

exports.getFormatDate = function() {
    let date = new Date();
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }
    return year + month + day;
}


exports.getFormatTime = function() {
    let date  = new Date();
    let year  = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day   = date.getDate().toString();
    let hour  = date.getHours().toString();
    let min   = date.getMinutes().toString();
    let sec   = date.getSeconds().toString();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }

    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }

    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }

    if (min >= 0 && min <= 9) {
        min = "0" + min;
    }

    if (sec >= 0 && sec <= 9) {
        sec = "0" + sec;
    }
    return year + month + day + hour + min + sec;
}


exports.getMD5Sign = function (data, key) {
  let sign = "";
  let first = true;
  for (let k in data) {
    // 分割标记
    if (first) first = false;
    else sign += "&";

    sign += `${k}=${data[k]}`;
  }
  // 添加key
  sign += key;
  // console.log(sign);
  let md5Code = crypto.createHash("md5");
  return md5Code.update(sign, 'utf-8').digest("hex");
}
