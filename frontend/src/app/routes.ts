import { createBrowserRouter } from "react-router";
import { LoginPage } from "./components/LoginPage";
import { DemoStartPage } from "./components/DemoStartPage";
import { FeedScreen } from "./components/pwa/FeedScreen";
import { AnnouncementDetail } from "./components/pwa/AnnouncementDetail";
import { AskScreen } from "./components/pwa/AskScreen";
import { MyQScreen } from "./components/pwa/MyQScreen";
import { SearchScreen } from "./components/pwa/SearchScreen";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminTicketDetail } from "./components/admin/AdminTicketDetail";
import { AdminPosts } from "./components/admin/AdminPosts";
import { AdminCreate } from "./components/admin/AdminCreate";
import { AdminPolls } from "./components/admin/AdminPolls";
import { AdminTools } from "./components/admin/AdminTools";
import { AdminSettings } from "./components/admin/AdminSettings";
import { AdminAnalytics } from "./components/admin/AdminAnalytics";

export const router = createBrowserRouter([
  // Login is the entry point
  { path: "/", Component: LoginPage },
  // Demo mode
  { path: "/demo", Component: DemoStartPage },
  // PWA Routes
  { path: "/pwa/feed", Component: FeedScreen },
  { path: "/pwa/feed/:id", Component: AnnouncementDetail },
  { path: "/pwa/ask", Component: AskScreen },
  { path: "/pwa/my-q", Component: MyQScreen },
  { path: "/pwa/search", Component: SearchScreen },
  // Admin Routes
  { path: "/admin", Component: AdminLogin },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { path: "dashboard", Component: AdminDashboard },
      { path: "ticket/:id", Component: AdminTicketDetail },
      { path: "posts", Component: AdminPosts },
      { path: "create", Component: AdminCreate },
      { path: "polls", Component: AdminPolls },
      { path: "tools", Component: AdminTools },
      { path: "settings", Component: AdminSettings },
      { path: "analytics", Component: AdminAnalytics },
    ],
  },
  // Catch all — redirect to login
  { path: "*", Component: LoginPage },
]);