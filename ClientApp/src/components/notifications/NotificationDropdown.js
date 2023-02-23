import React, { useState, useEffect } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./NotificationDropdown.css";
import NotificationItem from "./NotificationItem";
import { Button, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import authService from "../api-authorization/AuthorizeService";

export default function NotificationDropdown(props) {
  const [notifications, setNotifications] = useState({
    loading: true,
    fulfilled: [],
    unfulfilled: [],
  });
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
      .withUrl("/hubs/notifications", {
        accessTokenFactory: () => authService.getAccessToken(),
      })
      .configureLogging(LogLevel.Trace)
      .build();

    const start = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected.");

        connection.on("ReceiveNotification", (notification) => {
          console.log("Receive notification triggered!");
          if (notification.isFulfilled) {
            setNotifications((prev) => {
              return {
                ...prev,
                fulfilled: [notification, ...prev.fulfilled],
              };
            });
          } else {
            console.log("Adding unfulfilled notification");
            setNotifications((prev) => {
              return {
                ...prev,
                unfulfilled: [notification, ...prev.unfulfilled],
              };
            });
          }
        });

        connection.on("DeleteNotification", (notificationId, isFulfilled) => {
          console.log("Delete notification triggered!");
          console.log(typeof notificationId, typeof isFulfilled);
          if (isFulfilled) {
            setNotifications((prev) => {
              return {
                ...prev,
                fulfilled: prev.fulfilled.filter(
                  (notif) => notif.id !== notificationId
                ),
              };
            });
          } else {
            setNotifications((prev) => {
              return {
                ...prev,
                unfulfilled: prev.unfulfilled.filter(
                  (notif) => notif.id !== notificationId
                ),
              };
            });
          }
        });

        connection.on(
          "EditNotification",
          (notificationId, isFulfilled, email, browser, priceThreshold) => {
            console.log("Edit notification triggered!");
            if (isFulfilled) {
              // move fulfilled notification to unfulfilled
              setNotifications((prev) => {
                const oldNotif = prev.fulfilled.find(
                  (notif) => notif.id === notificationId
                );
                const updatedNotif = {
                  ...oldNotif,
                  email,
                  browser,
                  priceThreshold,
                  isFulfilled: false,
                  fulfillDate: null,
                  fulfilledPrice: null,
                  read: false,
                };
                if (!oldNotif.read) {
                  props.onRead();
                }
                return {
                  ...prev,
                  fulfilled: prev.fulfilled.filter(
                    (notif) => notif.id !== notificationId
                  ),
                  unfulfilled: [updatedNotif, ...prev.unfulfilled],
                };
              });
            } else {
              setNotifications((prev) => {
                return {
                  ...prev,
                  unfulfilled: prev.unfulfilled.map((notif) =>
                    notif.id === notificationId
                      ? { ...notif, email, browser, priceThreshold }
                      : notif
                  ),
                };
              });
            }
          }
        );

        connection.on("ReadNotification", (notificationId) => {
          console.log("Read notification triggered!");
          setNotifications((prev) => {
            return {
              ...prev,
              fulfilled: prev.fulfilled.map((notif) =>
                notif.id === notificationId ? { ...notif, read: true } : notif
              ),
            };
          });
          props.onRead();
        });

        connection.on(
          "FulfillNotification",
          (notificationId, fulfilledPrice, fulfillDate) => {
            console.log("Fulfill notification triggered!");
            setNotifications((prev) => {
              // move unfulfilled notification to fulfilled
              const oldNotif = prev.unfulfilled.find(
                (notif) => notif.id === notificationId
              );
              const updatedNotif = {
                ...oldNotif,
                isFulfilled: true,
                fulfillDate,
                fulfilledPrice,
              };
              props.onFulfill();
              return {
                ...prev,
                unfulfilled: prev.unfulfilled.filter(
                  (notif) => notif.id !== notificationId
                ),
                fulfilled: [updatedNotif, ...prev.fulfilled],
              };
            });
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
        setNotifications((prev) => {
          return {
            ...prev,
            loading: false,
            fulfilled: notifResponse.filter((notif) => notif.isFulfilled),
            unfulfilled: notifResponse.filter((notif) => !notif.isFulfilled),
          };
        });
        props.onNumUnread(
          notifResponse.filter((notif) => notif.isFulfilled && !notif.read)
            .length
        );
      } else {
        // tell user that alerts details api is down
      }
    };

    populateNotifsData();
  }, []);

  const noNotifs =
    notifications.fulfilled.length === 0 &&
    notifications.unfulfilled.length === 0;

  const seeGamesButtonClickHandler = () => {
    navigate("/Games");
    props.onToggle();
  };

  const linkClickHandler = () => {
    props.onToggle();
  };

  const contents = notifications.loading ? (
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
      {notifications.fulfilled.length > 0 && (
        <div className="fulfilled-notifications">
          <div className="notifications-section-header">Discounted Games</div>
          <div className="notifications-section-content">
            {notifications.fulfilled.map((notif) => (
              <NotificationItem
                key={notif.id}
                alert={notif}
                onLink={linkClickHandler}
              />
            ))}
          </div>
        </div>
      )}
      {notifications.unfulfilled.length > 0 && (
        <div className="unfulfilled-notifications">
          <div className="notifications-section-header">Tracked Games</div>
          <div className="notifications-section-content">
            {notifications.unfulfilled.map((notif) => (
              <NotificationItem
                key={notif.id}
                alert={notif}
                onLink={linkClickHandler}
              />
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
        {/* {!noNotifs && <Button color="primary">See All Tracked Games</Button>} */}
      </div>
    </>
  );

  return (
    <div className={`notification-dropdown ${props.active}`}>{contents}</div>
  );
}
