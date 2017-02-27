import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

import Page from 'src/components/Page';
import { PAY } from '../../config';

import request from 'src/utils/request';
import crypto from 'crypto';

import UserInfoForm from './UserInfoForm';
import './styles/index.css';

const {
  ButtonArea,
  Button,
  Cells,
  CellsTitle,
  Toast,
  MediaBox,
  MediaBoxHeader,
  MediaBoxBody,
  MediaBoxTitle,
  MediaBoxInfo,
  MediaBoxInfoMeta,
  PanelHeader,
  PanelBody,
  PanelFooter,
  Panel
} = WeUI;

// props: certificate {
//   ...certificate,
//   institutionName,
//   userInfoFields,
//   selectedKind
// }

export default class OrderEditer extends Component {
   constructor(props) {
    super(props);
    this.state = {
      loading: false,
      // loading: true,
      formData: {},
      userInfoFields: [],
      price: this.props.location.state.certificate.selectedKind.price,
      card: {},

      payForm: {}
    }
    this.chooseCard = this.chooseCard.bind(this);
    this.handlePayClick = this.handlePayClick.bind(this);
    this.handleFormData = this.handleFormData.bind(this);
  }

  componentDidMount() {
    this.wxConfig();
    this.getData();
  }

  // 获取报名信息项
  getData() {
    this.setState({ loading: true });
    request({
      url: "api/userinfo-field",
      method: "POST",
      data: {
        userInfoFields: this.props.location.state.certificate.userInfoFields,
      },
      success: (resp) => {
        this.setState({
          loading: false,
          userInfoFields: resp
        })
      },
      error: (err) => this.setState({ loading: false })
    });
  }

  // 微信JS-SKD Config
  wxConfig() {
    request({
      url: '/api/wechat/sign',
      type: 'json',
      method: 'post',
      data: { url: location.href.split('#')[0] },
      success: resp => {

        wx.config({
          debug: false,
          appId: resp.appId,
          timestamp: resp.timestamp,
          nonceStr: resp.nonceStr,
          signature: resp.signature,
          jsApiList: ["chooseCard"]
        });

        wx.ready(() => {
          this.setState({ loading: false });
        });

        wx.error((res) => {
          alert("卡券初始化失败");
          this.setState({ loading: false });
        })
      },
      error: err => this.setState({ loading: false })
    });
  }

  // 选择卡券
  chooseCard() {
    this.setState({ loading: true });
    request({
      url: '/api/wechat/card-sign',
      success: resp => {
        this.setState({ loading: false });
        wx.chooseCard({
          // cardType: resp.card_type, // 卡券类型
          timestamp: resp.time_stamp, // 卡券签名时间戳
          nonceStr: resp.nonce_str, // 卡券签名随机串
          signType: 'SHA1', // 签名方式，默认'SHA1'
          cardSign: resp.signature, // 卡券签名
          success: res => {
            // 用户选中的卡券列表信息
            let cardList = JSON.parse(res.cardList);
            if (!cardList || cardList.length <= 0) {
              return;
            }

            // 获取卡券信息，验证可用范围
            let choose = cardList[0];
            this.setState({ loading: true });
            request({
              url: "api/card/get",
              method: "POST",
              data: {
                cardId: choose.card_id,
                certId: this.props.location.state.certificate._id
              },
              success: resp => {
                // 更新价格
                let price = this.props.location.state.certificate.selectedKind.price - resp.reduceCost;
                if (price < 0) price = 0;
                // 更新卡券信息
                this.setState({
                  price,
                  loading: false,
                  card: {
                    cardId: choose.card_id,
                    encryptCode: choose.encrypt_code,
                    title: resp.title,
                    reduceCost: resp.reduceCost
                  }
                });
              },
              error: err => {
                this.setState({
                  loading: false,
                  price: this.props.location.state.certificate.selectedKind.price,
                  card: {}
                });
              }
            });
          },
          fail: err => {
            console.log(err);
          }
        });
      }
    });
  }

  // 支付签名
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

  handleFormData(formData) {
    // console.log(formData);
    this.setState({formData});
  }

