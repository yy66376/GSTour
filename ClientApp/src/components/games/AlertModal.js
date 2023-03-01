import { useEffect, useState } from "react";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import authService from "../api-authorization/AuthorizeService";
import "./AlertModal.css";
import { toast } from "react-toastify";

const ValidityState = {
  Neither: 0,
  Valid: 1,
  Invalid: 2,
};

const NotificationState = {
  Default: 0,
  Granted: 1,
  Denied: 2,
};

export default function AlertModal(props) {
  const { game, alert, edit = false } = props;
  const [priceThreshold, setPriceThreshold] = useState(
    edit ? alert.priceThreshold : ""
  );
  const [priceThresholdValid, setPriceThresholdValid] = useState(
    edit ? ValidityState.Valid : ValidityState.Neither
  );
  const [checkboxValid, setCheckboxValid] = useState(
    edit ? ValidityState.Valid : ValidityState.Neither
  );
  const [emailChecked, setEmailChecked] = useState(edit ? alert.email : false);
  const [browserChecked, setBrowserChecked] = useState(
    edit ? alert.browser : false
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    NotificationState.Default
  );

  useEffect(() => {
    switch (Notification.permission) {
      case "granted":
        setNotificationEnabled(NotificationState.Granted);
        break;
      case "denied":
        setNotificationEnabled(NotificationState.Denied);
        break;
      default:
        setNotificationEnabled(NotificationState.Default);
        break;
    }

    if (edit) {
      setPriceThreshold(alert.priceThreshold);
      setEmailChecked(alert.email);
      setBrowserChecked(alert.browser);

      setPriceThresholdValid(ValidityState.Valid);
      setCheckboxValid(ValidityState.Valid);
    } else {
      setPriceThreshold("");
      setEmailChecked(false);
      setBrowserChecked(false);

      setPriceThresholdValid(ValidityState.Neither);
      setCheckboxValid(ValidityState.Neither);
    }
  }, [edit, alert]);

  const priceThresholdValidate = (event) => {
    const value = parseFloat(event.target.value);
    setPriceThreshold(event.target.value);
    if (isNaN(value) || value < 0 || value >= game.finalPrice) {
      setPriceThresholdValid(ValidityState.Invalid);
    } else {
      setPriceThresholdValid(ValidityState.Valid);
    }
  };

  const emailChangeHandler = (event) => {
    setEmailChecked(event.target.checked);
    if (!event.target.checked && !browserChecked) {
      setCheckboxValid(ValidityState.Invalid);
    } else {
      setCheckboxValid(ValidityState.Valid);
    }
  };

  const browserChangeHandler = async (event) => {
    if (
      notificationEnabled === NotificationState.Default &&
      event.target.checked
    ) {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        console.log("Notification permission granted");
        setNotificationEnabled(NotificationState.Granted);
        event.target.checked = true;
      } else if (result === "denied") {
        console.log("Notification permission denied");
        setNotificationEnabled(NotificationState.Denied);
      } else {
        console.log("Notification permission default");
      }
    }
    setBrowserChecked(event.target.checked);
    if (!event.target.checked && !emailChecked) {
      setCheckboxValid(ValidityState.Invalid);
    } else {
      setCheckboxValid(ValidityState.Valid);
    }
  };

  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const submitHandler = async (event) => {
    event.preventDefault();

    const data = {
      id: edit ? alert.id : 0,
      gameId: game.id,
      priceThreshold,
      email: emailChecked,
      browser: browserChecked,
    };

    const token = await authService.getAccessToken();
    if (edit) {
      const response = await fetch(`/api/Alerts/${alert.id}`, {
        headers: !token
          ? { "Content-Type": "application/json" }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        props.toggle();
        toast.success(`✅ Changes saved. ✅`, {
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
        toast.error("🛑 Changes not saved. API is not responding. 🛑", {
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
    } else {
      const response = await fetch("/api/Alerts", {
        headers: !token
          ? { "Content-Type": "application/json" }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        props.toggle();
        toast.success(`🎉 ${game.name} is now being tracked! 🎉`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });

        // Reset form data on successful post
        setPriceThreshold("");
        setEmailChecked(false);
        setBrowserChecked(false);

        setCheckboxValid(ValidityState.Neither);
        setPriceThresholdValid(ValidityState.Neither);
      } else {
        // tell the user that the alert cannot be added
        toast.error("😔 Currently not able to track this game!", {
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
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.toggle}
      className={props.className}
      style={{ width: "500px" }}
    >
      <ModalHeader>Track {game.name}</ModalHeader>
      <ModalBody>
        <img
          src={game.headerImageUrl}
          alt={game.name}
          className="img-fluid d-block rounded"
        />
        <Form id="game-alert-form" className="mt-2" onSubmit={submitHandler}>
          <FormGroup>
            <Label for="price-threshold-input">Price Threshold</Label>
            <div class="dollar">
              <Input
                name="price-threshold"
                id="price-threshold-input"
                type="number"
                step={0.01}
                onChange={priceThresholdValidate}
                value={priceThreshold}
                valid={priceThresholdValid === ValidityState.Valid}
                invalid={priceThresholdValid === ValidityState.Invalid}
              />
              <FormFeedback invalid>
                Invalid price. Price threshold must be ≥ 0 and &lt; game's
                current price ({moneyFormatter.format(game.finalPrice)})
              </FormFeedback>
              <FormFeedback valid>Valid price</FormFeedback>
            </div>
            <FormText>
              We will notify you when the game's price is ≤ this threshold.
            </FormText>
          </FormGroup>

          <FormGroup>
            <Label className="me-2" for="email-input">
              Email
            </Label>
            <Input
              name="email"
              id="email-input"
              type="checkbox"
              checked={emailChecked}
              onChange={emailChangeHandler}
              valid={checkboxValid === ValidityState.Valid}
              invalid={checkboxValid === ValidityState.Invalid}
            />
            <br />
            <FormText>Check this if you want to be alerted via email</FormText>

            {"Notification" in window && (
              <>
                <br />
                <br />
                <Label className="me-2" for="browser-input">
                  Browser
                </Label>
                <Input
                  name="browser"
                  id="browser-input"
                  type="checkbox"
                  checked={browserChecked}
                  disabled={notificationEnabled === NotificationState.Denied}
                  onChange={browserChangeHandler}
                  valid={checkboxValid === ValidityState.Valid}
                  invalid={checkboxValid === ValidityState.Invalid}
                />
                <br />
                <FormText>
                  {Notification.permission !== "denied" &&
                    "Check this if you want to be alerted via browser"}
                  {Notification.permission === "denied" &&
                    "You must enable browser notifications to use this option"}
                </FormText>
              </>
            )}
            <FormFeedback>
              You must select one or two of the notification methods
            </FormFeedback>
            <FormFeedback valid>Notification method(s) selected</FormFeedback>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          disabled={
            checkboxValid !== ValidityState.Valid ||
            priceThresholdValid !== ValidityState.Valid
          }
          type="submit"
          form="game-alert-form"
        >
          {edit ? "Save Changes" : "Create Alert"}
        </Button>
        <Button color="secondary" onClick={props.toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
