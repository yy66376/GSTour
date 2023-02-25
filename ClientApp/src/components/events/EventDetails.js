import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Event from "./Event";
import { Col, Container, Row } from "reactstrap";
import "./EventDetails.css";
import { CheckCircle, Steam } from "react-bootstrap-icons";

export default function EventDetails() {

    const [eventState, setEventState] = useState({
        data: {},
        loading: true,
        url: "/Events/Edit_Event/",
    });
    const { eventId } = useParams();


    // function for fetching event detail
    const fetchEventDetails = async (id) => {
        const response = await fetch(`api/Events/${id}`);
        let data = null;
        if (response.ok) {
            data = await response.json();
        } else {
            // tell user that event api is down
        }
        return data;
    };

    // load event detail when component updates
    useEffect(() => {
        const populateGameData = async () => {
            const gameResponse = await fetchEventDetails(eventId);
            if (gameResponse !== null) {
                var temp = eventState.url + eventId;
                setEventState({ data: gameResponse, loading: false, url: temp  });
            } else {
                // tell user that event details api is down
            }
        };
        populateGameData();
    }, [eventId]);

    function handleDelete(e) {
        fetch('api/Events/' + eventId, {
            method: 'Delete',
            headers: {
                'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
            },
        })
        console.log(e);
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
                                <p className="m-1"></p>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="1">
                            <div class="track-game d-flex flex-column justify-content-around">
                                <button onClick={(event) => handleDelete(event.id)}>Delete</button>
                            </div>
                        </Col>
                        <Col sm="1">
                            <div class="track-game d-flex flex-column justify-content-around">
                                <a href={eventState.url}><h6 class="text-center">Edit</h6></a>
                            </div>
                        </Col>
                        <Col sm="1">
                            <div class="track-game d-flex flex-column justify-content-around">
                                <h6 class="text-center">Apply</h6>
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