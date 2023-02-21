import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Game from "./Game";
import { Col, Container, Row } from "reactstrap";
import "./GameDetails.css";
import { CheckCircle, EmojiFrownFill, Steam } from "react-bootstrap-icons";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ScreenshotModal from "./ScreenshotModal";
import MovieModal from "./MovieModal";
import authService from "../api-authorization/AuthorizeService";
import {
  ApplicationPaths,
  QueryParameterNames,
} from "../api-authorization/ApiAuthorizationConstants";
import AlertModal from "./AlertModal";

export default function GameDetails() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    data: {},
    loading: true,
  });
  const [alert, setAlert] = useState({});
  const [alertModal, setAlertModal] = useState(false);
  const { gameId } = useParams();

  // function for fetching game detail
  const fetchGameDetails = async (gameId) => {
    const response = await fetch(`api/Games/${gameId}`);
    let data = null;
    if (response.ok) {
      data = await response.json();
    }
    return data;
  };

  // function for fetching alert associated with this game
  const fetchAlertForGame = async (gameId) => {
    
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

  const metaScoreInner = (game) => {
    return (
      <div
        className={`d-flex justify-content-center align-items-center ${metaScoreAttribute(
          game.metacriticScore
        )}`}
      >
        {game.metacriticScore === null ? "?" : game.metacriticScore}
      </div>
    );
  };

  const metaScoreOuter = (game) => {
    const classes = "metascore d-flex justify-content-center";
    if (game.metacriticUrl) {
      return (
        <a href={game.metacriticUrl} className={classes}>
          {metaScoreInner(game)}
        </a>
      );
    }
    return <div className={classes}>{metaScoreInner(game)}</div>;
  };

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const movies = (game) => {
    if (game.movies.length !== 0) {
      return (
        <Carousel
          showDots={true}
          ssr={true}
          infinite={true}
          keyBoardControl={true}
          containerClass="movie-carousel"
          partialVisbile
          itemClass="movie-item"
          dotListClass="custom-dot-list-style"
          responsive={responsive}
        >
          {game.movies.map((movie, index) => {
            return (
              <MovieModal
                key={movie.id}
                thumbnailUrl={movie.thumbnailUrl}
                maxVideoUrl={movie.maxVideoUrl}
              />
            );
          })}
        </Carousel>
      );
    }
    return (
      <>
        <h5 className="text-center">
          {game.name} does not contain any promotional trailers
        </h5>
        <h4 className="text-center">
          <EmojiFrownFill />
        </h4>
      </>
    );
  };

  const screenshots = (game) => {
    if (game.screenshots.length !== 0) {
      return (
        <Carousel
          showDots={true}
          ssr={true}
          infinite={true}
          keyBoardControl={true}
          containerClass="screenshot-carousel"
          partialVisbile
          itemClass="image-item"
          dotListClass="custom-dot-list-style"
          responsive={responsive}
        >
          {game.screenshots.map((screenshot, index) => {
            return (
              <ScreenshotModal
                key={screenshot.id}
                thumbnailUrl={screenshot.thumbnailUrl}
                fullUrl={screenshot.fullUrl}
              />
            );
          })}
        </Carousel>
      );
    }
    return (
      <>
        <h5 className="text-center">
          {game.name} does not contain any screenshots
        </h5>
        <h4 className="text-center">
          <EmojiFrownFill />
        </h4>
      </>
    );
  };

  const modalClickHandler = async () => {
    if (await authService.isAuthenticated()) {
      // show modal
      setAlertModal(true);
    } else {
      // redirect to login page
      const returnUrl = window.location.href;
      console.log(returnUrl);
      const redirectUrl = `${ApplicationPaths.Login}?${
        QueryParameterNames.ReturnUrl
      }=${encodeURIComponent(returnUrl)}`;
      navigate(redirectUrl);
    }
  };

  const toggle = () => {
    setAlertModal((prevModal) => !prevModal);
  };

  const renderGame = (game) => {
    return (
      <>
        <AlertModal isOpen={alertModal} toggle={toggle} game={game} />
        <Game {...game} />
        <Container className="mt-4 p-0">
          <Row>
            <Col sm={6}>
              {/* short description */}
              <div id="game-short-description">
                <p className="m-1 text-center">
                  {console.log(game.screenshots.length)}
                  {game.shortDescription
                    ? game.shortDescription
                    : "No Description Provided."}
                </p>
              </div>
            </Col>
            <Col sm={6}>
              <div className="d-flex justify-content-between">
                {/* Metascore */}
                <div className="metacritic-reviews d-flex flex-column justify-content-around">
                  <h5 className="text-center">Metascore</h5>
                  {metaScoreOuter(game)}
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
                <div
                  class="track-game d-flex flex-column justify-content-around"
                  onClick={modalClickHandler}
                >
                  <h5 class="text-center">Track This Game</h5>
                  <h5 class="text-center">
                    <CheckCircle />
                  </h5>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="mt-4">
            <div className="media-section">
              <h5 className="mb-3 text-center">Screenshots</h5>
              {screenshots(game)}
            </div>
          </Row>

          <Row className="mt-4">
            <div className="media-section">
              <h5 className="mb-3 text-center">Trailers</h5>
              {movies(game)}
            </div>
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
