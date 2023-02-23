import "./NotificationIcon.css";
import { Bell } from "react-bootstrap-icons";
import { Badge } from "reactstrap";

export default function NotificationIcon(props) {
  const clickHandler = () => {
    props.onClick();
  };

  return (
    <div className="notification-icon position-relative">
      <Bell className="bell-icon" onClick={clickHandler} />
      {props.numUnread !== 0 && (
        <Badge
          id="notification-count"
          className="position-absolute top-0 start-90 translate-middle"
          pill
          color="danger"
        >
          {props.numUnread}
        </Badge>
      )}
    </div>
  );
}
