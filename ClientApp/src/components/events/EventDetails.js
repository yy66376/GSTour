import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Event from "./Event";
import { Col, Container, Row, Button } from "reactstrap";
import "./EventDetails.css";
import { useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";
import { toast } from "react-toastify";

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
        setEventState({ data: gameResponse, loading: false, url: temp });
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

  async function handleDelete(e) {
    if (userId === eventState.data.organizerId && userId !== "") {
      const token = await authService.getAccessToken();
      const response = fetch("api/Events/" + eventId, {
        method: "DELETE",
        headers: !token
          ? { "Content-Type": "application/json" }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
      });

      if (response.ok) {
        navigate("/Events");
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

  async function handleEdit(e) {
    if (userId === eventState.data.organizerId && userId !== "") {
      navigate("/Event/Edit/" + e);
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
    const token = await authService.getAccessToken();
    const response = fetch("api/Events/Apply/" + eventId, {
      method: "POST",
      headers: !token ? {} : { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
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

  const renderEvent = (event) => {
    return (
      <>
        <Event {...event} />
        <Container className="mt-4 p-0">
          <Row>
            <Col sm={6}>
              {/* short description */}
              <div id="game-short-description">
                <p className="m-1">{event.description}</p>
              </div>
            </Col>
            <Col sm={6}>
              {/* Participants */}
              <div id="game-short-description">
                <p className="m-1">{event.participants}</p>
              </div>
            </Col>
          </Row>
          <Row>
            {userId !== "" && userId === eventState.data.organizerId && (
              <>
                <Button
                  color="danger"
                  onClick={(event) => handleDelete(event.id)}
                >
                  Delete
                </Button>
                <Link to={eventState.url}>
                  <Button
                    color="primary"
                    onClick={(event) => handleEdit(event.id)}
                  >
                    Edit
                  </Button>
                </Link>
              </>
            )}

            <Button color="primary" onClick={(event) => handleApply(event.id)}>
              Apply
            </Button>
          </Row>
        </Container>
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
