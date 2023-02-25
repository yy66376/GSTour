import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import { Container } from "reactstrap";
import { NavMenu } from "./NavMenu";

import "react-toastify/dist/ReactToastify.css";

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <NavMenu />
        <Container tag="main">{this.props.children}</Container>
      </div>
    );
  }
}
