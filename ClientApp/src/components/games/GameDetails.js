import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Game from "./Game";
import { Col, Container, Row } from "reactstrap";
import "./GameDetails.css";
import { CheckCircle, Steam } from "react-bootstrap-icons";

export default function GameDetails() {
  const [gameState, setGameState] = useState({
    data: {},
    loading: true,
  });
  const { gameId } = useParams();

  // function for fetching game detail
  const fetchGameDetails = async (id) => {
    const response = await fetch(`api/Games/${id}`);
    let data = null;
    if (response.ok) {
      data = await response.json();
    } else {
      // tell user that game api is down
    }
    return data;
  };

  // load game detail when component updates
  useEffect(() => {
    const populateGameData = async () => {
      const gameResponse = await fetchGameDetails(gameId);
      if (gameResponse !== null) {
        setGameState({ data: gameResponse, loading: false });
      } else {
        // tell user that game details api is down
      }
    };
    populateGameData();
  }, [gameId]);

  // Metacritic score attribute
  const metaScoreAttribute = (score) => {
    if (!score) {
      return "metacritic-unknown";
    } else if (score < 50) {
      return "metacritic-red";
    } else if (score < 75) {
      return "metacritic-yellow";
    } else {
      return "metacritic-green";
    }
  };

  const metaScoreComponent = (game) => (
    <div
      className={`d-flex justify-content-center align-items-center ${metaScoreAttribute(
        game.metacriticScore
      )}`}
    >
      {game.metacriticScore === null ? "?" : game.metacriticScore}
    </div>
  );

  const renderGame = (game) => {
    return (
      <>
        <Game {...game} />
        <Container className="mt-4 p-0">
          <Row>
            <Col sm={6}>
              {/* short description */}
              <div id="game-short-description">
                <p className="m-1">{game.shortDescription}</p>
              </div>

              <div className="d-flex justify-content-between">
                {/* Metascore */}
                <div className="metacritic-reviews d-flex flex-column justify-content-around">
                  <h5 className="text-center">Metascore</h5>

                  {game.metacriticUrl && (
                    <a
                      href={game.metacriticUrl ? game.metacriticUrl : "#"}
                      className="metascore d-flex justify-content-center"
                    >
                      {metaScoreComponent(game)}
                    </a>
                  )}
                  {!game.metacriticUrl && (
                    <div className="metascore d-flex justify-content-center">
                      {metaScoreComponent(game)}
                    </div>
                  )}
                </div>

                {/* Purchase on Steam */}
                <div className="purchase-on-steam d-flex flex-column justify-content-around">
                  <a
                    id="steam-purchase-link"
                    href={`https://store.steampowered.com/app/${game.steamId}`}
                  >
                    <h5 class="text-center">
                      Purchase on <Steam />
                    </h5>
                  </a>
                </div>

                {/* Tracking the game */}
                <div class="track-game d-flex flex-column justify-content-around">
                  <h5 class="text-center">Track This Game</h5>
                  <h5 class="text-center">
                    <CheckCircle />
                  </h5>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </>
    );
  };

  const contents = gameState.loading ? (
    <p>
      <em>Loading...</em>
    </p>
  ) : (
    renderGame(gameState.data)
  );

  return <>{contents}</>;
}
