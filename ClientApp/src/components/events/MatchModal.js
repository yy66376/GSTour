import { useState } from "react";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

export default function MatchModal(props) {
  const [matchState, setMatchState] = useState({
    opponent1Score: -1,
    opponent2Score: -1,
    winner: -1,
  });

  const opponent1ScoreChangeHandler = (e) => {
    setMatchState((prev) => {
      return {
        ...prev,
        opponent1Score: e.target.value,
      };
    });
  };

  const opponent2ScoreChangeHandler = (e) => {
    setMatchState((prev) => {
      return {
        ...prev,
        opponent2Score: e.target.value,
      };
    });
  };

  const opponent1WinChangeHandler = (e) => {
    if (e.target.checked) {
      setMatchState((prev) => {
        return { ...prev, winner: 1 };
      });
    }
  };

  const opponent2WinChangeHandler = (e) => {
    if (e.target.checked) {
      setMatchState((prev) => {
        return { ...prev, winner: 2 };
      });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const opponent1 = {
      score: matchState.opponent1Score,
    };
    const opponent2 = {
      score: matchState.opponent2Score,
    };

    if (matchState.winner === 1) {
      opponent1.result = "win";
    } else {
      opponent2.result = "win";
    }
    await props.manager.update.match({
      id: props.matchId,
      opponent1,
      opponent2,
    });

    props.onMatchDetermined();
  };

  return (
    <Modal isOpen={props.isOpen} toggle={props.toggle}>
      <ModalHeader>Declare the winner of this match</ModalHeader>
      <ModalBody>
        <Form id="match-edit-form" className="mt-2" onSubmit={submitHandler}>
          <FormGroup>
            <Label for="opponent-1-score">{props.opponent1Name}: </Label>
            <Input
              type="number"
              id="opponent-1-score"
              onChange={opponent1ScoreChangeHandler}
            />
            <FormFeedback valid>
              Enter the score for {props.opponent1Name}.
            </FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="opponent-2-score">{props.opponent2Name}: </Label>
            <Input
              type="number"
              id="opponent-2-score"
              onChange={opponent2ScoreChangeHandler}
            />
            <FormFeedback valid>
              Enter the score for {props.opponent2Name}.
            </FormFeedback>
          </FormGroup>
          <FormGroup>
            <FormGroup>
              <p className="text-center">Select the Winner:</p>
              <Input
                type="radio"
                id="opponent-1-win"
                name="match-winner"
                value="opponent-1"
                onChange={opponent1WinChangeHandler}
              />{" "}
              <Label for="opponent-1-win">{props.opponent1Name}</Label>
            </FormGroup>
            <FormGroup>
              <Input
                type="radio"
                id="opponent-2-win"
                name="match-winner"
                value="opponent-2"
                onChange={opponent2WinChangeHandler}
              />{" "}
              <Label for="opponent-1-win">{props.opponent2Name}</Label>
            </FormGroup>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          type="submit"
          form="match-edit-form"
          onClick={submitHandler}
        >
          Save
        </Button>
        <Button color="secondary" onClick={props.toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
