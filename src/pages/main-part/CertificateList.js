import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

import Page from 'src/components/Page';
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
  Icon
} = WeUI;

export default class CertificateList extends Component {

  certificateFilter(type, key) {
    let certificates = this.props.certificates;
    if (!type) {
      return certificates;
    }
    // search
    if (type === 'search') {
      return certificates.filter(item =>
        item.name.match(RegExp([key].join("|"),'i'))
      );
    }
    // category
    if (type === 'category') {
      let results = [];
        certificates.forEach((certificate) => {
        if (certificate.category === key) {
          results.push(certificate);
        }
      });
      return results;
    }
    return [];
  }


  handleClick(certificate) {
    this.context.router.push({
      pathname: "/detail",
      state: {
        certificate: certificate
      }
    });
  }

  render() {
    let type = null, key = null;
    if (this.props.location.state !== null) {
      type = this.props.location.state.type;
      key  = this.props.location.state.key;
    }

    let certificates = this.certificateFilter(type, key).map(certificate =>
      <MediaBox type="text" key={certificate._id} onClick={() => this.handleClick(certificate)}>
        <MediaBoxTitle>{certificate.name}</MediaBoxTitle>
        <MediaBoxInfo>
          <MediaBoxInfoMeta>
            考试日期 {getFormatDate(certificate.examDate)}
          </MediaBoxInfoMeta>
        </MediaBoxInfo>
      </MediaBox>
    );

    if (type === 'category') {
      this.props.categorys.forEach((category) => {
        if (category._id === key) {
          key = category.name;
        }
      });
    }

    return (
      <Page>
        <Panel className="panel-top">
          <PanelHeader>{key ? key: '全部'}</PanelHeader>
          <PanelBody>{certificates}</PanelBody>
        </Panel>
      </Page>
    );
  }
}

CertificateList.contextTypes = {
  router: React.PropTypes.object.isRequired
};
