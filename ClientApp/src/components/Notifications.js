import { useEffect, useState } from "react";
import authService from "./api-authorization/AuthorizeService";
import "./Notifications.css";
import NotificationDropdown from "./notifications/NotificationDropdown";
import NotificationIcon from "./notifications/NotificationIcon";

export default function Notifications() {
  const [toggle, setToggle] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [numUnread, setNumUnread] = useState(0);

  const toggleHandler = () => {
    setToggle((prevToggle) => !prevToggle);
  };

  const changeNumUnreadHandler = (newNum) => {
    setNumUnread(newNum);
  };

  const decrementNumUnreadHandler = () => {
    setNumUnread((prev) => prev - 1);
  };

  useEffect(() => {
    const authFunction = async () => {
      setAuthenticated(await authService.isAuthenticated());
    };
    authFunction();
  }, []);

  return (
    <>
      {authenticated && (
        <div className="notification-wrap">
          <NotificationIcon onClick={toggleHandler} numUnread={numUnread} />
          <NotificationDropdown
            active={toggle ? "active" : ""}
            onToggle={toggleHandler}
            onNumUnread={changeNumUnreadHandler}
            onRead={decrementNumUnreadHandler}
          />
        </div>
      )}
    </>
  );
}