  handlePayClick() {

    var id = localStorage.getItem("kzt_id");
    if (!id || id.length < 0) {
      console.log('获取openId失败，请关闭重试');
      return;
    }

    if (!this.state.formData.name ||
        this.state.formData.name.length < 1 ||
        !this.state.formData.phone ||
        this.state.formData.phone.length < 1) {
      alert("信息项不可为空");
      return;
    }

    if (!this.state.formData.verCode || this.state.formData.verCode.length < 1) {
      alert("验证码不可为空");
      return;
    }

    let userInfo = {}, empty = false;
    this.props.location.state.certificate.userInfoFields.forEach(item => {
      userInfo[item] = this.state.formData[item];
      if (!userInfo[item] || userInfo[item].length < 0) {
        alert("信息项不可为空");
        empty = true;
        return;
      }
    });

    // 存在信息项为空
    if (empty) return;

    this.setState({ loading: true });
    request({
      url: '/api/pay',
      type: 'json',
      method: 'post',
      data: {
        name: this.state.formData.name,
        phone: this.state.formData.phone,
        verCode: this.state.formData.verCode,
        userInfo,
        openId: id,
        certId: this.props.location.state.certificate._id,
        kindId: this.props.location.state.certificate.selectedKind.id,
        cardId: this.state.card.cardId ? this.state.card.cardId: null,
        encryptCode: this.state.card.encryptCode ? this.state.card.encryptCode: null
      },
      success: resp => {
        let data = {
          agencyname: PAY.AGENCY_NAME,
          orderid: resp.orderId,
          timestamp: (new Date().getTime()).toString().substr(0, 10)
        }

        // console.log(data);
        this.setState({
          payForm: {
            ...data,
            sign: this.getSign(data, PAY.KEY)
          }
        }, () => {
          document.getElementById("pay_form").submit()
        });

      },
      error: err => {
        this.setState({ loading: false });
      }
    });
  }

  render() {

    let certificate = {};
    if (this.props.location.state !== null) {
      certificate = this.props.location.state.certificate;
    }

    // 优惠券使用信息
    let cardInfo = this.state.card.cardId ? (
      <MediaBox type="text" className="editor-card-box">
        <MediaBoxTitle className="editor-card-title">{this.state.card.title}</MediaBoxTitle>
        <MediaBoxInfo>
          <MediaBoxInfoMeta>立减 <span className="certificate-price">{this.state.card.reduceCost}</span> 元</MediaBoxInfoMeta>
          <MediaBoxInfoMeta extra>优惠券</MediaBoxInfoMeta>
        </MediaBoxInfo>
      </MediaBox>
    ) : null

    return (
      <Page>
        <Toast icon="loading" show={this.state.loading}>正在加载中...</Toast>

        <Panel access className="panel-first">
          <PanelHeader>订单</PanelHeader>
          <PanelBody>
            <MediaBox type="text">
              <MediaBoxTitle>{`${certificate.name}（${certificate.selectedKind.name}）`}</MediaBoxTitle>
              <MediaBoxInfo>
                <MediaBoxInfoMeta><span className="certificate-price">{certificate.selectedKind.price}</span> 元</MediaBoxInfoMeta>
                <MediaBoxInfoMeta extra>{certificate.institutionName}</MediaBoxInfoMeta>
              </MediaBoxInfo>
            </MediaBox>
            {cardInfo}
          </PanelBody>
          <PanelFooter onClick={this.chooseCard}>优惠券</PanelFooter>
        </Panel>

        <CellsTitle>报名信息</CellsTitle>
        <UserInfoForm
          fields={this.state.userInfoFields}
          handleFormData={this.handleFormData}
        />

      <div className="editor-total-price">合计：<span>{ parseFloat(this.state.price).toFixed(2)}</span> 元</div>

        <ButtonArea>
          <Button onClick={this.handlePayClick}>付款</Button>
        </ButtonArea>

        <CellsTitle style={{textAlign: 'center'}}>报名完成后工作人员会尽快与您取得联系</CellsTitle>

        <form id="pay_form" name="pay_form"
          action="http://120.236.138.221:7752/paymentToCode/payment_payorderid.action"
          method="post">
          <input type="hidden" name="agencyname" id="agencyname" value={this.state.payForm.agencyname} />
          <input type="hidden" name="orderid" id="orderid" value={this.state.payForm.orderid} />
          <input type="hidden" name="timestamp" id="timestamp" value={this.state.payForm.timestamp} />
          <input type="hidden" name="sign" id="sign" value={this.state.payForm.sign} />
        </form>
      </Page>
    );
  }
}

OrderEditer.contextTypes = {
  router: React.PropTypes.object.isRequired
};


// 微信支付
// request({
//   url: '/api/wechat/unifiedorder',
//   type: 'json',
//   method: 'post',
//   data: {
//     openId: id,
//     name: this.state.name,
//     phone: this.state.phone,
//     certId: this.props.location.state.certificate._id
//   },
//   success: resp => {
//     this.setState({loading: false});
//     wx.chooseWXPay({
//       timestamp: resp.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
//       nonceStr: resp.nonceStr, // 支付签名随机串，不长于 32 位
//       package: resp.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
//       signType: resp.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
//       paySign: resp.paySign, // 支付签名
//       success: (res) => {
//         this.context.router.push({
//           pathname: "/msg",
//           state: {
//             title: "支付成功",
//             description: "工作人员将尽快与您取得联系"
//           }
//         });
//       },
//       cancel: (res) => {
//         this.context.router.push({
//           pathname: "/msg",
//           state: {
//             title: "支付失败",
//             description: "可在订单详情中稍后选择支付",
//             type: "warn"
//           }
//         });
//       }
//     });
//   }
// });
