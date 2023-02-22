import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import authService from "../api-authorization/AuthorizeService";

export default function NotificationDeleteModal(props) {
  const yesClickHandler = async () => {
    const token = await authService.getAccessToken();
    const response = await fetch(`/api/Alerts/${props.alert.id}`, {
      headers: !token
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      method: "DELETE",
    });
    if (response.ok) {
      props.toggle();
      toast.success(
        `✅ ${props.alert.game.name} is no longer being tracked. ✅`,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      console.log("Finished calling toast");
    } else {
      // tell the user that the alert cannot be deleted
      toast.error("🛑 Not able to delete this alert. 🛑", {
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

  return (
    <>
      <Modal isOpen={props.isOpen} toggle={props.toggle}>
        <ModalHeader>Stop Tracking {props.alert.game.name}</ModalHeader>
        <ModalBody>
          <img
            src={props.alert.game.headerImageUrl}
            alt={props.alert.game.name}
            className="img-fluid d-block rounded m-auto"
          />
          <p className="text-center mt-3" style={{ fontSize: "1.5em" }}>
            Are you sure you want to stop tracking this game?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={yesClickHandler}>
            Yes
          </Button>
          <Button color="secondary" onClick={props.toggle}>
            No
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
