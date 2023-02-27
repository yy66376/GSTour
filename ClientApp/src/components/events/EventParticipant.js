import { Person } from "react-bootstrap-icons";
import "./EventParticipant.css";

export default function EventParticipant({ name }) {
  return (
    <li>
      <p className="participant-name">
        <Person /> {name}
      </p>
    </li>
  );
}
