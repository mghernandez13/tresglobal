import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./pages/login";
import DashboardPage from "./pages/dashboard";
import AgentsPage from "./pages/agents";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },

  {
    path: "/agents",
    element: <AgentsPage />,
  },
]);
