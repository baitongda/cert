import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import WeUI from 'react-weui';
import 'weui';

import 'src/styles/app.css';
import 'src/styles/page.less';
import 'src/styles/indicators.css';
import 'src/styles/carousel.less';

import { getQuery } from 'src/utils/url'
import requset from 'src/utils/request';

const {
  Toast
} = WeUI;


export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      certificates: [],
      categorys: []
    }
  }

  // 加载loading (微信端无效)
  // componentWillMount() {
  //   let loading = document.getElementById("site-loading");
  //   loading && loading.parentNode.removeChild(loading);
  // }

  componentDidMount() {
    this.loadData();
  }

  // 获取openID
  getOpenId() {
    // 判断localStorage中是否存在OpenId
    var id = localStorage.getItem("kzt_id");

    if (id && id.length > 0) return null;

    // 获取OpenId
    var code = getQuery("code");
    if (!code) {
      // *************** TEST ****************
      // localStorage.setItem("kzt_id", "test_open_id");
      // *************** TEST ****************
      return null;
    }

    return (requset({
        method: 'post',
        url: '/api/wechat/userinfo',
        type: 'json',
        data: {code},
        success: resp => {
          localStorage.setItem("kzt_id", resp.openid);
          localStorage.setItem("kzt_img", resp.image);
          localStorage.setItem("kzt_name", resp.name);
          return resp.openid;
        }
      })
    );
  }

  // 获取数据，包括openID，certificate和category
  // Promise.all 等待全部请求
  loadData() {

    let promiseList = [];

    promiseList.push(requset({
        url: '/api/category',
        success: resp => resp
      })
    )

    promiseList.push(requset({
        url: '/api/certificate',
        success: resp => resp
      })
    )

    // OpenID
    let p = this.getOpenId();
    if (p) {
      promiseList.push(p);
    }

    // 全部请求结束
    Promise.all(promiseList).then((data) => {
      let categorys = data[0] ? data[0] : [];
      let certificates = data[1] ? data[1] : [];

      this.setState({
        loading: false,
        categorys,
        certificates
      });
    });
  }

  render() {
    return (
        <div className="container">
          <Toast icon="loading" show={this.state.loading}>正在加载中...</Toast>

          {this.props.children && React.cloneElement(this.props.children, {
            certificates: this.state.certificates,
            categorys: this.state.categorys,
            key: this.props.location.pathname
          })}

      </div>
    );
  }
}

// <ReactCSSTransitionGroup
//   component="div"
//   transitionName="page"
//   transitionEnterTimeout={500}
//   transitionLeaveTimeout={500}
//   style={{height: '100%'}}
// >
// </ReactCSSTransitionGroup>
