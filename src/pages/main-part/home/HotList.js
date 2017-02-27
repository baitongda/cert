import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';
import request from 'src/utils/request';
import { getFormatDate } from 'src/utils/date';

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
  Icon
} = WeUI;

export default class HotList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hots: [],
      count: '...'
    }
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleAllClick = this.handleAllClick.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    // 获取热门列表
    request({
      url: '/api/hot',
      success: resp => {
        this.setState({ hots: resp });
      }
    });

    // 获取总订单数
    request({
      url: '/api/order',
      success: resp => {
        this.setState({ count: resp });
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

  handleAllClick() {
    this.context.router.push('/certificate');
  }

  certificateFilter(hots) {
    let res = [];
    this.props.certificates.forEach(certificate => {
      hots.forEach(certId => {
        if (certificate._id === certId) {
          // certificate.examDate = new Date(certificate.examDate);
          res.push(certificate);
        }
      });
    });
    return res;
  }

  render() {

    let certificates = this.certificateFilter(this.state.hots).map(certificate =>
      <MediaBox type="text" key={certificate._id} onClick={() => this.handleItemClick(certificate)}>
        <MediaBoxTitle>{certificate.name}</MediaBoxTitle>
        <MediaBoxInfo>
          <MediaBoxInfoMeta>
            考试日期 {getFormatDate(certificate.examDate)}
          </MediaBoxInfoMeta>
        </MediaBoxInfo>
      </MediaBox>
    );

    return (
      <div>
        <Panel access>
          <PanelHeader>热门考试</PanelHeader>
          <PanelBody>{certificates}</PanelBody>
          <PanelFooter onClick={this.handleAllClick}>全部考试</PanelFooter>
        </Panel>

        <Panel>
          <PanelBody>
            <MediaBox className="people-media-box">
              <MediaBoxDescription>
                已有
                <span className="certificate-price"> {this.state.count} </span>
                人通过考证通报名
              </MediaBoxDescription>
            </MediaBox>
          </PanelBody>
        </Panel>
      </div>
    );
  }
}

HotList.contextTypes = {
  router: React.PropTypes.object.isRequired
};
