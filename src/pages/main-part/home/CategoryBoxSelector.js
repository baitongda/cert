import React, { Component } from 'react';

export default class CategoryBoxSelector extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
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
    let certificates = this.props.certificates, table = [];

    for (let i = 0; i < certificates.length; i+=3) {
      table.push(
        <div className="row" key={i}>
          <div className="cell" onClick={() => this.handleClick(certificates[i])}>
            {certificates[i].name}
          </div>
          { i+1 < certificates.length ?
            (
              <div className="cell" onClick={() => this.handleClick(certificates[i+1])}>
                {certificates[i+1].name}
              </div>
            ) : null
          }
          { i+2 < certificates.length ?
            (
              <div className="cell" onClick={() => this.handleClick(certificates[i+2])}>
                {certificates[i+2].name}
              </div>
            ) : null
          }
        </div>
      );
    }

    let rowsNum = Math.ceil(certificates.length / 3);
    let marginLeft = 12.5 + 25 * (this.props.index % 4);

    return (
      <div>
        {/* <div className="arrow-up" style={{ borderBottom: rowsNum > 0 ? null : 'none', marginLeft: marginLeft+'%'}}></div> */}
        <div className="category-selector-container"
          style={{ height: rowsNum > 0 ? rowsNum*48 : 0, border: rowsNum > 0 ? null : 0 }}>
          {table}
        </div>
      </div>
    );
  }
}

CategoryBoxSelector.contextTypes = {
  router: React.PropTypes.object.isRequired
};
