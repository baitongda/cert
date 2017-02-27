import React, { Component } from 'react';
import TabBar from '../tabbar';
import WeUI from 'react-weui';
import 'weui';
import UserOrder from './UserOrder';
import { IMG } from '../../config';

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

export default class UserInfo extends Component {

  constructor(props) {
    super(props);
    this.test = this.test.bind(this);
  }

  test() {
    var id = localStorage.getItem("kzt_id");
    var img = localStorage.getItem("kzt_img");
    document.getElementById("openid").value = id ? id : "" ;
    document.getElementById("headimgurl").value = img ? img : "";
    document.getElementById("pay_form").submit();
  }

  render() {

    let headImage = localStorage.getItem("kzt_img");
    let username = localStorage.getItem("kzt_name");

    if (headImage && headImage.length > 0) {
      headImage = headImage.slice(0, -1) + "96";
    } else {
      headImage = IMG.URL + "default.png";
    }

    return (
      <TabBar index={3}>

        <div className="userinfo-container">
          <img
            src={headImage}
            className="userinfo-avatar"
          />
          <p className="userinfo-nickname">{username}</p>
        </div>

        <UserOrder />

        <CellsTitle>其他</CellsTitle>
        <Cells access>
          <Cell href="javascript:;">
            <CellBody>获取优惠</CellBody>
            <CellFooter></CellFooter>
          </Cell>
          <Cell onClick={this.test}>
            <CellBody>新速度测试</CellBody>
            <CellFooter></CellFooter>
          </Cell>
        </Cells>
        <br />
        <form id="pay_form" name="pay_form"
          action="http://yikatong.online.xinsuduedu.com/index.php/clientlogin/get_user_data"
          method="post">
          <input type="hidden" name="openid" id="openid" />
          <input type="hidden" name="headimgurl" id="headimgurl" />
        </form>
      </TabBar>
    );
  }
}

UserInfo.contextTypes = {
  router: React.PropTypes.object.isRequired
};
