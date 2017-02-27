export function getQuery(key) {
  var reg = new RegExp("(^|&|\\?)"+ key +"=([^&]*)(&|$)");
  var res = decodeURI(window.location.href).match(reg);
  if (res != null) return unescape(res[2]);
  return null;
}
