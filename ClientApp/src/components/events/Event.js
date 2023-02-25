import { Row, Col } from "reactstrap";
import {
    Controller,
    CalendarFill,
    PersonFill,
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
        headerImageUrl
    } = props;

    let dateFormatted = "Unknown";
    if (date !== null) {
        dateFormatted = date.toString();
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

                    {/* Column for game name, release date, and platforms */}
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
                            <Controller className="me-2" />
                            Location: {location}
                        </p>
                    </Col>
                </Row>
            </div>
        </Link>
    );
}