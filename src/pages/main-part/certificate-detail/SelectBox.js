import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';

import "./styles/style.css";

export default class SelectBox extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.selected.id) {
      if (nextProps.kinds && nextProps.kinds.length > 0) {
        this.handleSelect(nextProps.kinds[0]);
      }
    }
  }

  handleSelect(selected) {
    this.props.select(selected);
  }

  render() {

    let selectField = this.props.kinds.map((choice, index) =>
      <div
        className={this.props.selected.id === choice.id ? "select-box active" : "select-box"}
        key={index}
        onClick={() => {this.handleSelect(choice)}}
      >
        {choice.name}
      </div>
    );

    return (
      <div className="select-container">
        {selectField}
      </div>
    );
  }
}
