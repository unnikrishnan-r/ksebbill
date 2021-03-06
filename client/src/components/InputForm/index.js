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
    doorlockbillamount: 0,
    doorlockpaidamount: 0,
    numberOfMonths: 1,
    singlePhase: true,
    validated: false,
    customerMeter: false,
    billGenerated: false,
    billObject: {},
    disclaimerLine1:
      "Disclaimer: This is not an official tool from KSEB, there are some known gaps in calculating fuel surcharge.",
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
        doorlockbillamount: this.state.doorlockbillamount,
        doorlockpaidamount: this.state.doorlockpaidamount,
      };
      console.log(billInput);
      API.generateBill(billInput)
        .then((response) => {
          if (!response.data.error) {
            console.log(response.data);
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
                  <option>4</option>
                </Form.Control>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Col} md={3} controlId="validationCustom05">
                <Form.Label>
                  <strong>Door Lock ബില്ല് തുക</strong>
                </Form.Label>

                <Form.Control
                  size="lg"
                  type="number"
                  onChange={this.handleInputChange}
                  value={this.state.doorlockbillamount}
                  name="doorlockbillamount"
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="validationCustom05">
                <Form.Label>
                  <strong>അടച്ച തുക</strong>
                </Form.Label>

                <Form.Control
                  size="lg"
                  type="number"
                  onChange={this.handleInputChange}
                  value={this.state.doorlockpaidamount}
                  name="doorlockpaidamount"
                />
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
                </tr>
                <tr>
                  <td>3</td>
                  <td>Fixed Charges</td>
                  <td>{this.state.billObject.monthlySummary.fixedCharge}</td>
                  <td>{this.state.billObject.bimonthlySummary.fixedCharge}</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Meter Rent, Cess, GST</td>
                  <td>{this.state.billObject.monthlySummary.meterCharge}</td>
                  <td>{this.state.billObject.bimonthlySummary.meterCharge}</td>
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
                    </tr>
                  );
                })}
                <tr>
                  <td>6</td>
                  <td>Energy Duty @ 10%</td>
                  <td>{this.state.billObject.monthlySummary.energyDuty}</td>
                  <td>{this.state.billObject.bimonthlySummary.energyDuty}</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Fuel Surcharge - 10ps/unit</td>
                  <td>{this.state.billObject.monthlySummary.fuelSurcharge}</td>
                  <td>
                    {this.state.billObject.bimonthlySummary.fuelSurcharge}
                  </td>
                </tr>
                <tr className="bg-info">
                  <td>8</td>
                  <td>
                    <strong>Grand Total (3+4+5+6+7)</strong>
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
                </tr>
                <tr>
                  <td>9</td>
                  <td style={{ whiteSpace: "pre-line" }}>
                    Approx Door Lock Adjustment {"\n"}  
                    <i>
                      <strong>for 4 month reading only</strong>
                    </i>
                  </td>
                  <td></td>
                  <td>{this.state.billObject.bimonthlySummary.doorlockAdj}</td>
                </tr>
                <tr>
                  <td>10</td>
                  <td>Pending from previous bill</td>
                  <td></td>
                  <td>{this.state.billObject.bimonthlySummary.previousDue}</td>
                </tr>
                <tr className="bg-success">
                  <td>11</td>
                  <td>
                    <strong>Amount Due</strong>
                  </td>
                  <td></td>
                  <td>
                    <strong>
                      {this.state.billObject.bimonthlySummary.totalAmount +
                        this.state.billObject.bimonthlySummary.doorlockAdj +
                        this.state.billObject.bimonthlySummary.previousDue}
                    </strong>
                  </td>
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
