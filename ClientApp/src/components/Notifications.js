import { useState } from "react";
import "./Notifications.css";
import NotificationDropdown from "./notifications/NotificationDropdown";
import NotificationIcon from "./notifications/NotificationIcon";

export default function Notifications() {
  const [toggle, setToggle] = useState(false);

  const toggleHandler = () => {
    setToggle((prevToggle) => !prevToggle);
  };

  return (
    <div className="notification-wrap">
      <NotificationIcon onClick={toggleHandler} />
      <NotificationDropdown
        active={toggle ? "active" : ""}
        onToggle={toggleHandler}
      />
    </div>
  );
}
