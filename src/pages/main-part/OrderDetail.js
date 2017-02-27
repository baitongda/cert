import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

import Page from 'src/components/Page';

import crypto from 'crypto';
import { PAY } from '../config';

const {
  ButtonArea,
  Button,
  Cells,
  CellsTitle,
  CellsTips,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Panel,
  PanelHeader,
  PanelBody,
  MediaBox,
  MediaBoxTitle,
  MediaBoxDescription,
  PanelFooter,
  Toast,
  MediaBoxInfo,
  MediaBoxInfoMeta
} = WeUI;

export default class OrderDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      form: {}
    };
    this.handlePayClick = this.handlePayClick.bind(this);
  }

  getSign(data, key) {
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

  handlePayClick() {
    this.setState({loading: true});

    let order = {};
    if (this.props.location.state !== null) {
      order = this.props.location.state.order;
    } else {
      alert("获取订单信息错误");
      return;
    }

    let data = {
      agencyname: PAY.AGENCY_NAME,
      orderid: order.orderId,
      timestamp: (new Date().getTime()).toString().substr(0, 10)
    }

    // console.log(data);

    this.setState({
      form: {
        ...data,
        sign: this.getSign(data, PAY.KEY)
      }
    }, function() {
      document.getElementById("pay_form").submit()
    });
  }

  render() {
    let order = {};
    if (this.props.location.state !== null) {
      order = this.props.location.state.order;
      if (!order) order = {};
    }

    return (
      <Page>
        <Toast icon="loading" show={this.state.loading}>正在跳转至收银台</Toast>
        <CellsTitle>订单详情</CellsTitle>
        <Panel>
          <PanelHeader>订单号: {order.trade_no}</PanelHeader>
          <PanelHeader>支付流水号: {order.orderId}</PanelHeader>
          <PanelBody>
            <MediaBox type="text">
              <MediaBoxTitle>{order.description}</MediaBoxTitle>
              <MediaBoxInfo>
                <MediaBoxInfoMeta><span className="certificate-price">{order.price.toFixed(2)}</span> 元</MediaBoxInfoMeta>
                <MediaBoxInfoMeta>{order.state == 1 ? "已支付": "未支付"}</MediaBoxInfoMeta>
              </MediaBoxInfo>
            </MediaBox>
          </PanelBody>
        </Panel>
        <Cells>
          <Cell>
            <CellBody>
              姓名
            </CellBody>
            <CellFooter>{order.name}</CellFooter>
          </Cell>
          <Cell>
            <CellBody>
              联系电话
            </CellBody>
            <CellFooter>{order.phone}</CellFooter>
          </Cell>
        </Cells>
        <br />
        <ButtonArea>
          <Button
            style={{ display: order.state === 0 ? null: 'none' }}
            onClick={this.handlePayClick}
          >付款</Button>
        </ButtonArea>
        <form id="pay_form" name="pay_form"
          action="http://120.236.138.221:7752/paymentToCode/payment_payorderid.action"
          method="post">
          <input type="hidden" name="agencyname" id="agencyname" value={this.state.form.agencyname} />
          <input type="hidden" name="orderid" id="orderid" value={this.state.form.orderid} />
          <input type="hidden" name="timestamp" id="timestamp" value={this.state.form.timestamp} />
          <input type="hidden" name="sign" id="sign" value={this.state.form.sign} />
        </form>
      </Page>
    );
  }
}

OrderDetail.contextTypes = {
  router: React.PropTypes.object.isRequired
};


//   reqwest({
//     url: '/api/wechat/sign',
//     type: 'json',
//     method: 'post',
//     data: { url: window.location.search },
//     error: err => {
//       // console.log(err);
//       alert("网络错误");
//     },
//     success: resp => {
//       this.setState({loading: false});
//       wx.config({
//         debug: false,
//         appId: resp.appId,
//         timestamp: resp.timestamp,
//         nonceStr: resp.nonceStr,
//         signature: resp.signature,
//         jsApiList: ["chooseWXPay"]
//       });
//     }
//   });
//
//   wx.ready(() => {
//     this.setState({loading: true});
//     reqwest({
//       url: '/api/wechat/unifiedorder',
//       type: 'json',
//       method: 'post',
//       data: {
//         orderId: this.props.location.state.order._id,
//       },
//       error: err => {
//         // console.log(err);
//         alert("网络错误");
//       },
//       success: resp => {
//         this.setState({loading: false});
//         wx.chooseWXPay({
//           timestamp: resp.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
//           nonceStr: resp.nonceStr, // 支付签名随机串，不长于 32 位
//           package: resp.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
//           signType: resp.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
//           paySign: resp.paySign, // 支付签名
//           success: (res) => {
//             this.context.router.push({
//               pathname: "/msg",
//               state: {
//                 title: "支付成功",
//                 description: "工作人员将尽快与您取得联系"
//               }
//             });
//           },
//           cancel: (res) => {
//             this.context.router.push({
//               pathname: "/msg",
//               state: {
//                 title: "支付失败",
//                 description: "可在订单详情中稍后选择支付",
//                 type: "warn"
//               }
//             });
//           }
//         });
//       }
//     });
//   });
