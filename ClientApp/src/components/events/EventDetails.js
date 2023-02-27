import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Event from "./Event";
import { Col, Container, Row, Button } from "reactstrap";
import "./EventDetails.css";
import { useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";
import { toast } from "react-toastify";
import { Bracket, RoundProps } from "react-brackets";

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

  const rounds = [
    {
      title: "Round one",
      seeds: [
        {
          id: 1,
          date: new Date().toDateString(),
          teams: [{ name: "Team A" }, { name: "Team B" }],
        },
        {
          id: 2,
          date: new Date().toDateString(),
          teams: [{ name: "Team C" }, { name: "Team D" }],
        },
      ],
    },
    {
      title: "Round one",
      seeds: [
        {
          id: 3,
          date: new Date().toDateString(),
          teams: [{ name: "Team A" }, { name: "Team C" }],
        },
      ],
    },
  ];

  const Component = () => {
    var rounds = createRounds();

    return <Bracket rounds={rounds} />;
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
  }

  function createRounds() {
    console.log(eventState.data);
    var rounds;

    switch (eventState.data.firstRoundGameCount) {
      case 4:
        rounds = [
          {
            title: "Round one",
            seeds: [
              {
                id: 1,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[0] },
                  { name: eventState.data.participants[1] },
                ],
              },
              {
                id: 2,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[2] },
                  { name: eventState.data.participants[3] },
                ],
              },
            ],
          },
          {
            title: "Finals",
            seeds: [
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 1" },
                  { name: "Winner of Game 2" },
                ],
              },
            ],
          },
        ];
        break;
      case 8:
        rounds = [
          {
            title: "Round One",
            seeds: [
              {
                id: 1,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[0] },
                  { name: eventState.data.participants[1] },
                ],
              },
              {
                id: 2,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[2] },
                  { name: eventState.data.participants[3] },
                ],
              },
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[4] },
                  { name: eventState.data.participants[5] },
                ],
              },
              {
                id: 4,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[6] },
                  { name: eventState.data.participants[7] },
                ],
              },
            ],
          },
          {
            title: "Semifinals",
            seeds: [
              {
                id: 5,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 1" },
                  { name: "Winner of Game 2" },
                ],
              },
              {
                id: 6,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 3" },
                  { name: "Winner of Game 4" },
                ],
              },
            ],
          },
          {
            title: "Finals",
            seeds: [
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Semifinals 1" },
                  { name: "Winner of Semifinals 2" },
                ],
              },
            ],
          },
        ];
        break;
      case 16:
        rounds = [
          {
            title: "Round One",
            seeds: [
              {
                id: 1,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[0] },
                  { name: eventState.data.participants[1] },
                ],
              },
              {
                id: 2,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[2] },
                  { name: eventState.data.participants[3] },
                ],
              },
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[4] },
                  { name: eventState.data.participants[5] },
                ],
              },
              {
                id: 4,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[6] },
                  { name: eventState.data.participants[7] },
                ],
              },
              {
                id: 5,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[8] },
                  { name: eventState.data.participants[9] },
                ],
              },
              {
                id: 6,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[10] },
                  { name: eventState.data.participants[11] },
                ],
              },
              {
                id: 7,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[12] },
                  { name: eventState.data.participants[13] },
                ],
              },
              {
                id: 8,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[14] },
                  { name: eventState.data.participants[15] },
                ],
              },
            ],
          },
          {
            title: "Round Two",
            seeds: [
              {
                id: 1,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 1" },
                  { name: "Winner of Game 2" },
                ],
              },
              {
                id: 2,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 3" },
                  { name: "Winner of Game 4" },
                ],
              },
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 5" },
                  { name: "Winner of Game 6" },
                ],
              },
              {
                id: 4,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 7" },
                  { name: "Winner of Game 8" },
                ],
              },
            ],
          },
          {
            title: "Semifinals",
            seeds: [
              {
                id: 5,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 9" },
                  { name: "Winner of Game 10" },
                ],
              },
              {
                id: 6,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 11" },
                  { name: "Winner of Game 12" },
                ],
              },
            ],
          },
          {
            title: "Finals",
            seeds: [
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Semifinals 1" },
                  { name: "Winner of Semifinals 2" },
                ],
              },
            ],
          },
        ];
        break;
      case 32:
        rounds = [
          {
            title: "Round One",
            seeds: [
              {
                id: 1,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[0] },
                  { name: eventState.data.participants[1] },
                ],
              },
              {
                id: 2,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[2] },
                  { name: eventState.data.participants[3] },
                ],
              },
              {
                id: 3,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[4] },
                  { name: eventState.data.participants[5] },
                ],
              },
              {
                id: 4,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[6] },
                  { name: eventState.data.participants[7] },
                ],
              },
              {
                id: 5,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[8] },
                  { name: eventState.data.participants[9] },
                ],
              },
              {
                id: 6,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[10] },
                  { name: eventState.data.participants[11] },
                ],
              },
              {
                id: 7,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[12] },
                  { name: eventState.data.participants[13] },
                ],
              },
              {
                id: 8,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[14] },
                  { name: eventState.data.participants[15] },
                ],
              },
              {
                id: 9,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[16] },
                  { name: eventState.data.participants[17] },
                ],
              },
              {
                id: 10,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[18] },
                  { name: eventState.data.participants[19] },
                ],
              },
              {
                id: 11,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[20] },
                  { name: eventState.data.participants[21] },
                ],
              },
              {
                id: 12,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[22] },
                  { name: eventState.data.participants[23] },
                ],
              },
              {
                id: 13,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[24] },
                  { name: eventState.data.participants[25] },
                ],
              },
              {
                id: 14,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[26] },
                  { name: eventState.data.participants[27] },
                ],
              },
              {
                id: 15,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[28] },
                  { name: eventState.data.participants[29] },
                ],
              },
              {
                id: 16,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[30] },
                  { name: eventState.data.participants[31] },
                ],
              },
            ],
          },
          {
            title: "Round Two",
            seeds: [
              {
                id: 17,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[0] },
                  { name: eventState.data.participants[1] },
                ],
              },
              {
                id: 18,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[2] },
                  { name: eventState.data.participants[3] },
                ],
              },
              {
                id: 19,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[4] },
                  { name: eventState.data.participants[5] },
                ],
              },
              {
                id: 20,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[6] },
                  { name: eventState.data.participants[7] },
                ],
              },
              {
                id: 21,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[8] },
                  { name: eventState.data.participants[9] },
                ],
              },
              {
                id: 22,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[10] },
                  { name: eventState.data.participants[11] },
                ],
              },
              {
                id: 23,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[12] },
                  { name: eventState.data.participants[13] },
                ],
              },
              {
                id: 24,
                date: eventState.data.date,
                teams: [
                  { name: eventState.data.participants[14] },
                  { name: eventState.data.participants[15] },
                ],
              },
            ],
          },
          {
            title: "Round Two",
            seeds: [
              {
                id: 25,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 1" },
                  { name: "Winner of Game 2" },
                ],
              },
              {
                id: 26,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 3" },
                  { name: "Winner of Game 4" },
                ],
              },
              {
                id: 27,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 5" },
                  { name: "Winner of Game 6" },
                ],
              },
              {
                id: 28,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 7" },
                  { name: "Winner of Game 8" },
                ],
              },
            ],
          },
          {
            title: "Semifinals",
            seeds: [
              {
                id: 29,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 9" },
                  { name: "Winner of Game 10" },
                ],
              },
              {
                id: 30,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Game 11" },
                  { name: "Winner of Game 12" },
                ],
              },
            ],
          },
          {
            title: "Finals",
            seeds: [
              {
                id: 31,
                date: eventState.data.date,
                teams: [
                  { name: "Winner of Semifinals 1" },
                  { name: "Winner of Semifinals 2" },
                ],
              },
            ],
          },
        ];
        break;
      default:
        rounds = [
          {
            title: "Round one",
            seeds: [
              {
                id: 1,
                date: new Date().toDateString(),
                teams: [
                  { name: eventState.data.participants[0] },
                  { name: eventState.data.participants[1] },
                ],
              },
              {
                id: 2,
                date: new Date().toDateString(),
                teams: [
                  { name: eventState.data.participants[2] },
                  { name: eventState.data.participants[3] },
                ],
              },
            ],
          },
          {
            title: "Finals",
            seeds: [
              {
                id: 3,
                date: new Date().toDateString(),
                teams: [
                  { name: "Winner of Game 1" },
                  { name: "Winner of Game 2" },
                ],
              },
            ],
          },
        ];
        break;
    }

    return rounds;
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
            <Component />
          </Row>
          <Row>
            <div className="event-actions mt-3 d-flex justify-content-end">
              <Button
                color="primary"
                onClick={(event) => handleApply(event.id)}
              >
                Apply
              </Button>
              {userId !== "" && userId === eventState.data.organizerId && (
                <>
                  <Link to={eventState.url}>
                    <Button
                      color="primary"
                      onClick={(event) => handleEdit(event.id)}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    color="danger"
                    onClick={(event) => handleDelete(event.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
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
