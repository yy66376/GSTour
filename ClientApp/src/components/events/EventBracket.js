import { useEffect, useState } from "react";
import MatchModal from "./MatchModal";
import authService from "../api-authorization/AuthorizeService";

export default function EventBracket({ event, manager }) {
  const [matchModal, setMatchModal] = useState(false);
  const [matchTitle, setMatchTitle] = useState("");
  const [matchId, setMatchId] = useState(-1);
  const [opponent1Name, setOpponent1Name] = useState("");
  const [opponent2Name, setOpponent2Name] = useState("");
  const [userId, setUserId] = useState("");

  const showMatchModal = () => {
    if (userId === event.organizerId) {
      setMatchModal(true);
    }
  };

  const hideMatchModal = () => {
    setMatchModal(false);
  };

  const renderBracket = (data) => {
    document.getElementById("event-bracket-container").innerHTML = "";
    window.bracketsViewer.render({
      stages: data.stage,
      matches: data.match,
      matchGames: data.match_game,
      participants: data.participant,
    });
  };

  useEffect(() => {
    const render = async () => {
      await manager.create({
        name: event.name,
        tournamentId: event.id,
        type: "single_elimination",
        seeding: event.participants,
      });

      const data = manager.get.storage.data;

      renderBracket(data);
    };

    const populateUser = async () => {
      if (await authService.isAuthenticated()) {
        setUserId((await authService.getUser()).sub);
      }
    };

    populateUser();
    render();
  }, [event.name, event.id, event.participants, manager]);

  window.bracketsViewer.onMatchClicked = async (match) => {
    setOpponent1Name(
      manager.storage.data.participant[parseInt(match.opponent1.id)].name
    );
    setOpponent2Name(
      manager.storage.data.participant[parseInt(match.opponent2.id)].name
    );
    setMatchTitle(matchTitle);
    setMatchId(match.id);
    showMatchModal();
  };

  const matchDetermineHandler = async () => {
    hideMatchModal();
    const data = manager.get.storage.data;
    renderBracket(data);

    const exportData = await manager.export();
    console.log(JSON.stringify(exportData));
  };

  return (
    <>
      <MatchModal
        isOpen={matchModal}
        toggle={hideMatchModal}
        manager={manager}
        matchId={matchId}
        onMatchDetermined={matchDetermineHandler}
        opponent1Name={opponent1Name}
        opponent2Name={opponent2Name}
      />
      <div
        id="event-bracket-container"
        className="brackets-viewer mt-5 mb-5"
      ></div>
    </>
  );
}
