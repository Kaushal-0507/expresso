import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faMessage, faBell } from "@fortawesome/free-regular-svg-icons";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import { NavLink, useLocation } from "react-router-dom";
import { faCompass } from "@fortawesome/free-regular-svg-icons";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../contexts/AuthProvider";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";
import { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import { useTheme } from "../contexts/ThemeProvider";
import { getNotificationsService } from "../services/notificationServices";

export default function NavBar() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const isInReportPage = location.pathname === "/report";

  const activeStyle = ({ isActive }) => {
    return { color: isActive ? "blue" : "black" };
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotificationsService();
        const unread = response.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className={`fixed bottom-0 z-[5] flex w-full justify-evenly bg-japnicaDark py-2 text-mineShaft`}
    >
      <NavLink style={activeStyle} to="/">
        <FontAwesomeIcon icon={faHouse} />
      </NavLink>
      {!isInReportPage && (
        <NavLink style={activeStyle} to="/search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </NavLink>
      )}
      <Modal
        className={`${theme === "dark" ? "bg-mineShaft text-white" : ""}`}
        open={open}
        setOpen={setOpen}
        btnStyle={"bg-japnicaDark text-mineShaftDark"}
        modalFor={
          <FontAwesomeIcon icon={faPlus} className="m-0 bg-japnicaDark" />
        }
      >
        <CreatePost setOpen={setOpen} modal />
      </Modal>
      <NavLink style={activeStyle} to="/explore">
        <FontAwesomeIcon icon={faCompass} />
      </NavLink>
      <NavLink style={activeStyle} to="/chat">
        <FontAwesomeIcon icon={faMessage} />
      </NavLink>
      <NavLink style={activeStyle} to="/notifications" className="relative flex items-center">
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </NavLink>
      <NavLink style={activeStyle} to="/bookmarks">
        <FontAwesomeIcon icon={faBookmark} />
      </NavLink>
    </nav>
  );
}

export function SideNavBar() {
  const {
    userData: {
      user: { userDetails },
    },
    signOut,
  } = useAuth();
  const activeStyle = ({ isActive }) => {
    return {
      backgroundColor: isActive ? "#3C464490" : "",
    };
  };
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const isInReportPage = location.pathname === "/report";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotificationsService();
        const unread = response.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="flex h-full w-auto flex-col items-start justify-start gap-4 px-2 pt-4 max-[500px]:items-center">
      <NavLink
        style={activeStyle}
        to="/"
        className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40 "
      >
        <FontAwesomeIcon icon={faHouse} className="w-[20px]" />
        <p className="max-[768px]:hidden">Home</p>
      </NavLink>
      <NavLink
        style={activeStyle}
        to={`/${userDetails?._id}`}
        className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40 "
      >
        <FontAwesomeIcon icon={faUser} className="w-[20px]" />
        <p className="max-[768px]:hidden">Profile</p>
      </NavLink>
      <NavLink
        style={activeStyle}
        to="/explore"
        className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40 "
      >
        <FontAwesomeIcon icon={faCompass} className="w-[20px]" />
        <p className="max-[768px]:hidden">Explore</p>
      </NavLink>
      <NavLink
        style={activeStyle}
        to="/chat"
        className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40 "
      >
        <FontAwesomeIcon icon={faMessage} className="w-[20px]" />
        <p className="max-[768px]:hidden">Chat</p>
      </NavLink>
      <NavLink
        style={activeStyle}
        to="/notifications"
        className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40"
      >
        <div className="flex items-center">
          <FontAwesomeIcon icon={faBell} className="w-[20px]" />
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <p className="max-[768px]:hidden">Notifications</p>
      </NavLink>
      <NavLink
        style={activeStyle}
        to="/bookmarks"
        className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40 "
      >
        <FontAwesomeIcon icon={faBookmark} className="w-[20px]" />
        <p className="max-[768px]:hidden">Bookmarks</p>
      </NavLink>
      {!isInReportPage && (
        <NavLink
          style={activeStyle}
          to="/search"
          className="flex w-full items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40 min-[600px]:hidden sm:hidden"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-[20px]" />
          <p className="max-[768px]:hidden">Search</p>
        </NavLink>
      )}
      <div
        className="flex w-full cursor-pointer items-center gap-2 rounded-full px-2 py-1 hover:bg-mineShaftLighter/40"
        onClick={signOut}
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="w-[20px]" />
        <p className="max-[768px]:hidden">Logout</p>
      </div>
      <Modal
        open={open}
        setOpen={setOpen}
        modalFor={
          <div
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-mineShaftLight bg-japnicaDark px-2 py-1 text-mineShaftDark duration-200 hover:text-mineShaft min-[768px]:pr-4`}
          >
            <FontAwesomeIcon icon={faPlus} className="w-[20px]" />
            <p className="max-[768px]:hidden">Create</p>
          </div>
        }
      >
        <CreatePost setOpen={setOpen} modal />
      </Modal>
    </nav>
  );
}
