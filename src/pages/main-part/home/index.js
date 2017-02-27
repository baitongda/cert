import React, { Component } from 'react';
import ReactMCarousel from 'react-m-carousel'
import WeUI from 'react-weui';
import 'weui';
import TabBar from '../tabbar';
import CategoryBox from './CategoryBox';
import HomeSearchBar from './HomeSearchBar';
import HotList from './HotList';


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
  SearchBar
} = WeUI;

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchBarChange: false
    };
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
  }

  handleSearchBarChange(text) {
    this.setState({
      searchBarChange: text
    });
  }

  render() {
    return (
      <TabBar index={2}>
        <HomeSearchBar handleSearchBarChange={this.handleSearchBarChange} certificates={this.props.certificates} />
        <div style={{lineHeight: 0}}>
          <ReactMCarousel loop={true} auto={4000} indicators={true}>
            <img
              src="images/main.png"
              style={{ width: '100%' }}
            />
            <img
              src="images/main.png"
              style={{ width: '100%' }}
            />
          </ReactMCarousel>
        </div>
        <Panel className="panel-first"
          style={{display: this.state.searchBarChange ? 'none': null }}
        >
          <CategoryBox categorys={this.props.categorys} certificates={this.props.certificates} />
        </Panel>
        <HotList certificates={this.props.certificates} />
      </TabBar>
    );
  }
}

Home.contextTypes = {
  router: React.PropTypes.object.isRequired
};
