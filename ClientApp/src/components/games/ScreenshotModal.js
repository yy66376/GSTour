import { useState } from "react";
import { Modal } from "reactstrap";

import "./ScreenshotModal.css";

export default function ScreenshotModal(props) {
  const [modal, setModal] = useState(false);
  const toggle = () => {
    setModal((prevModal) => !prevModal);
  };

  return (
    <>
      <img
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        src={props.thumbnailUrl}
        alt={`Screenshot preview`}
        className="screenshot-thumbnail"
        onClick={toggle}
      />
      <Modal
        isOpen={modal}
        toggle={toggle}
        className={props.className}
        contentClassName="screenshot-fullscreen-modal"
      >
        <img src={props.fullUrl} alt="Screenshot Full" />
      </Modal>
    </>
  );
}
