import "./SearchResult.css";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";

export default function SearchResult({ category, item, onClick }) {
  let price;
  if (item.isFree) {
    price = <span className="free-game">Free</span>;
  } else if (item.finalPrice !== null && item.finalPrice !== undefined) {
    const moneyFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    price = moneyFormatter.format(item.finalPrice);
  } else {
    price = "Unknown";
  }

  let date;
  if (item.date !== undefined) {
    date = new Date(item.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    });
  }

  return (
    <Link
      className="search-results-link"
      to={`/${category}/${item.id}`}
      onClick={onClick}
    >
      <Row className="search-results-item">
        {/* Search Result Image */}
        <Col sm={3} className="m-1">
          <img
            src={item.headerImageUrl}
            alt={`${item.name}`}
            className="search-result-item-image img-fluid, d-block rounded"
          />
        </Col>

        {/* Name and price/date */}
        <Col className="game-name-price-col">
          <h6 className="search-results-game-name mt-2">{item.name}</h6>
          {category === "Games" && <h6 className="mt-2">{price}</h6>}
          {category === "Events" && <h6 className="mt-2">{date}</h6>}
        </Col>
      </Row>
    </Link>
  );
}
