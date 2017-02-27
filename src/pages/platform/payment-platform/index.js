import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

import Page from 'src/components/Page';
import { PAY } from '../../config';

import request from 'src/utils/request';
import crypto from 'crypto';

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


export default class PaymentPlatform extends Component {
   constructor(props) {
    super(props);
    this.state = {
      loading: false,
      price: _price,
      card: {},
      payForm: {}
    }
    this.chooseCard = this.chooseCard.bind(this);
    this.handlePayClick = this.handlePayClick.bind(this);
  }

  componentDidMount() {
    this.wxConfig();
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
              this.setState({ loading: false });
              return;
            }

            let choose = cardList[0];
            // 获取卡券信息，验证可用范围
            request({
              url: "/platform/getcard",
              method: "POST",
              data: {
                cardId: choose.card_id,
                prepayId: _prepay_id
              },
              success: resp => {
                // 更新价格
                let price = _price - (resp.reduceCost * 100);
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
                  price: _price,
                  card: {}
                });
              }
            });
          },
          fail: err => {
            console.log("err");
            this.setState({ loading: false });
          },
          cancel: () => {
            this.setState({ loading: false });
          }
        });
      }
    });
  }

  handlePayClick() {

    var id = localStorage.getItem("kzt_id");
    if (!id || id.length < 0) {
      console.log('获取openId失败，请关闭重试');
      return;
    }

    this.setState({ loading: true });
    request({
      url: '/platform/pay/getPayForm',
      type: 'json',
      method: 'post',
      data: {
        prepayId: _prepay_id,
        openId: id,
        cardId: this.state.card.cardId ? this.state.card.cardId: null,
        encryptCode: this.state.card.encryptCode ? this.state.card.encryptCode: null,
      },
      success: resp => {
        this.setState({
          payForm: {
            agencyname: resp.agencyname,
            orderid: resp.orderid,
            timestamp: resp.timestamp,
            sign: resp.sign
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
              <MediaBoxTitle>{_description}</MediaBoxTitle>
              <MediaBoxInfo>
                <MediaBoxInfoMeta><span className="certificate-price">{(_price/100).toFixed(2)}</span> 元</MediaBoxInfoMeta>
              </MediaBoxInfo>
            </MediaBox>
            {cardInfo}
          </PanelBody>
          <PanelFooter onClick={this.chooseCard}>优惠券</PanelFooter>
        </Panel>

        <div className="editor-total-price">合计：<span>{(this.state.price/100).toFixed(2)}</span> 元</div>

        <ButtonArea>
          <Button onClick={this.handlePayClick}>付款</Button>
        </ButtonArea>

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
