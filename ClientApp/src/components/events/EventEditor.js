import { useParams } from "react-router-dom";
import React, { useState } from "react";
import { Col, Container, Row, Form, Label, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

export default function EventEditor() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    date: new Date(),
    location: "",
    description: "",
    FirstRoundGameCount: "",
  });
  const { eventId } = useParams();

  function handleSubmit(e) {
    e.preventDefault();

    fetch("/api/Events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: {
        Name: data.name,
        Date: data.date,
        Location: data.location,
        Description: data.description,
        FirstRoundGameCount: data.FirstRoundGameCount,
      },
    }).then(() => {
      console.log("new event added");
    });
  }

  function handle(e) {
    const newdata = { ...data };
    newdata[e.target.name] = e.target.value;
    setData(newdata);
    console.log(newdata);
  }

  function cancelClickHandler() {}

  return (
    <Container>
      <Row>
        <Col sm={3}></Col>
        <Col sm={6}>
          <Form
            id="event-create-form"
            action="/api/Events"
            onSubmit={handleSubmit}
          >
            <Container>
              <Row>
                <Label for="event-name-input">Name:</Label>
                <Input
                  id="event-name-input"
                  onChange={(e) => handle(e)}
                  value={data.name}
                  type="text"
                  name="name"
                  placeholder="Enter the event name..."
                />
              </Row>
              <Row>
                <Label for="event-date-input">Date:</Label>
                <Input
                  id="event-date-input"
                  onChange={(e) => handle(e)}
                  value={data.date}
                  type="datetime-local"
                  name="date"
                />
              </Row>
              <Row>
                <Label for="event-location-input">Location:</Label>
                <Input
                  id="event-location-input"
                  onChange={(e) => handle(e)}
                  value={data.location}
                  type="text"
                  name="location"
                  placeholder="Enter Location or Online"
                />
              </Row>
              <Row>
                <Label for="event-location-input">Description:</Label>
                <Input
                  id="event-location-input"
                  onChange={(e) => handle(e)}
                  value={data.description}
                  type="text"
                  name="description"
                  placeholder="Add the details of the event..."
                />
              </Row>
              <Row>
                <Label for="event-number-of-games-input">
                  Number of Games:
                </Label>
                <Input
                  id="event-number-of-games-input"
                  onChange={(e) => handle(e)}
                  value={data.FirstRoundGameCount}
                  type="number"
                  name="FirstRoundGameCount"
                />
              </Row>
            </Container>

            <div className="event-actions mt-3 d-flex justify-content-end">
              <Button
                className="me-3"
                color="primary"
                type="submit"
                form="event-create-form"
              >
                Submit
              </Button>
              <Button color="secondary" onClick={cancelClickHandler}>
                Cancel
              </Button>
            </div>
          </Form>
        </Col>
        <Col sm={3}></Col>
      </Row>
    </Container>
  );
}
