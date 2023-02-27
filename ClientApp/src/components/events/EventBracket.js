import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import authService from "../api-authorization/AuthorizeService";
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
    const populateUser = async () => {
      if (await authService.isAuthenticated()) {
        setUserId((await authService.getUser()).sub);
      }
    };
    populateUser();

    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/brackets", {
        accessTokenFactory: () => authService.getAccessToken(),
      })
      .configureLogging(LogLevel.Trace)
      .build();

    const start = async () => {
      try {
        await connection.start();
        console.log("Bracket SignalR Connected");

        connection.on("ReceiveBracket", async (bracketJson) => {
          console.log("Receive bracket triggered!");

          const data = JSON.parse(bracketJson);
          await manager.import(data);
          renderBracket(data);
        });
      } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
      }
    };

    connection.onclose(async () => {
      await start();
    });
    start();

    const render = async () => {
      console.log(event.bracketJson);
      if (event.bracketJson) {
        const data = JSON.parse(event.bracketJson);
        await manager.import(data);
      } else {
        await manager.create({
          name: event.name,
          tournamentId: event.id,
          type: "single_elimination",
          seeding: event.participants,
        });
      }

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
  }, [event.name, event.id, event.participants, manager, event.bracketJson]);

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
    const token = await authService.getAccessToken();
    const bracketJson = JSON.stringify(exportData);
    const response = await fetch(`/api/Events/${event.id}/Bracket`, {
      method: "PATCH",
      body: JSON.stringify({ bracketJson }),
      headers: !token
        ? { "Content-Type": "application/json" }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
    });
    if (!response.ok) {
      if (response.status === 404) {
        toast.error("🛑 Event no longer exists. Cannot update bracket. 🛑", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else if (response.status === 403) {
        toast.error(
          "🛑 Canont update the bracket. You are not the organizer. 🛑",
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
      } else {
        toast.error("🛑 Event API is down. Cannot update bracket. 🛑", {
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
