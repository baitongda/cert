import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';
import request from 'src/utils/request';

import './styles/index.css';

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

export default class UserOrder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true
    }
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    var id = localStorage.getItem("kzt_id");
    if (!id || id.length < 0) {
      // console.log('openid err');
      this.setState({loading: false});
      alert("OpenId错误，请在微信中打开");
      return;
    }

    request({
      url: '/api/order/' + id,
      type: 'json',
      success: resp => {
        this.setState({
          orders: resp,
          loading: false
        });
      }
    });
  }

  handleItemClick(order) {
    this.context.router.push({
      pathname: "/order",
      state: {
        order: order
      }
    });
  }

  render() {
    let orderList = this.state.orders.map(order => {
      let orderState = ((state) => {
        switch(state) {
          case -1:
            return (<MediaBoxInfoMeta className="color-danger">已超时</MediaBoxInfoMeta>);
            break;
          case 0:
            return (<MediaBoxInfoMeta>待支付</MediaBoxInfoMeta>);
            break;
          case 1:
            return (<MediaBoxInfoMeta className="color-success">已支付</MediaBoxInfoMeta>);
            break;
          default:
            return (<MediaBoxInfoMeta className="color-danger">支付状态异常</MediaBoxInfoMeta>);
        }
      })(order.state);

      return (
        <MediaBox key={order._id} type="text" onClick={() => this.handleItemClick(order)}>
          <MediaBoxTitle>{order.description}</MediaBoxTitle>
          <MediaBoxInfo>
            {orderState}
            <MediaBoxInfoMeta extra>{order.trade_no}</MediaBoxInfoMeta>
          </MediaBoxInfo>
        </MediaBox>
      )
    });

    return (
      <div>
        <Toast icon="loading" show={this.state.loading}>正在加载中...</Toast>
        <CellsTitle>我的订单</CellsTitle>
        <Panel access className="panel-first">
          <PanelHeader>全部</PanelHeader>
          <PanelBody>{orderList}</PanelBody>
          <PanelBody style={{display: orderList.length > 0 ? 'none': null}}>
            <MediaBox>
              <MediaBoxInfo className="userinfo-order-empty">暂无订单</MediaBoxInfo>
            </MediaBox>
          </PanelBody>
        </Panel>
      </div>
    );
  }
}

UserOrder.contextTypes = {
  router: React.PropTypes.object.isRequired
};
