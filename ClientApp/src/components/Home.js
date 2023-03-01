import React, { Component, useEffect, useState } from "react";
import { PinMap } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
} from "reactstrap";
import "./Home.css";

export function Home() {
  const [gameState, setGameState] = useState({
    data: {},
    loading: true,
  });
  const [eventState, setEventState] = useState({
    data: {},
    loading: true,
  });

  useEffect(() => {
    const populateGameData = async () => {
      const response = await fetch("api/Games?sort=date_desc&pageSize=8");
      if (response.ok) {
        setGameState({ data: await response.json(), loading: false });
      } else {
        toast.error("🛑 Unable to contact Games API. 🛑", {
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
    const populateEventData = async () => {
      const response = await fetch("api/Events?sort=date_desc&pageSize=8");
      if (response.ok) {
        setEventState({ data: await response.json(), loading: false });
      } else {
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

    populateGameData();
    populateEventData();
  }, []);

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const gameIsDiscounted = (game) => {
    if (game.finalPrice < game.initialPrice) {
      return "discounted-game-price";
    }
  };

  const renderGameCards = (games) => {
    return (
      <>
        <h4 className="mt-5">New Game Releases</h4>
        <Row className="new-release-game-section">
          {games.map((game) => {
            return (
              <Col key={game.id} sm={3}>
                <Link to={`/Games/${game.id}`} className="card-link">
                  <Card className="new-release-game mt-3 mx-2">
                    <img
                      src={game.headerImageUrl}
                      className="img-fluid"
                      alt={game.name}
                    />
                    <CardBody>
                      <CardTitle className="new-release-game-name">
                        {game.name}
                      </CardTitle>
                      <CardText
                        className={`new-release-game-price ${gameIsDiscounted(
                          game
                        )}`}
                      >
                        {moneyFormatter.format(game.finalPrice)}
                      </CardText>
                    </CardBody>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
        <div className="d-flex justify-content-center mt-5">
          <Link to="/Games?sort=date_desc">
            <Button outline color="primary">
              See All New Game Releases
            </Button>
          </Link>
        </div>
      </>
    );
  };

  const renderEventCards = (events) => {
    return (
      <>
        <h4 className="mt-5">New Events/Tournaments</h4>
        <Row className="new-events-section">
          {events.map((event) => {
            return (
              <Col key={event.id} sm={3}>
                <Link to={`/Events/${event.id}`} className="card-link">
                  <Card className="new-event mt-3 mx-2">
                    <img
                      src={event.headerImageUrl}
                      className="img-fluid"
                      alt={event.name}
                    />
                    <CardBody>
                      <CardTitle className="new-event-name text-nowrap overflow-hidden">
                        {event.name}
                      </CardTitle>
                      <CardText className="new-event-location">
                        <PinMap />
                        &nbsp;&nbsp;
                        {event.location}
                      </CardText>
                    </CardBody>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
        <div className="d-flex justify-content-center mt-5 mb-5">
          <Link to="/Events?sort=date_desc">
            <Button outline color="primary">
              See All New Events/Tournaments
            </Button>
          </Link>
        </div>
      </>
    );
  };

  return (
    <>
      <h1 className="text-center">Welcome to GSTour!</h1>
      <h5 className="text-center">
        Your one stop shop for discounted Steam games and tournaments
      </h5>
      <img
        src={`${process.env.PUBLIC_URL}/images/logo.jpg`}
        className="img-fluid m-auto d-block"
        alt="logo"
        style={{ width: "55%", paddingTop: "100px", paddingBottom: "100px" }}
      />
      <h5 className="text-center">
        Feel free to browse our catalogue of Steam games with prices updated
        daily!
      </h5>

      {!gameState.loading && renderGameCards(gameState.data.games)}
      {!eventState.loading && renderEventCards(eventState.data.events)}
    </>
  );
}
