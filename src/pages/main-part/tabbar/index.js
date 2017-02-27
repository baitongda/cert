import React, { Component } from 'react';

import Icon1 from './images/icon_nav_icons.png';
import Icon2 from './images/icon_nav_search_bar.png';
import Icon3 from './images/icon_nav_action_sheet.png';

import './styles/tabbar.css';

export default class TabBar extends Component {

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(index) {
    if (this.props.index == index) return;
    switch(index) {
      case 1:
        this.context.router.push("/calendar");
        break;
      case 2:
        this.context.router.push("/");
        break;
      case 3:
        this.context.router.push("/info");
        break;
    }
  }

  render() {

    const commonName = "tabbar-item";
    const activeName = "tabbar-item tabbar-item-on";

    return (
      <div className="tab">
        <div className="tab-bd">
          {this.props.children}
        </div>
        <div className="tabbar">
          <div className={this.props.index === 1 ? activeName : commonName}
            onClick={() => this.handleClick(1)}>
            <div className="tabbar-item-icon">
              <img src={Icon1}/>
            </div>
            <p className="tabbar-item-label">考试日历</p>
          </div>
          <div className={this.props.index === 2 ? activeName : commonName}
            onClick={() => this.handleClick(2)}>
            <div className="tabbar-item-icon">
              <img src={Icon2}/>
            </div>
            <p className="tabbar-item-label">报名考试</p>
          </div>
          <div className={this.props.index === 3 ? activeName : commonName}
            onClick={() => this.handleClick(3)}>
            <div className="tabbar-item-icon">
              <img src={Icon3}/>
            </div>
            <p className="tabbar-item-label">我的</p>
          </div>
        </div>
      </div>
    );
  }
}

TabBar.contextTypes = {
  router: React.PropTypes.object.isRequired
};
