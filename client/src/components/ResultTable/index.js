import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Table from 'react-bootstrap/Table'
class ResultTable extends Component{

render(){
    return(
        <Table responsive>
  <thead>
    <tr>
      <th>#</th>
      <th></th>
      <th>പ്രതിമാസ ചാർജുകൾ</th>
      <th>ദ്വൈമാസ ചാർജുകൾ </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Telescopic Billing?</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Consumed Units</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Fixed Charges</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Meter Rent, Cess and Tax</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Energy Consumption</td>
    </tr>
    <tr>
      <td>6</td>
      <td>Energy Duty</td>
    </tr>
    <tr>
      <td>7</td>
      <td>Fuel Surcharge</td>
    </tr>
    <tr>
      <td>1</td>
      <td>Grand Total</td>
    </tr>
  </tbody>
</Table>
    )
}
}

export default withRouter(ResultTable);