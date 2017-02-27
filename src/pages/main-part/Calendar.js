import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';
import TabBar from './tabbar'
import request from 'src/utils/request';

const {
  Panel,
  PanelHeader,
  PanelBody,
  PanelFooter,
  MediaBox,
  MediaBoxHeader,
  MediaBoxBody,
  MediaBoxTitle,
  MediaBoxInfo,
  MediaBoxInfoMeta,
  MediaBoxDescription,
  CellFooter,
  Toast
} = WeUI;

export default class Calendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      calendars: []
    };
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  componentDidMount() {
    this.getData();
  }


  getData() {
    // 获取热门列表
    request({
      url: '/api/calendar',
      success: resp => {
        this.setState({
          loading: false,
          calendars: resp
        });
      }
    });
  }

  handleItemClick(certificate) {
    this.context.router.push({
      pathname: "/detail",
      state: {
        certificate: certificate
      }
    });
  }

  certificateFilter(calendars) {
    let res = [];
    this.props.certificates.forEach(certificate => {
      calendars.forEach(certId => {
        if (certificate._id === certId) {
          // certificate.examDate = new Date(certificate.examDate);
          res.push(certificate);
        }
      });
    });
    return res;
  }

  render() {
    let certificates = this.certificateFilter(this.state.calendars).map(certificate =>
      <MediaBox type="text" key={certificate._id} onClick={() => this.handleItemClick(certificate)}>
        <MediaBoxTitle>{certificate.name}</MediaBoxTitle>
        <MediaBoxDescription>
          报名时间：{certificate.registerDate} <br />
          考试时间：{certificate.examDate.substr(0,10)}
        </MediaBoxDescription>
        <MediaBoxInfo>
          <MediaBoxInfoMeta extra>点击查看</MediaBoxInfoMeta>
        </MediaBoxInfo>
        <CellFooter/>
      </MediaBox>
    );

    return (
      <TabBar index={1}>
        <Toast icon="loading" show={this.state.loading}>正在加载中...</Toast>
        <Panel className="panel-first">
          <PanelHeader>近期考试</PanelHeader>
          <PanelBody>{certificates}</PanelBody>
        </Panel>
      </TabBar>
    );
  }
};

Calendar.contextTypes = {
  router: React.PropTypes.object.isRequired
};
