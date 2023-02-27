import { useParams, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Form, Label, Input, Button, FormGroup, FormText } from "reactstrap";
import { useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";
import { toast } from "react-toastify";
import "./EventEditor.css"

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
      const eventResponse = await fetchEventDetails(eventId);
      if (eventResponse !== null) {
        setEventState({ data: eventResponse, loading: false });
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

    const response = fetch("/api/Events/" + eventId, {
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

    if (response.ok) {
      navigate("/Events/" + eventId);
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
  }

  function handleChange(e) {
    const newdata = { ...eventState.data };
    newdata[e.target.name] = e.target.value;
    setEventState({ data: newdata, loading: false });
    console.log(newdata);
  }

  function cancelClickHandler() {
    navigate("/Events/" + eventId);
  }

    return (
        <>
            <h1 className="text-center mb-4">Create an event</h1>
            <img
                className="img-fluid m-auto d-block"
                style={{ height: "150px" }}
                src={process.env.PUBLIC_URL + "/images/trophy.png"}
                alt="Trophy"
            />
            <Form id="event-create-form" action="/api/Events" onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="event-name-input">Name:</Label>
                    <Input
                        id="event-name-input"
                        onChange={handleChange}
                        value={eventState.data.name}
                        type="text"
                        name="name"
                        placeholder="Enter the event name..."
                    />
                    <FormText>Give your event a cool name!</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-date-input">Date:</Label>
                    <Input
                        id="event-date-input"
                        onChange={handleChange}
                        value={eventState.data.date}
                        type="datetime-local"
                        name="date"
                    />
                    <FormText>Pick a date for this event.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-location-input">Location:</Label>
                    <Input
                        id="event-location-input"
                        onChange={handleChange}
                        value={eventState.data.location}
                        type="text"
                        name="location"
                        placeholder="Enter Location or Online"
                    />
                    <FormText>Pick a location for this event.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-description-input">Description:</Label>
                    <Input
                        id="event-description-input"
                        onChange={handleChange}
                        value={eventState.data.description}
                        type="text"
                        name="description"
                        placeholder="Add the details of the event..."
                    />
                    <FormText>Give your event a short description.</FormText>
                </FormGroup>
                <FormGroup>
                    <Label for="event-number-of-games-input">
                        Number of Participants/Teams:
                    </Label>
                    <Input
                        id="event-number-of-games-input"
                        onChange={handleChange}
                        value={eventState.data.FirstRoundGameCount}
                        type="select"
                        name="FirstRoundGameCount"
                    >
                        <option value="4">4</option>
                        <option value="8">8</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                    </Input>
                    <FormText>
                        Choose the number of players/teams that will play in this event.
                        Must be a power of 2.
                    </FormText>
                </FormGroup>

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
        </>
  );
}
