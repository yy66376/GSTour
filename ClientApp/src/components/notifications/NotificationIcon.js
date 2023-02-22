import "./NotificationIcon.css";
import { Bell } from "react-bootstrap-icons";

export default function NotificationIcon(props) {
  const clickHandler = () => {
    props.onClick();
  };

  return (
    <div className="notification-icon">
      <Bell className="bell-icon" onClick={clickHandler} />
    </div>
  );
}
