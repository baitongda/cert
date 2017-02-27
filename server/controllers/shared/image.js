var OSS = require('ali-oss');
const OSS_CONFIG = require('../../config').OSS;

var store = new OSS({
  region: OSS_CONFIG.region,
  accessKeyId: OSS_CONFIG.accessKeyId,
  accessKeySecret: OSS_CONFIG.accessKeySecret,
  bucket: OSS_CONFIG.bucket
});

/* [阿里云OSS] */

exports.getImageList = function(entity) {
  return function* (next) {
    var result = yield store.list({
      prefix: `${entity}/${this.params.id}/`,
    });

    if (result && result.res.status == 200) {
      const images = result.objects ? result.objects.map(item => item.name): [];
      return this.resp.send(images);
    } else {
      this.throw(400, '获取图片失败');
    }
  }
}
