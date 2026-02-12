import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { useAuth } from "~/contexts/AuthContext";
import { Sidebar } from "~/components/dashboardmodule/SideBar";
import { DashboardHeader } from "~/components/dashboardmodule/DashboardHeader";
import { MobileHeader } from "~/components/mobile/MobileHeader";
import { MobileNavBar } from "~/components/mobile/MobileNavBar";
import { Loader2 } from "lucide-react";
import { LoadingScreen } from "~/components/ui/LoadingScreen";

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ✅ State to track if we are on Mobile
  const [isMobile, setIsMobile] = useState(false);

  // --- 1. DETECT SCREEN SIZE ---
  useEffect(() => {
    const checkScreenSize = () => {
      // 768px is the standard Tailwind 'md' breakpoint
      setIsMobile(window.innerWidth < 768);
    };

    // Run immediately on load
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // --- 2. DETECT IF IN ACTIVITY MODE ---
  const isActivityMode =
    location.pathname.startsWith("/play/") && location.pathname !== "/play";

  // --- 3. DYNAMIC PADDING CALCULATOR ---
  const getContentPadding = () => {
    if (isActivityMode) return "pb-0"; // Full screen for games
    if (isMobile) return "pb-16"; // Big padding for Mobile Nav
    return "pb-0"; // Standard padding for PC
  };

  // --- 4. TAB MATCHING (UPDATED) ---
  const getActiveTabFromPath = (path: string) => {
    const currentPath =
      path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;

    if (currentPath.startsWith("/play")) return "play";
    if (currentPath.startsWith("/leaderboard")) return "leaderboard";
    if (currentPath.startsWith("/quests")) return "quest";
    if (currentPath.startsWith("/streak")) return "streak";
    if (currentPath.startsWith("/store")) return "store";
    if (currentPath.startsWith("/profile")) return "profile";

    // ✅ ADDED: Settings and About path detection
    if (currentPath.startsWith("/settings")) return "settings";
    if (currentPath.startsWith("/about")) return "about";

    if (currentPath.startsWith("/student-management"))
      return "student-management";
    if (currentPath.startsWith("/instructor-management"))
      return "instructor-management";
    if (currentPath.startsWith("/admin-management")) return "admin-management";
    if (currentPath.startsWith("/user-reports")) return "user-reports";
    if (currentPath.startsWith("/bug-reports")) return "bug-reports"; // [NEW]

    return "home";
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  // --- 5. NAVIGATION HANDLER (UPDATED) ---
  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      case "home":
        navigate("/dashboard");
        break;
      case "play":
        navigate("/play");
        break;
      case "leaderboard":
        navigate("/leaderboard");
        break;
      case "quest":
        navigate("/quests");
        break;
      case "streak":
        navigate("/streak");
        break;
      case "store":
        navigate("/store");
        break;
      case "profile":
        navigate("/profile");
        break;
      // ✅ ADDED: Navigation for Settings and About
      case "settings":
        navigate("/settings");
        break;
      case "about":
        navigate("/about");
        break;
      // Management routes
      case "student-management":
        navigate("/student-management");
        break;
      case "instructor-management":
        navigate("/instructor-management");
        break;
      case "admin-management":
        navigate("/admin-management");
        break;
      case "user-reports":
        navigate("/user-reports");
        break;
      case "bug-reports": // [NEW]
        navigate("/bug-reports");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSwitchTheme = () => {
    const isDarkMode = document.documentElement.classList.toggle("dark");
    localStorage.theme = isDarkMode ? "dark" : "light";
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* DESKTOP SIDEBAR */}
      {!isActivityMode && (
        <motion.aside
          initial={false}
          animate={{ width: sidebarCollapsed ? 88 : 256 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 border-r bg-card/50 backdrop-blur-xl overflow-hidden"
        >
          <Sidebar
            user={user}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
          />
        </motion.aside>
      )}

      {/* MAIN CONTENT AREA */}
      <motion.main
        initial={false}
        animate={{
          paddingLeft:
            isActivityMode || isMobile ? 0 : sidebarCollapsed ? 88 : 256,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 flex flex-col h-full relative overflow-hidden"
      >
        {!isActivityMode && (
          <>
            <div className="hidden md:block">
              <DashboardHeader
                user={user}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={toggleSidebar}
                onSwitchTheme={handleSwitchTheme}
                onLogout={handleLogout}
                // Pass profile handler
                onProfileClick={() => handleTabChange("profile")}
                stats={{
                  streaks: user.streaks || 0,
                  coins: user.coins || 0,
                  hearts: user.hearts || 5,
                }}
              />
            </div>

            <div className="block md:hidden">
              <MobileHeader
                user={user}
                stats={{
                  streaks: user.streaks || 0,
                  coins: user.coins || 0,
                  hearts: user.hearts || 5,
                }}
                onSwitchTheme={handleSwitchTheme}
                onLogout={handleLogout}
                // Pass profile handler to mobile header too
                onProfileClick={() => handleTabChange("profile")}
              />
            </div>
          </>
        )}

        {/* CONTENT SCROLL AREA */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar  ${getContentPadding()}`}
        >
          <Outlet />
        </div>
      </motion.main>

      {/* MOBILE BOTTOM NAV */}
      {!isActivityMode && (
        <MobileNavBar
          user={user}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
