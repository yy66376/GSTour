import { Row, Col } from "reactstrap";
import {
  Controller,
  CalendarFill,
  Microsoft,
  Ubuntu,
  Apple,
} from "react-bootstrap-icons";

import "./Game.css";
import { Link } from "react-router-dom";

export default function Game(props) {
  const {
    id,
    headerImageUrl,
    isFree,
    initialPrice,
    finalPrice,
    name,
    windowsSupport,
    linuxSupport,
    macSupport,
    releaseDate,
  } = props;

  let releaseDateFormatted = "Unknown";
  if (releaseDate !== null) {
    releaseDateFormatted = releaseDate.toString();
  }

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  let finalPriceFormatted;
  if (isFree) {
    finalPriceFormatted = <span className="free-game">Free</span>;
  } else if (finalPrice < initialPrice) {
    finalPriceFormatted = (
      <span className="discounted-price">
        {moneyFormatter.format(finalPrice)}
      </span>
    );
  } else {
    finalPriceFormatted = moneyFormatter.format(finalPrice);
  }

  return (
    <Link to={`/Games/${id}`} className="games-listing-item">
      <div className="list-grid-item mt-4">
        <Row>
          {/* Column for game image */}
          <Col sm={4} className="m-4">
            <img
              src={headerImageUrl}
              alt={`${name}`}
              className="img-fluid d-block rounded"
            />
          </Col>

          {/* Column for game name, release date, and platforms */}
          <Col sm={5}>
            {/* Game name */}
            <h5 className="mt-3">{name}</h5>

            {/* Release date */}
            <p>
              <CalendarFill className="me-2" />
              Release Date: {releaseDateFormatted}
            </p>

            {/* Platforms support */}
            <p className="mt-2">
              <Controller className="me-2" />
              Platforms:&nbsp;
              {windowsSupport && <Microsoft className="me-2" />}
              {linuxSupport && <Ubuntu className="me-2" />}
              {macSupport && <Apple className="me-2" />}
            </p>
          </Col>

          {/* Column for game price */}
          <Col className="price-section">
            {/* Initial price */}
            <h6 className="mt-3">Initial Price:</h6>
            <p>
              {isFree && <span className="free-game">Free</span>}
              {!isFree && moneyFormatter.format(initialPrice)}
            </p>

            {/* Current price */}
            <h6 className="mt-2">Current Price:</h6>
            <p>{finalPriceFormatted}</p>
          </Col>
        </Row>
      </div>
    </Link>
  );
}
