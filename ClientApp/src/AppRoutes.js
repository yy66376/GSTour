import ApiAuthorzationRoutes from "./components/api-authorization/ApiAuthorizationRoutes";
import Games from "./components/Games";
import Events from "./components/Events";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import GameDetails from "./components/games/GameDetails";
import EventCreator from "./components/EventCreator";
import EventDetails from "./components/events/EventDetails";
import EventEditor from "./components/events/EventEditor";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/Games",
    element: <Games />,
  },
  {
    path: "/Games/:gameId",
    element: <GameDetails />,
  },
  {
    path: "/fetch-data",
    requireAuth: true,
    element: <FetchData />,
  },
  {
    path: "/Events",
    element: <Events />,
  },
  {
    path: "/Events/:eventId",
    element: <EventDetails />,
  },
  {
    path: "/Events/Create",
    requireAuth: true,
    element: <EventCreator />,
  },
  {
    path: "/Events/Edit/:eventId",
    requireAuth: true,
    element: <EventEditor />,
  },
  ...ApiAuthorzationRoutes,
];

export default AppRoutes;
