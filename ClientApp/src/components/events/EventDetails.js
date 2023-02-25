import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Event from "./Event";
import { Col, Container, Row } from "reactstrap";
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

  const deleteClickHandler = async () => {
    const token = await authService.getAccessToken();
    const response = await fetch(`api/Events/${eventId}`, {
      method: "DELETE",
      headers: !token ? {} : { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      toast.success("✅ Event successfully deleted. ✅", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setTimeout(() => {
        navigate("/Events");
      }, 2000);
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
  };

  const applyClickHandler = async () => {
    const token = await authService.getAccessToken();
    const response = await fetch(`api/Events/Apply/${eventId}`, {
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
  };

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
                <p className="m-1"></p>
              </div>
            </Col>
          </Row>
          <Row>
            {userId !== "" && userId === eventState.data.organizerId && (
              <>
                <Col sm={4}>
                  <div class="track-game d-flex flex-column justify-content-around">
                    <button onClick={deleteClickHandler}>Delete</button>
                  </div>
                </Col>
                <Col sm={4}>
                  <div class="track-game d-flex flex-column justify-content-around">
                    <Link to={eventState.url}>
                      <h6 class="text-center">Edit</h6>
                    </Link>
                  </div>
                </Col>
              </>
            )}

            <Col sm={4}>
              <div class="track-game d-flex flex-column justify-content-around">
                <button onClick={applyClickHandler}>Apply</button>
              </div>
            </Col>
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
