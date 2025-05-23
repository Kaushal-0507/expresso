import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import { useAuth } from "./contexts/AuthProvider";
import RequiredAuth from "./components/RequiredAuth";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile, {
  UserFollowers,
  UserFollowing,
  UserProfile,
} from "./pages/Profile";
import Explore from "./pages/Explore";
import Bookmarks from "./pages/Bookmarks";
import Post from "./pages/Post";
import ProfileSetup from "./pages/ProfileSetup";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import ReportPage from "./components/ReportsPage";

function AppRouter() {
  const { userData } = useAuth();
  const isAdmin = userData?.user?.role === "admin";

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<RequiredAuth />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/:userId" element={<UserProfile />}>
              <Route index element={<Profile />} />
              <Route path="/:userId/following" element={<UserFollowing />} />
              <Route path="/:userId/followers" element={<UserFollowers />} />
            </Route>
            <Route path="/post/:postId" element={<Post />} />
          </Route>
          <Route path="/profile-setup" element={<ProfileSetup />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
      </>
    )
  );
  return <RouterProvider router={router}></RouterProvider>;
}

function App() {
  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
