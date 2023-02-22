import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./NotificationDropdown.css";
import NotificationItem from "./NotificationItem";
import { Button, Spinner } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";

export default function NotificationDropdown(props) {
  const [fulfilledNotifs, setFulfilledNotifs] = useState([]);
  const [unfulfilledNotifs, setUnfulfilledNotifs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifsData = async () => {
    const token = await authService.getAccessToken();
    const response = await fetch("/api/Alerts", {
      headers: !token ? {} : { Authorization: `Bearer ${token}` },
    });

    let data = null;
    if (response.ok) {
      data = await response.json();
    }
    return data;
  };

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/notifications")
      .configureLogging(LogLevel.Trace)
      .build();

    const start = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected.");

        connection.on("ReceiveNotification", (notification) => {
          console.log("Receive notification triggered!");
          console.log(notification);
          if (notification.isFulfilled) {
            setFulfilledNotifs((prev) => {
              return [...prev, notification];
            });
          } else {
            setUnfulfilledNotifs((prev) => {
              return [...prev, notification];
            });
          }
        });

        connection.on("DeleteNotification", (notificationId, isFulfilled) => {
          console.log("Delete notification triggered!");
          console.log(typeof notificationId, typeof isFulfilled);
          if (isFulfilled) {
            setFulfilledNotifs((prev) => {
              return prev.filter((notif) => notif.id !== notificationId);
            });
          } else {
            setUnfulfilledNotifs((prev) => {
              return prev.filter((notif) => notif.id !== notificationId);
            });
          }
        });

        connection.on(
          "EditNotification",
          (notificationId, isFulfilled, email, browser, priceThreshold) => {
            console.log("Edit notification triggered!");
            if (isFulfilled) {
              setFulfilledNotifs((prev) => {
                return prev.map((notif) =>
                  notif.id === notificationId
                    ? { ...notif, email, browser, priceThreshold }
                    : notif
                );
              });
            } else {
              setUnfulfilledNotifs((prev) => {
                return prev.map((notif) =>
                  notif.id === notificationId
                    ? { ...notif, email, browser, priceThreshold }
                    : notif
                );
              });
            }
          }
        );
      } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
      }
    };
    connection.onclose(async () => {
      await start();
    });
    start();

    const populateNotifsData = async () => {
      const notifResponse = await fetchNotifsData();
      if (notifResponse) {
        setNotifLoading(false);
        setFulfilledNotifs(notifResponse.filter((notif) => notif.isFulfilled));
        setUnfulfilledNotifs(
          notifResponse.filter((notif) => !notif.isFulfilled)
        );
      } else {
        // tell user that alerts details api is down
      }
    };

    populateNotifsData();
  }, []);

  const noNotifs =
    fulfilledNotifs.length === 0 && unfulfilledNotifs.length === 0;

  const seeGamesButtonClickHandler = () => {
    navigate("/Games");
    props.onToggle();
  };

  const contents = notifLoading ? (
    <>
      <h5 className="text-center">Loading notifications...</h5>
      <Spinner className="notif-loading-spinner mt-3" />
      <h6 className="text-center mt-3">Please wait...</h6>
    </>
  ) : (
    <>
      {noNotifs && (
        <>
          <h5 className="text-center">
            You are not currently tracking any games
          </h5>
          <img
            className="no-notifications-icon mt-3"
            src={process.env.PUBLIC_URL + "/images/sad-robot.png"}
            alt="sad robot"
          />
          <h6 className="text-center mt-3">
            ⬇️ Click the button below to browse and track our games! ⬇️
          </h6>
        </>
      )}
      {fulfilledNotifs.length > 0 && (
        <div className="fulfilled-notifications">
          <div className="notifications-section-header">Discounted Games</div>
          <div className="notifications-section-content">
            {fulfilledNotifs.map((notif) => (
              <NotificationItem key={notif.id} alert={notif} />
            ))}
          </div>
        </div>
      )}
      {unfulfilledNotifs.length > 0 && (
        <div className="unfulfilled-notifications">
          <div className="notifications-section-header">Tracked Games</div>
          <div className="notifications-section-content">
            {unfulfilledNotifs.map((notif) => (
              <NotificationItem key={notif.id} alert={notif} />
            ))}
          </div>
        </div>
      )}
      <div class="notify-footer">
        {noNotifs && (
          <Button color="primary" onClick={seeGamesButtonClickHandler}>
            See Games
          </Button>
        )}
        {!noNotifs && <Button color="primary">See All Tracked Games</Button>}
      </div>
    </>
  );

  return (
    <div className={`notification-dropdown ${props.active}`}>{contents}</div>
  );
}
