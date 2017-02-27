export function getFormatDate(str) {
    let date = new Date(str);
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}

export function getApartDays(str) {
  let now = new Date();
  let date = new Date(str);
  return parseInt((date.getTime() - now.getTime()) / 86400000);
}
