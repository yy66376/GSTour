import { useState } from "react";
import { Modal } from "reactstrap";

import "./MovieModal.css";

export default function MovieModal(props) {
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
        alt={`Movie preview`}
        className="movie-thumbnail"
        onClick={toggle}
      />
      <Modal
        isOpen={modal}
        toggle={toggle}
        className={props.className}
        contentClassName="movie-fullscreen-modal"
      >
        <video controls>
          <source src={props.maxVideoUrl} type="video/mp4" />
          <source src={props.maxVideoWebmUrl} type="video/webm" />
        </video>
      </Modal>
    </>
  );
}
