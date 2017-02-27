import React, { Component } from 'react';
import WeUI from 'react-weui';
import 'weui';
import request from 'src/utils/request';
import crypto from 'crypto';

import { PAY } from '../../config';

import './styles/index.css';

const {
  Button,
  Cell,
  CellHeader,
  CellBody,
  Form,
  FormCell,
  Input,
  Label
} = WeUI;

export default class UserInfoForm extends Component {
   constructor(props) {
    super(props);

    let fields = {};
    this.props.fields.forEach(item => { fields.item = "" });

    this.state = {
      name: "",
      phone: "",
      verCode: "",

      verCodeBtnText: "点击获取",
      verCodeBtnSec: 30,
      verCodeBtnDisabled: false,

      ...fields
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.getVerificationCode = this.getVerificationCode.bind(this);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // 获取验证码
  getVerificationCode() {

    // if (this.state.phone.length !== 11) {
    //   alert("请输入正确手机号码");
    //   return;
    // }

    this.setState({ verCodeBtnDisabled: true });
    request({
      url: 'api/verification/' + this.state.phone,
      success: (resp) => {
        // 倒计时
        this.interval = setInterval(() => this.tick(), 1000);
      },
      error: (err) => {
        this.setState({ verCodeBtnDisabled: false });
      }
    })
  }

  // 倒计时
  tick() {
    let sec = this.state.verCodeBtnSec;
    console.log(sec);
    if (sec <= 0) {
      clearInterval(this.interval);
      this.setState({
        verCodeBtnText: "点击获取",
        verCodeBtnDisabled: false,
        verCodeBtnSec: 30
      })
    } else {
      this.setState({
        verCodeBtnText: sec + "s后再试",
        verCodeBtnSec: sec - 1
      });
    }
  }

  handleInputChange(key, value) {
    this.setState({ [key]: value }, () => {
      this.props.handleFormData(this.state);
    });
  }

  render() {

    let fields = this.props.fields.map(item => (
      <FormCell key={item._id}>
        <CellHeader>
          <Label>{item.name}</Label>
        </CellHeader>
        <CellBody>
          <Input
            type="text"
            placeholder={item.remark}
            value={this.state[item._id]}
            onChange={(e) => this.handleInputChange(item._id, e.target.value)}
          />
        </CellBody>
      </FormCell>
    ));

    return (
      <div>
        <Form>
          <FormCell>
            <CellHeader>
              <Label>姓名</Label>
            </CellHeader>
            <CellBody>
              <Input
                type="text"
                placeholder="请输入您的姓名"
                value={this.state.name}
                onChange={(e) => this.handleInputChange("name", e.target.value)}
              />
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>
              <Label>手机号</Label>
            </CellHeader>
            <CellBody>
              <Input
                type="tel"
                placeholder="请输入手机号码"
                value={this.state.phone}
                onChange={(e) => this.handleInputChange("phone", e.target.value)}
              />
            </CellBody>
          </FormCell>
          <FormCell>
            <CellHeader>
              <Label>验证码</Label>
            </CellHeader>
            <CellBody>
              <Input
                style={{width: '52%'}}
                type="text"
                placeholder="短信验证码"
                value={this.state.verCode}
                onChange={(e) => this.handleInputChange("verCode", e.target.value)}
              />
              <Button
                onClick={this.getVerificationCode}
                style={{float: 'right'}}
                size="small"
                type="default"
                disabled={this.state.verCodeBtnDisabled}
              >{this.state.verCodeBtnText}</Button>
            </CellBody>
          </FormCell>
        </Form>

        <Form>
          {fields}
        </Form>
      </div>
    );
  }
}
