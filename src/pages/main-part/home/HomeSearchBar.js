import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

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

// SearchBar
export default class IndexSearchBar extends Component {

  constructor(props) {
    super(props);
    this.state={
      searchText: '',
      results: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleClickMore = this.handleClickMore.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(text){
    this.props.handleSearchBarChange(text);
    let keywords = [text];
    let results = this.props.certificates.filter(item =>
      item.name.match(RegExp(keywords.join("|"),'i'))
    );

    // if(results.length > 3) results = results.slice(0,3);
    this.setState({
        results,
        searchText: text,
    });
  }

  handleClick(certificate) {
    this.context.router.push({
      pathname: "/detail",
      state: {
        certificate: certificate
      }
    });
  }

  handleClickMore() {
    this.context.router.push({
      pathname: "/certificate",
      state: {
        type: "search",
        key: this.state.searchText
      }
    });
  }

  render() {
    let results = this.state.results;
    if (results.length > 3) {
      results = results.slice(0, 3);
    }
    results = results.map(item =>
      <MediaBox type="text" key={item.name} onClick={() => this.handleClick(item)}>
        <MediaBoxTitle>{item.name}</MediaBoxTitle>
        <MediaBoxInfo>
          <MediaBoxInfoMeta><span className="certificate-price">{item.price}</span> 元起</MediaBoxInfoMeta>
          <MediaBoxInfoMeta extra>
            {item.support}
          </MediaBoxInfoMeta>
        </MediaBoxInfo>
      </MediaBox>
    );

    return (
      <div className="searchbar" title="SearchBar">
        <SearchBar onChange={this.handleChange} />
        <Panel access style={{display: this.state.searchText ? null: 'none', marginTop: 0}}>
          <PanelHeader>搜索</PanelHeader>
          <PanelBody>
            { results.length > 0 ? results : <MediaBox>未找到</MediaBox> }
          </PanelBody>
          <PanelFooter onClick={this.handleClickMore} style={{ display: this.state.results.length > 3 ? null : 'none' }}>
              查看更多
          </PanelFooter>
        </Panel>


      </div>
    );
  }
};

IndexSearchBar.contextTypes = {
  router: React.PropTypes.object.isRequired
};
