import React, { useState } from "react";
import { Col, Container, Row, Form, Label, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import authService from "./api-authorization/AuthorizeService";

export default function EventCreator() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    date: new Date(),
    location: "",
    description: "",
    FirstRoundGameCount: "",
  });

  const getGames = async () => {
    const token = await authService.getAccessToken();
    const response = await fetch("/api/Games", {
      method: "GET",
      headers: !token
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      body: JSON.stringify(data),
    });

    if (response.ok) {
    } else {
      // tell user that the games API is down
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await authService.getAccessToken();
    const response = await fetch("/api/Events", {
      method: "POST",
      headers: !token
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      navigate("/Events");
    } else {
      // tell user that the events API is down
    }
  };

  function handle(e) {
    const newdata = { ...data };
    newdata[e.target.name] = e.target.value;
    setData(newdata);
    console.log(newdata);
  }

  return (
    <Container>
      <Row>
        <Col sm={3}></Col>
        <Col sm={6}>
          <Form action="/api/Events" onSubmit={handleSubmit}>
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
              <Row>
                <Button color="primary" type="submit">
                  Submit
                </Button>
              </Row>
            </Container>
          </Form>
        </Col>
        <Col sm={3}></Col>
      </Row>
    </Container>
  );
}
