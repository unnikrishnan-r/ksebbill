import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import API from "../../utils/API";

class InputForm extends Component {
  state = {
    startingReading: 0,
    finalReading: 0,
    numberOfMonths: 1,
    singlePhase: true,
    validated: false,
    customerMeter: false,
    billGenerated: false,
    billObject: {},
    disclaimerLine1:
      "Disclaimer: This is not an official tool from KSEB, there are some known gaps in calculating fuel.",
    disclaimerLine2: "Please consider this as an indicative tool only",
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  handleOwnershipCheckbox = (event) => {
    this.setState({ customerMeter: !this.state.customerMeter });
  };
  handleConnectionTypeCheckbox = (event) => {
    this.setState({ singlePhase: !this.state.singlePhase });
  };

  handleOnSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ validated: true });
    } else {
      this.setState({ validated: true });
      const billInput = {
        singlePhase: this.state.singlePhase,
        customerMeter: this.state.customerMeter,
        startingReading: this.state.startingReading,
        finalReading: this.state.finalReading,
        numberOfMonths: this.state.numberOfMonths,
      };
      console.log(billInput);
      API.generateBill(billInput)
        .then((response) => {
          console.log(response.data.error);
          if (!response.data.error) {
            this.setState({ billGenerated: true, billObject: response.data });
          } else {
            this.setState({
              billGenerated: false,
              disclaimerLine2: "",
              disclaimerLine1: response.data.error,
            });
          }
        })
        .catch((err) => console.error(err));
    }
  };
  render() {
    return (
      <>
        <Container style={{ marginTop: "10px" }}>
          <Form
            noValidate
            validated={this.state.validated}
            onSubmit={this.handleOnSubmit}
          >
            <Row>
              <Form.Group as={Col} md={3} controlId="validationCustom05">
                <Form.Label>
                  <strong>അവസാനത്തെ മീറ്റർ റീഡിങ്</strong>
                </Form.Label>

                <Form.Control
                  size="lg"
                  type="number"
                  min="1"
                  required
                  onChange={this.handleInputChange}
                  value={this.state.startingReading}
                  name="startingReading"
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="validationCustom05">
                <Form.Label>
                  <strong>ഏറ്റവും പുതിയ മീറ്റർ റീഡിങ്</strong>
                </Form.Label>

                <Form.Control
                  size="lg"
                  type="number"
                  min="1"
                  required
                  onChange={this.handleInputChange}
                  value={this.state.finalReading}
                  name="finalReading"
                />
              </Form.Group>
              <Form.Group
                as={Col}
                md={3}
                controlId="exampleForm.ControlSelect1"
              >
                <Form.Label>
                  <strong>എത്ര മാസത്തെ റീഡിങ് ?</strong>
                </Form.Label>

                <Form.Control
                  as="select"
                  size="lg"
                  required
                  onChange={this.handleInputChange}
                  value={this.state.numberOfMonths}
                  name="numberOfMonths"
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} md={3}>
                <Form.Check
                  type={`checkbox`}
                  id={`default-checkbox`}
                  label={`Three Phase`}
                  checked={!this.state.singlePhase}
                  onChange={this.handleConnectionTypeCheckbox}
                />
                <Form.Check
                  type={`checkbox`}
                  id={`default-checkbox`}
                  label={`Customer Owned Meter`}
                  checked={this.state.customerMeter}
                  onChange={this.handleOwnershipCheckbox}
                />
                <Button type="submit" className="btn btn-info">
                  Submit
                </Button>
              </Form.Group>
            </Row>
          </Form>
        </Container>
        <Container>
          {this.state.billGenerated ? (
            <Table bordered hover responsive>
              <thead className="bg-info">
                <tr>
                  <th>#</th>
                  <th></th>
                  <th>പ്രതിമാസ ചാർജുകൾ</th>
                  <th> 2 മാസത്തെ ചാർജുകൾ </th>
                  {this.state.numberOfMonths > 2 ? (
                    <th> {this.state.numberOfMonths} മാസത്തെ ചാർജുകൾ </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Units Consumed</td>
                  <td>
                    {this.state.billObject.monthlySummary.monthlyConsumption}
                  </td>
                  <td>
                    {this.state.billObject.bimonthlySummary.totalConsumption}
                  </td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      {this.state.billObject.monthlySummary.monthlyConsumption *
                        this.state.numberOfMonths}
                    </td>
                  ) : null}
                </tr>

                <tr>
                  <td>2</td>
                  <td>Telescopic Billing?</td>
                  <td>
                    {this.state.billObject.connectionDetails.telescopicBilling
                      ? "Y"
                      : "N"}
                  </td>
                  <td>
                    {this.state.billObject.connectionDetails.telescopicBilling
                      ? "Y"
                      : "N"}
                  </td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      {this.state.billObject.connectionDetails.telescopicBilling
                        ? "Y"
                        : "N"}
                    </td>
                  ) : null}
                </tr>
                <tr>
                  <td>3</td>
                  <td>Fixed Charges</td>
                  <td>{this.state.billObject.monthlySummary.fixedCharge}</td>
                  <td>{this.state.billObject.bimonthlySummary.fixedCharge}</td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      {this.state.billObject.monthlySummary.fixedCharge *
                        this.state.numberOfMonths}
                    </td>
                  ) : null}
                </tr>
                <tr>
                  <td>4</td>
                  <td>Meter Rent, Cess, GST</td>
                  <td>{this.state.billObject.monthlySummary.meterCharge}</td>
                  <td>{this.state.billObject.bimonthlySummary.meterCharge}</td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      {this.state.billObject.monthlySummary.meterCharge *
                        this.state.numberOfMonths}
                    </td>
                  ) : null}
                </tr>
                <tr className="bg-primary">
                  <td>5</td>
                  <td>
                    <strong>Energy Charges based on consumption</strong>
                  </td>
                  <td>
                    <strong>
                      {this.state.billObject.monthlySummary.energyCharge}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {this.state.billObject.bimonthlySummary.energyCharge}
                    </strong>
                  </td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      <strong>
                        {this.state.billObject.monthlySummary.energyCharge *
                          this.state.numberOfMonths}
                      </strong>
                    </td>
                  ) : null}
                </tr>
                {this.state.billObject.energyCharge.slabs.map((slab) => {
                  return (
                    <tr>
                      <td></td>
                      <td>
                        <i>{Object.keys(slab)}</i>
                      </td>
                      <td>
                        <i>{slab[Object.keys(slab)]}</i>
                      </td>
                      <td></td>
                      {this.state.numberOfMonths > 2 ? <td></td> : null}
                    </tr>
                  );
                })}
                <tr>
                  <td>6</td>
                  <td>Energy Duty @ 10%</td>
                  <td>{this.state.billObject.monthlySummary.energyDuty}</td>
                  <td>{this.state.billObject.bimonthlySummary.energyDuty}</td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      {this.state.billObject.monthlySummary.energyDuty *
                        this.state.numberOfMonths}
                    </td>
                  ) : null}
                </tr>
                <tr>
                  <td>7</td>
                  <td>Fuel Surcharge - 10ps/unit</td>
                  <td>{this.state.billObject.monthlySummary.fuelSurcharge}</td>
                  <td>
                    {this.state.billObject.bimonthlySummary.fuelSurcharge}
                  </td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      {this.state.billObject.monthlySummary.fuelSurcharge *
                        this.state.numberOfMonths}
                    </td>
                  ) : null}
                </tr>
                <tr className="bg-success">
                  <td>8</td>
                  <td>
                    <strong>Grant Total (3+4+5+6+7)</strong>
                  </td>
                  <td>
                    <strong>
                      {this.state.billObject.monthlySummary.totalAmount}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {this.state.billObject.bimonthlySummary.totalAmount}
                    </strong>
                  </td>
                  {this.state.numberOfMonths > 2 ? (
                    <td>
                      <strong>
                        {this.state.billObject.monthlySummary.totalAmount *
                          this.state.numberOfMonths}
                      </strong>
                    </td>
                  ) : null}
                </tr>
              </tbody>
            </Table>
          ) : (
            <>
              <p>
                <i>{this.state.disclaimerLine1}</i>
              </p>
              <p>
                <i>{this.state.disclaimerLine2}</i>
              </p>
            </>
          )}
        </Container>
      </>
    );
  }
}

export default withRouter(InputForm);
