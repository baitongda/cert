import React from 'react';
import ReactDOM from 'react-dom';

import Main from './pages/main-part';

import { hashHistory, IndexRoute, Router, Route, Link, withRouter } from 'react-router'

const Index = withRouter(Main.App);

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={Index}>
      <IndexRoute component={Main.Home} />
      <Route path="calendar" component={Main.Calendar} />
      <Route path="info" component={Main.UserInfo} />
      <Route path="certificate" component={Main.CertificateList} />
      <Route path="detail" component={Main.CertificateDetail} />
      <Route path="edit" component={Main.OrderEditor} />
      <Route path="order" component={Main.OrderDetail} />
      <Route path="msg" component={Main.Message} />
    </Route>
  </Router>
), document.getElementById('container'));
