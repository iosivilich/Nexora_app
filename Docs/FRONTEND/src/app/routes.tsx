import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { ExplorePage } from "./pages/ExplorePage";
import { NetworkPage } from "./pages/NetworkPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        Component: RootLayout,
        children: [
          { index: true, Component: HomePage },
          { path: "explorar", Component: ExplorePage },
          { path: "red", Component: NetworkPage },
          { path: "proyectos", Component: ProjectsPage },
          { path: "mensajes", Component: MessagesPage },
          { path: "analytics", Component: AnalyticsPage },
          { path: "perfil", Component: ProfilePage },
          { path: "configuracion", Component: SettingsPage },
        ],
      },
    ],
  },
]);
