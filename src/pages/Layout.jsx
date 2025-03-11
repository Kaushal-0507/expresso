import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import NavBar, { SideNavBar } from "../components/NavBar";
import FollowSuggestions from "../components/FollowSuggestions";
import { DesktopSearch } from "./Search";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../contexts/ThemeProvider";

export default function Layout() {
  const { theme } = useTheme();
  const location = useLocation();
  const isInChatPage = location.pathname === "/chat";

  return (
    <section
      className={`${
        theme === "dark" && "bg-mineShaftDark text-gray-300"
      } relative h-[100vh] pt-1 font-karla min-[390px]:flex min-[390px]:justify-center`}
    >
      <Header />
      <section className="min-[390px]:hidden">
        <NavBar />
      </section>
      <aside className="mt-[40px] border-r border-mineShaftLight pt-2 max-[390px]:hidden">
        <SideNavBar />
      </aside>
      <main
        className={`${
          theme === "dark" && "bg-mineShaftDark text-gray-300"
        } mt-[50px] ${location.pathname === "/chat" ? "max-w-[800px]" : "max-w-[500px]"} flex-grow overflow-y-auto px-2 pb-[50px]`}
      >
        <Outlet />
      </main>
      <section className="mt-[40px] border-l border-mineShaftLight pt-2 max-[600px]:hidden">
        {!isInChatPage && <DesktopSearch />}
        {!isInChatPage && <FollowSuggestions />}
      </section>
    </section>
  );
}
