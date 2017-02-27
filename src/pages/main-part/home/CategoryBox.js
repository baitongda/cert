import React, { Component } from 'react';

import './styles/category.css';

import { IMG } from "../../config";

import CategoryBoxSelector from './CategoryBoxSelector';

export default class CategoryBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      categoryId: null,
      index: -1
    }
    this.handleClick = this.handleClick.bind(this);
  }

  // 分类项点击事件
  handleClick(category, index) {
    // 类别未加载
    if (!category) return;

    if (this.state.index === index) {
      this.setState({categoryId: null, index: -1});
      return;
    }

    this.setState({categoryId: category._id, index: index});
  }

  certificateFilter(id) {
    if (id == null) return [];

    let results = [];
      this.props.certificates.forEach((certificate) => {

      if (certificate.categoryId === id) {
        results.push(certificate);
      }
    });
    return results;
  }

  render() {

    let categorys = [], row = [];

    // 分组格式，每四个一组
    // <div class="row">
    //   <item /> * 4
    // </div>
    // <CategoryBoxSelector />
    this.props.categorys.forEach((category, index) => {

      // 插入row
      if (index > 0 && index % 4 == 0) {
        categorys.push(
          <div className="row" key={"row" + index}>
            {row}
          </div>
        );
        // 插入Selector
        categorys.push(
          <CategoryBoxSelector
            key={"selector" + index}
            index={this.state.index}
            certificates={ (this.state.index >= index - 4 && this.state.index < index) ?
              this.certificateFilter(this.state.categoryId) : []
            }
          />
        )
        row = [];
      }

      row.push(
        <div className={"box" + (this.state.index == index ? " active-box" : "")} key={index} onClick={() => this.handleClick(category, index)}>
          <div className="box-image-cover" />
          <img src={IMG.URL + "categorys/" + category.image} />
          <p className="label">{category.name}</p>
        </div>
      );

      // 最后一行插入Selector
      if (index === this.props.categorys.length - 1) {
        // 插入最后一行row
        categorys.push(
          <div key={"row" + index} className="row">
            {row}
          </div>
        );

        let len = this.props.categorys.length
        let limit = len - (len % 4 == 0 ? 4 : len % 4);
        categorys.push(
          <CategoryBoxSelector
            index={this.state.index}
            key={"selector" + index}
            certificates={ (this.state.index >= limit) ?
              this.certificateFilter(this.state.categoryId) : []
            }
          />
        )
      }
    });

    return (
      <div className="category-box-container">
        {categorys}
      </div>
    );
  }
}

CategoryBox.contextTypes = {
  router: React.PropTypes.object.isRequired
};
