import "./NotificationItem.css";
import { Link } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";
import { CheckLg, Dot, PencilSquare, XCircleFill } from "react-bootstrap-icons";
import { useState } from "react";
import NotificationDeleteModal from "./NotificationDeleteModal";
import AlertModal from "../games/AlertModal";
import authService from "../api-authorization/AuthorizeService";
import { toast } from "react-toastify";

export default function NotificationItem({ alert, onLink }) {
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const deleteToggle = () => {
    setDeleteModal((prev) => !prev);
  };
  const editToggle = () => {
    setEditModal((prev) => !prev);
  };

  const alertIsRead = (alert) => {
    if (alert.isFulfilled && !alert.read) {
      return "notify-unread";
    }
    return null;
  };

  const alertIsDiscounted = (alert) => {
    return alert.isFulfilled ? "discounted-price" : "";
  };

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const deleteClickHandler = () => {
    setDeleteModal(true);
  };

  const editClickHandler = () => {
    setEditModal(true);
  };

  const readClickHandler = async () => {
    const token = await authService.getAccessToken();
    const response = await fetch(`/api/Alerts/Read/${alert.id}`, {
      headers: !token
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      method: "PATCH",
    });
    if (response.ok) {
      toast.success(`✅ Successfully marked as read. ✅`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      // tell the user that the alert cannot be deleted
      toast.error("🛑 Not able to mark this notificaiton as read. 🛑", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const readStatus = (alert) => {
    if (alert.isFulfilled && !alert.read) {
      return <Dot style={{ color: "dodgerblue" }} />;
    }
    return <Dot style={{ color: "transparent" }} />;
  };

  return (
    <div className={`notify-item ${alertIsRead(alert)}`}>
      <Link
        className="notify-item-link"
        to={`/Games/${alert.game.id}`}
        onClick={onLink}
      >
        <div className="notify-img">
          <img
            class="notify-img-inner"
            src={alert.game.headerImageUrl}
            alt="Game Header"
          />
        </div>

        <div className="notify-info">
          <div className="notify-game-name">{alert.game.name}</div>
          <div className="notify-price-threshold">
            Price Threshold: {moneyFormatter.format(alert.priceThreshold)}
          </div>
          {alert.isFulfilled && (
            <div className="notify-fulfill-date">
              Discounted on:{" "}
              {new Date(alert.fulfillDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
          )}
        </div>

        <div className="notify-price">
          <h6 className="current-price-header">Current:</h6>
          <div className={`current-price ${alertIsDiscounted(alert)}`}>
            {alert.isFulfilled && moneyFormatter.format(alert.fulfilledPrice)}
            {!alert.isFulfilled && moneyFormatter.format(alert.game.finalPrice)}
          </div>
        </div>
      </Link>

      <div className="notify-actions">
        {alert.isFulfilled && !alert.read && (
          <>
            <CheckLg
              id={`notify-read-${alert.id}`}
              className="notify-action notify-read"
              onClick={readClickHandler}
            />
            <UncontrolledTooltip
              placement="top"
              target={`notify-read-${alert.id}`}
            >
              Mark as read
            </UncontrolledTooltip>
          </>
        )}
        <PencilSquare
          id={`notify-edit-${alert.id}`}
          className="notify-action notify-edit"
          onClick={editClickHandler}
        />
        <UncontrolledTooltip placement="top" target={`notify-edit-${alert.id}`}>
          Edit this alert
        </UncontrolledTooltip>
        <AlertModal
          game={alert.game}
          alert={alert}
          edit={true}
          isOpen={editModal}
          toggle={editToggle}
        />
        <XCircleFill
          id={`notify-delete-${alert.id}`}
          className="notify-action notify-delete"
          onClick={deleteClickHandler}
        />
        <UncontrolledTooltip
          placement="top"
          target={`notify-delete-${alert.id}`}
        >
          Delete this alert
        </UncontrolledTooltip>
        <NotificationDeleteModal
          isOpen={deleteModal}
          toggle={deleteToggle}
          alert={alert}
        />
      </div>

      <div className="notify-read-status">{readStatus(alert)}</div>
    </div>
  );
}
