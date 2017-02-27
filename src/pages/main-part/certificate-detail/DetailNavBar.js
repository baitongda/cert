import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

const {
  Tab,
  TabBody,
  NavBar,
  NavBarItem,
  Article,
} = WeUI;

export default class DetailNavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tab: 0
    };
  }

  render() {
    return (
    <Tab className="cert-detail-tab">
      <NavBar>
        <NavBarItem active={this.state.tab == 0} onClick={e=>this.setState({tab:0})}>考试简介</NavBarItem>
      <NavBarItem active={this.state.tab == 1} onClick={e=>this.setState({tab:1})}>课程信息</NavBarItem>
        <NavBarItem active={this.state.tab == 2} onClick={e=>this.setState({tab:2})}>机构信息</NavBarItem>
      </NavBar>
      <TabBody>
        <Article
          style={{display: this.state.tab == 0 ? null : 'none'}}
          dangerouslySetInnerHTML={ {__html: this.props.intro} }>
        </Article>
        <Article
          style={{display: this.state.tab == 1 ? null : 'none'}}
          dangerouslySetInnerHTML={ {__html: this.props.enterInfo} }>
        </Article>
        <Article
          style={{display: this.state.tab == 2 ? null : 'none'}}
          dangerouslySetInnerHTML={ {__html: this.props.institutionInfo} }>
        </Article>
      </TabBody>
    </Tab>
    );
  }
};
