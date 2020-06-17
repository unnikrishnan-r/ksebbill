import React, { Component } from "react";
import { withRouter } from "react-router-dom";
// import "./style.css"
import Navbar from "../components/Navbar"
import InputForm from "../components/InputForm"

class MainPage extends Component {
  render() {
    return (
      <>
      <Navbar></Navbar>
      <InputForm></InputForm>
      </>
    );
  }
}

export default withRouter(MainPage);
