import { useParams, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Form, Label, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";
import { toast } from "react-toastify";

export default function EventEditor() {
  const navigate = useNavigate();
  const [eventState, setEventState] = useState({
    data: {},
    loading: true,
  });
  const [userId, setUserId] = useState("");
  const { eventId } = useParams();

  // function for fetching event detail
  const fetchEventDetails = async (id) => {
    const response = await fetch(`api/Events/${id}`);
    let data = null;
    if (response.ok) {
      data = await response.json();
    } else {
      // tell user that event api is down
      toast.error("🛑 Unable to contact Events API. 🛑", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    return data;
  };

  // load event detail when component updates
  useEffect(() => {
    const populateEventData = async () => {
      const gameResponse = await fetchEventDetails(eventId);
      if (gameResponse !== null) {
        var temp = eventState.url + eventId;
        setEventState({ data: gameResponse, loading: false });
      } else {
        // tell user that event details api is down
        toast.error("🛑 Unable to contact Events API. 🛑", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    };
    const populateUser = async () => {
      if (await authService.isAuthenticated()) {
        setUserId((await authService.getUser()).sub);
      }
    };

    populateEventData();
    populateUser();
  }, [eventId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = await authService.getAccessToken();

    fetch("/api/Events/" + eventId, {
      method: "PATCH",
      headers: !token
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      body: JSON.stringify(eventState.data),
    }).then(() => {
      console.log("new event added");
    });
  }

  function handle(e) {
    const newdata = { ...eventState.data };
    newdata[e.target.name] = e.target.value;
    setEventState({ data: newdata, loading: false });
    console.log(newdata);
  }

  function cancelClickHandler() {
    navigate("Events/" + eventId);
  }

  return (
    <Container>
      <Row>
        <Col sm={3}></Col>
        <Col sm={6}>
          <Form
            id="event-patch-form"
            action="/api/Events"
            onSubmit={handleSubmit}
          >
            <Container>
              <Input
                id="event-organizer-input"
                type="hidden"
                value={eventState.data.organizer}
                name="organizer"
              />
              <Input
                id="event-organizerId-input"
                type="hidden"
                value={eventState.data.organizerId}
                name="organizerId"
              />
              <Input
                id="event-game-input"
                type="hidden"
                value={eventState.data.game}
                name="game"
              />
              <Input
                id="event-headerImageUrl-input"
                type="hidden"
                value={eventState.data.headerImageUrl}
                name="headerImageUrl"
              />
              <Input
                id="event-participants-input"
                type="hidden"
                value={eventState.data.participants}
                name="participants"
              />
              <Input
                id="event-participantsPerGame-input"
                type="hidden"
                value={eventState.data.ParticipantsPerGame}
                name="participantsPerGame"
              />
              <Input
                id="event-gameId-input"
                type="hidden"
                value={eventState.data.gameId}
                name="gameId"
              />

              <Row>
                <Label for="event-name-input">Name:</Label>
                <Input
                  id="event-name-input"
                  onChange={(e) => handle(e)}
                  value={eventState.data.name}
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
                  value={eventState.data.date}
                  type="datetime-local"
                  name="date"
                />
              </Row>
              <Row>
                <Label for="event-location-input">Location:</Label>
                <Input
                  id="event-location-input"
                  onChange={(e) => handle(e)}
                  value={eventState.data.location}
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
                  value={eventState.data.description}
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
                  value={eventState.data.firstRoundGameCount}
                  type="number"
                  name="firstRoundGameCount"
                />
              </Row>
            </Container>

            <div className="event-actions mt-3 d-flex justify-content-end">
              <Button
                className="me-3"
                color="primary"
                type="submit"
                form="event-patch-form"
              >
                Submit
              </Button>
              <Link to={"/Events/" + eventId}>Cancel</Link>
            </div>
          </Form>
        </Col>
        <Col sm={3}></Col>
      </Row>
    </Container>
  );
}
