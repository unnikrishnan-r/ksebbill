import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import API from "../../utils/API";

class InputForm extends Component {
  state = {
    startingReading: 0,
    finalReading: 0,
    numberOfMonths: 2,
    singlePhase: true,
    validated: false,
    customerMeter: false,
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
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
      };
      API.generateBill(billInput).then((response) => {
        this.props.history.push("/searchresults");
      });
    }
  };
  render() {
    return (
      <Container style={{ marginTop: "15px" }}>
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
            <Form.Group as={Col} md={3} controlId="exampleForm.ControlSelect1">
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
            <Form.Group as={Col} md={3} style={{ marginTop: "30px" }}>
              <Button
                size="lg"
                type="submit"
                className="btn btn-info"
                // onClick={this.handleOnSubmit}
              >
                Submit
              </Button>
            </Form.Group>
          </Row>
        </Form>
      </Container>
    );
  }
}

export default withRouter(InputForm);
