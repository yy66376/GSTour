import "./SearchResult.css";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";

export default function SearchResult({ item, onClick }) {
  let price;
  if (item.isFree) {
    price = <span className="free-game">Free</span>;
  } else if (item.finalPrice !== null) {
    const moneyFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    price = moneyFormatter.format(item.finalPrice);
  } else {
    price = "Unknown";
  }
  return (
    <Link
      className="search-results-link"
      to={`/Games/${item.id}`}
      onClick={onClick}
    >
      <Row className="search-results-item">
        {/* Game Image */}
        <Col sm={3} className="m-1">
          <img
            src={item.headerImageUrl}
            alt={`${item.name}`}
            className="search-result-game-image img-fluid, d-block rounded"
          />
        </Col>

        {/* Name and price */}
        <Col className="game-name-price-col">
          <h6 className="search-results-game-name mt-2">{item.name}</h6>
          <h6 className="mt-2">{price}</h6>
        </Col>
      </Row>
    </Link>
  );
}
