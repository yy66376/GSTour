import React, { useState } from "react";
import { Col, Container, Row, Form, Label, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import authService from "./api-authorization/AuthorizeService";
import SelectSearch from "react-select-search";
import "./EventCreator.css";

export default function EventCreator() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    date: new Date(),
    location: "",
    description: "",
    gameId: "",
    FirstRoundGameCount: "",
  });

  const getGames = async (searchQuery) => {
    const response = await fetch(`/api/Games/SearchAll?q=${searchQuery}`);
    if (response.ok) {
      const games = await response.json();
      return games.map((g) => ({
        name: g.name,
        value: g.id,
        headerImageUrl: g.headerImageUrl,
      }));
    } else if (response.status === 404) {
      return [];
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
    setData((data) => {
      const newData = { ...data };
      newData[e.target.name] = e.target.value;
      return newData;
    });
  }

  const changeGameHandler = (newGameId) => {
    setData((data) => {
      return { ...data, gameId: newGameId };
    });
  };

  const renderGameOption = (props, option, snapshot, className) => {
    const imgStyle = {
      marginRight: 15,
      height: "75%",
      "border-radius": "5px",
    };

    console.dir(option);

    return (
      <button {...props} className={className} type="button">
        <span>
          <img
            className="img-fluid"
            alt="Game thumbnail"
            style={imgStyle}
            src={option.headerImageUrl}
          />
          <span>{option.name}</span>
        </span>
      </button>
    );
  };

  const cancelClickHandler = () => {
    navigate("/Events");
  };

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
                <Label for="event-game-input">Game:</Label>
                <SelectSearch
                  getOptions={getGames}
                  search
                  placeholder="Select a game"
                  onChange={changeGameHandler}
                  renderOption={renderGameOption}
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
