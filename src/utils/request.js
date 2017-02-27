import reqwest from 'reqwest';
import { browserHistory } from 'react-router';

// 包装reqwest，promise化并处理错误情况
export default (options) => {
  // let token = localStorage.JWT_TOKEN;
  // if (!token) {
  //   browserHistory.push('/login');
  // }
  //
  // options.headers = {
  //   'Authorization': 'Bearer ' + token
  // }

  // 成功请求
  let succFunc = options.success;
  if (options.success) {
    delete options.success;
  }

  // 失败请求
  let errorFunc = options.error;
  if (options.error) {
    delete options.error;
  }

  // promise化
  return (
    reqwest(options)
    .then(resp => {
      if (resp.code != 0) {
        console.log(resp);
        alert(resp.data);
        if (errorFunc) return errorFunc(resp.data);
        return null;
      }
      resp = resp.data;
      if (succFunc) return succFunc(resp);
    })
    .fail(err => {
      console.log(err);
      alert(`网络错误：${err.status} ${err.statusText}`);
      if (errorFunc) return errorFunc(err);
    })
  );
};
