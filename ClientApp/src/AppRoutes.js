import ApiAuthorzationRoutes from "./components/api-authorization/ApiAuthorizationRoutes";
import Games from "./components/Games";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import GameDetails from "./components/games/GameDetails";

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
  ...ApiAuthorzationRoutes,
];

export default AppRoutes;
