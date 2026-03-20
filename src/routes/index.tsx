import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/login";
import { PrivateRoutes } from "./private-routes";
import Habits from "../pages/habits";
import AuthRedirect from "../pages/auth";
import { Focus } from "../pages/focus";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/habits", element: <PrivateRoutes component={<Habits />} /> },
  { path: "/auth/callback", element: <AuthRedirect /> },
  { path: "/autenticacao", element: <AuthRedirect /> },
  { path: "/focus", element: <PrivateRoutes component={<Focus />} /> },
]);
