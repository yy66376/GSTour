import "./NotificationItem.css";
import { Link } from "react-router-dom";
import { Form, UncontrolledTooltip } from "reactstrap";
import { CheckLg, Dot, PencilSquare, XCircleFill } from "react-bootstrap-icons";
import { useState } from "react";
import NotificationDeleteModal from "./NotificationDeleteModal";
import AlertModal from "../games/AlertModal";

export default function NotificationItem({ alert }) {
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const deleteToggle = () => {
    setDeleteModal((prev) => !prev);
  };
  const editToggle = () => {
    setEditModal((prev) => !prev);
  };

  const alertIsRead = (alert) => {
    if (alert.isFulfilled && alert.read) {
      return "notify_unread";
    }
    return null;
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

  const readOrEditLink = (alert) => {
    if (alert.isFulfilled && !alert.read) {
      return (
        <Form>
          <CheckLg
            id={`notify-read-${alert.id}`}
            className="notify-action notify-read"
          />
          <UncontrolledTooltip
            placement="top"
            target={`notify-read-${alert.id}`}
          >
            Mark as read
          </UncontrolledTooltip>
        </Form>
      );
    }
    return (
      <>
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
      </>
    );
  };

  const readStatus = (alert) => {
    if (alert.isFulfilled && !alert.read) {
      return <Dot style={{ color: "dodgerblue" }} />;
    }
    return <Dot style={{ color: "transparent" }} />;
  };

  return (
    <div className={`notify-item ${alertIsRead(alert)}`}>
      <Link className="notify-item-link" to={`/Games/${alert.game.id}`}>
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
            <div className="notify-fullfill-date">
              Discounted on: {alert.fulfillDate}
            </div>
          )}
        </div>

        <div className="notify-price">
          <h6 className="current-price-header">Current:</h6>
          <div className="current-price">
            {alert.isFulfilled && moneyFormatter(alert.fulfilledPrice)}
            {!alert.isFulfilled && moneyFormatter.format(alert.game.finalPrice)}
          </div>
        </div>
      </Link>

      <div className="notify-actions">
        {readOrEditLink(alert)}
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
