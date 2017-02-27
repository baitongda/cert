import React from 'react';
import WeUI from 'react-weui';
import 'weui';

import Page from 'src/components/Page';

const { ButtonArea,
    Button,
    Msg
} = WeUI;

export default class Message extends React.Component {

  constructor(props) {
    super(props);
    if (this.props.location.state && this.props.location.state.type) {
      this.state = {
        buttons: [{
          type: 'default',
          label: '确定',
          onClick: () => this.context.router.push('/info')
        }]
      };
    } else {
      this.state = {
        buttons: [{
          type: 'primary',
          label: '确定',
          onClick: () => this.context.router.push('/info')
        }]
      };
    }
  }

  render() {

    let title = "", description = "", type = "success";

    if (this.props.location.state !== null) {
      title = this.props.location.state.title;
      description = this.props.location.state.description;
      if (this.props.location.state.type) {
        type = this.props.location.state.type;
      }
    }

    return (
      <Page spacing>
        <Msg type={type} title={title} description={description} buttons={this.state.buttons} extraText="联系我们" extraHref="#"/>
      </Page>
      );
  }
};


Message.contextTypes = {
  router: React.PropTypes.object.isRequired
};
