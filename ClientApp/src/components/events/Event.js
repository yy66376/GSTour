import { Row, Col } from "reactstrap";
import {
  CalendarFill,
  PersonFill,
  GeoAltFill,
  PeopleFill,
} from "react-bootstrap-icons";

import "./Event.css";
import { Link } from "react-router-dom";

export default function Event(props) {
  const {
    id,
    name,
    date,
    location,
    organizerName,
    headerImageUrl,
    firstRoundGameCount,
  } = props;

  let dateFormatted = "Unknown";
  if (date !== null) {
    dateFormatted = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    });
  }

  return (
    <Link to={`/Events/${id}`} className="games-listing-item">
      <div className="list-grid-item mt-4">
        <Row>
          {/* Column for game image */}
          <Col sm={4} className="m-4">
            <img
              src={headerImageUrl}
              alt={`${headerImageUrl}`}
              className="img-fluid d-block rounded"
            />
          </Col>

          {/* Column for evemt name, organizer, event date, location, and max number of participants/teams */}
          <Col sm={5}>
            {/* Event name */}
            <h5 className="mt-3">{name}</h5>

            {/* Organizer */}
            <p>
              <PersonFill className="me-2" />
              Organizer: {organizerName}
            </p>

            {/* Event date */}
            <p>
              <CalendarFill className="me-2" />
              Date: {dateFormatted}
            </p>

            {/* Location */}
            <p className="mt-2">
              <GeoAltFill className="me-2" />
              Location: {location}
            </p>

            {/* Max number of aprticipants/teams */}
            <p className="mt-2">
              <PeopleFill className="me-2" />
              Number of Participants/Teams: {firstRoundGameCount}
            </p>
          </Col>
        </Row>
      </div>
    </Link>
  );
}
