import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Event from "./Event";
import { Col, Container, Row } from "reactstrap";
import "./EventDetails.css";
import { useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";
import { toast } from "react-toastify";
import {
  Clipboard2CheckFill,
  PencilSquare,
  Trash3Fill,
} from "react-bootstrap-icons";
import EventParticipant from "./EventParticipant";
// import JsonDatabase from "brackets-json-db";
import { InMemoryDatabase } from "brackets-memory-db";
import { BracketsManager } from "brackets-manager";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import EventBracket from "./EventBracket";
import {
  ApplicationPaths,
  QueryParameterNames,
} from "../api-authorization/ApiAuthorizationConstants";

export default function EventDetails() {
  const navigate = useNavigate();
  const [eventState, setEventState] = useState({
    data: {},
    loading: true,
    url: "/Events/Edit/",
  });
  const [userId, setUserId] = useState("");
  const { eventId } = useParams();

  // function for fetching event detail
  const fetchEventDetails = async (id) => {
    const response = await fetch(`api/Events/${id}`);
    let data = null;
    if (response.ok) {
      data = await response.json();
    }
    return data;
  };

  // load event detail when component updates
  useEffect(() => {
    const populateEventData = async () => {
      const response = await fetchEventDetails(eventId);
      if (response !== null) {
        setEventState((prev) => {
          return {
            data: response,
            loading: false,
            url: prev.url + eventId,
          };
        });
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

    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/events", {
        accessTokenFactory: () => authService.getAccessToken(),
      })
      .configureLogging(LogLevel.Trace)
      .build();

    const start = async () => {
      try {
        await connection.start();
        console.log("Event SignalR Connected");

        await connection.invoke("SubscribeToEvent", parseInt(eventId));
        console.log("Added to event group!");

        connection.on("ReceiveParticipant", async (participantName) => {
          console.log("Receive participant triggered!");
          setEventState((prev) => {
            return {
              ...prev,
              data: {
                ...prev.data,
                participants: [...prev.data.participants, participantName],
              },
            };
          });
        });
      } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
      }
    };

    connection.onclose(async () => {
      await start();
    });
    start();
  }, [eventId]);

  async function handleDelete(e) {
    if (userId === eventState.data.organizerId && userId !== "") {
      const token = await authService.getAccessToken();
      const response = await fetch("api/Events/" + eventId, {
        method: "DELETE",
        headers: !token
          ? { "Content-Type": "application/json" }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
      });

      if (response.ok) {
        toast.success("✅ Event succesfully deleted. ✅", {
          position: "top-center",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setTimeout(() => {
          navigate("/Events");
        }, 1500);
      } else {
        //Tell user the event api is down
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
    } else {
      //Tell user the event api is down
      toast.error("🛑 You are not the organizer. 🛑", {
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

  function handleEdit(e) {
    if (userId === eventState.data.organizerId && userId !== "") {
      navigate(`/Events/Edit/${eventId}`);
    } else {
      toast.error("🛑 You are not the organizer. 🛑", {
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

  async function handleApply() {
    if (!(await authService.isAuthenticated())) {
      const returnUrl = window.location.href;
      const redirectUrl = `${ApplicationPaths.Login}?${
        QueryParameterNames.ReturnUrl
      }=${encodeURIComponent(returnUrl)}`;
      navigate(redirectUrl);
      return;
    }

    const token = await authService.getAccessToken();
    const response = await fetch(`api/Events/Apply/${eventId}`, {
      method: "POST",
      headers: !token ? {} : { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorText = await response.text();
        if (errorText === "EventAlreadyAppliedError")
          toast.error("🛑 You have already applied to this event. 🛑", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        else if (errorText === "EventDoesNotExist") {
          toast.error("🛑 The event does not exist. 🛑", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        } else if (errorText === "EventCapacityExceededError") {
          toast.error("🛑 The event capacity is already full. 🛑", {
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
      } else {
        toast.error("🛑 Unable to contact Events API. Unable to apply 🛑", {
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
    } else {
      toast.success(`✅ You have successfully applied to this event ✅`, {
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

  const eventActionClass = () => {
    return userId !== "" && userId === eventState.data.organizerId
      ? "justify-content-between"
      : "justify-content-center";
  };

  const handleNewParticipant = (participantName) => {
    setEventState((prev) => {
      return {
        ...prev,
        data: {
          ...prev.data,
          participants: [...prev.data.participants, participantName],
        },
      };
    });
  };

  // const storage = new JsonDatabase();
  const storage = new InMemoryDatabase();
  const manager = new BracketsManager(storage);

  const renderEvent = (event) => {
    return (
      <>
        <Event {...event} organizerName={event.organizerName} />
        <Container className="mt-4 p-0">
          <Row>
            <Col sm={6}>
              {/* short description */}
              <div id="event-short-description">
                <p className="m-1">{event.description}</p>
              </div>
            </Col>
            <Col className="d-grid align-items-center" sm={6}>
              <div className={`d-flex ${eventActionClass()}`}>
                {/* Apply */}
                <div
                  className="event-apply d-flex flex-column justify-content-around"
                  onClick={handleApply}
                >
                  <h5 className="text-center">
                    <Clipboard2CheckFill /> Apply
                  </h5>
                </div>

                {userId !== "" && userId === eventState.data.organizerId && (
                  <>
                    {/* Edit */}
                    <div
                      className="event-edit d-flex flex-column justify-content-around"
                      onClick={handleEdit}
                    >
                      <h5 className="text-center">
                        <PencilSquare /> Edit
                      </h5>
                    </div>

                    {/* Delete */}
                    <div
                      className="event-delete d-flex flex-column justify-content-around"
                      onClick={handleDelete}
                    >
                      <h5 class="text-center">
                        <Trash3Fill /> Delete
                      </h5>
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              {/* Participants */}
              <div id="event-participants">
                <h4 className="text-center mb-4">
                  Participating Players/Teams:
                </h4>
                {event.participants.length > 0 && (
                  <div id="event-participants-list-container">
                    <ul id="event-participants-list">
                      {event.participants.map((p, index) => (
                        <EventParticipant key={index} name={p} />
                      ))}
                    </ul>
                  </div>
                )}
                {event.participants.length === 0 && (
                  <p className="event-no-participants-text text-center">
                    There is no one participating in this event right now. Click
                    apply above to join the event!
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Container>

        {event.firstRoundGameCount === event.participants.length && (
          <EventBracket
            event={event}
            manager={manager}
            onNewParticipant={handleNewParticipant}
          />
        )}
      </>
    );
  };

  const contents = eventState.loading ? (
    <p>
      <em>Loading...</em>
    </p>
  ) : (
    renderEvent(eventState.data)
  );

  return <>{contents}</>;
}
