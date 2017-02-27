import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

import request from 'src/utils/request';
import { getFormatDate, getApartDays } from 'src/utils/date';

import Page from 'src/components/Page';
import DetailNavBar from './DetailNavBar';
import SelectBox from './SelectBox';

import ReactMCarousel from 'react-m-carousel';
import { IMG } from "../../config";

const {
  Panel,
  PanelBody,
  MediaBox,
  MediaBoxHeader,
  MediaBoxBody,
  MediaBoxTitle,
  MediaBoxInfo,
  MediaBoxInfoMeta,
  Tab,
  TabBody,
  NavBar,
  NavBarItem,
  Article,
  Button,
  Toast
} = WeUI;

export default class CertificateDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      loading: true,
      detail: {},
      institution: {},
      kinds: [],
      selected: null,
    }
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    request({
      url: '/api/certificate/image/' + this.props.location.state.certificate._id,
      type: 'json',
      success: resp => {
        this.setState({ images: resp });
      }
    });

    // 证书详情数据，包括证书简介和包括相关信息
    let p1 = request({
      url: '/api/detail/' + this.props.location.state.certificate.detailId,
      type: 'json',
      success: resp => resp
    });

    // 获取教育机构信息
    let p2 = request({
      url: '/api/institution/' + this.props.location.state.certificate.institutionId,
      type: 'json',
      success: resp => resp
    });

    Promise.all([p1, p2]).then(data => {
      let detail = data[0] ? data[0] : {};
      let institution = data[1] ? data[1] : {};
      this.setState({
        loading: false,
        kinds: detail.kinds ? detail.kinds : [],
        detail,
        institution
      });
    });
  }

  handleClick() {

    if (!this.state.selected) return;

    let certificate = Object.assign(
      {institutionName: this.state.institution.name},
      {userInfoFields: this.state.detail.userInfoFields},
      {selectedKind: this.state.selected},
      this.props.location.state.certificate
    );

    this.context.router.push({
      pathname: "/edit",
      state: { certificate }
    });
  }

  render() {

    let certificate = {};
    if (this.props.location.state !== null) {
      certificate = this.props.location.state.certificate;
    }

    // 价格显示
    let price = this.state.selected ? parseFloat(this.state.selected.price).toFixed(2) : null;

    // 顶栏倒计时
    // -------------------------------------------------------
    let year = (new Date(certificate.examDate)).getFullYear();
    let apart = getApartDays(certificate.examDate);

    let msg = null;
    if (apart >= 0) {
      msg = (
        <MediaBoxHeader className="certificate-day">
          距 {year} 年考试还有 <span> {apart} </span> 天
        </MediaBoxHeader>
      )
    } else {
      msg = (
        <MediaBoxHeader className="certificate-day">
          {year} 年考试 <span> 已结束 </span>
        </MediaBoxHeader>
      )
    }

    // -------------------------------------------------------
    // 轮播图
    const images = this.state.images.map(image => (
      <img
        src={IMG.URL + image + IMG.STYLE}
        style={{ width: '100%' }}
      />
    ))
    // -------------------------------------------------------

    return (
      <Page>
        <Toast icon="loading" show={this.state.loading}>正在加载中...</Toast>
        <Panel className="panel-first">
          <PanelBody>
            { /* 倒计时 */ }
            <MediaBox className="certificate-day-media-box">
              {msg}
            </MediaBox>
            { /* 图片 - Carousel */ }
            <div style={{lineHeight: 0}}>
              <ReactMCarousel loop={true} auto={0} indicators={true} responsive={100}>
                {images}
              </ReactMCarousel>
            </div>
            { /* 商品信息 */ }
            <MediaBox type="text">
              <MediaBoxHeader className="cert-detail-info">
                {certificate.name}
                <span>{this.state.institution.name}</span>
              </MediaBoxHeader>
              <p
                className="cert-detail-price"
                style={{display: this.state.selected ? null : 'none'}}
              >￥<span>{price}</span></p>
              <p
                className="cert-detail-price"
                style={{display: this.state.selected ? 'none': null}}
              >暂无该考试相关课程</p>
              { /* 种类选择框 */ }
              <SelectBox
                kinds={this.state.kinds}
                select={(selected) => { this.setState({ selected }) }}
                selected={this.state.selected ? this.state.selected : {}}
              />
            </MediaBox>
          </PanelBody>
        </Panel>

        <DetailNavBar
          intro={this.state.detail.intro}
          enterInfo={this.state.detail.enterInfo}
          institutionInfo={this.state.institution.info}
        />

      <div
        className={this.state.selected ? "cert-detail-btn btn-active": "cert-detail-btn"}
        onClick={this.handleClick}
      >{(this.state.kinds && this.state.kinds.length > 0) ? "立即报名": "暂无课程"}</div>

      </Page>
    );
  }
};

CertificateDetail.contextTypes = {
  router: React.PropTypes.object.isRequired
};
