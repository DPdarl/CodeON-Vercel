import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { Sidebar } from "~/components/dashboardmodule/SideBar";
import { DashboardHeader } from "~/components/dashboardmodule/DashboardHeader";
import { MobileHeader } from "~/components/mobile/MobileHeader";
import { MobileNavBar } from "~/components/mobile/MobileNavBar";
import { Loader2 } from "lucide-react";

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ✅ NEW: State to track if we are on Mobile
  const [isMobile, setIsMobile] = useState(false);

  // --- 1. DETECT SCREEN SIZE (The Function You Asked For) ---
  useEffect(() => {
    const checkScreenSize = () => {
      // 768px is the standard Tailwind 'md' breakpoint
      setIsMobile(window.innerWidth < 768);
    };

    // Run immediately on load
    checkScreenSize();

    // Listen for resize events (in case user resizes browser)
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // --- 2. DETECT IF IN ACTIVITY MODE ---
  const isActivityMode =
    location.pathname.startsWith("/play/") && location.pathname !== "/play";

  // --- 3. DYNAMIC PADDING CALCULATOR ---
  // This ensures PC layout is completely untouched by mobile styles
  const getContentPadding = () => {
    if (isActivityMode) return "pb-0"; // Full screen for games
    if (isMobile) return "pb-16"; // Big padding for Mobile Nav
    return "pb-0"; // Standard padding for PC
  };

  // --- 4. TAB MATCHING ---
  const getActiveTabFromPath = (path: string) => {
    const currentPath =
      path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;

    if (currentPath.startsWith("/play")) return "play";
    if (currentPath.startsWith("/leaderboard")) return "leaderboard";
    if (currentPath.startsWith("/quests")) return "quests";
    if (currentPath.startsWith("/streak")) return "streak";
    if (currentPath.startsWith("/store")) return "store";
    if (currentPath.startsWith("/profile")) return "profile";

    if (currentPath.startsWith("/student-management"))
      return "student-management";
    if (currentPath.startsWith("/instructor-management"))
      return "instructor-management";
    if (currentPath.startsWith("/admin-management")) return "admin-management";
    if (currentPath.startsWith("/user-reports")) return "user-reports";

    return "home";
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  // --- 5. NAVIGATION HANDLER ---
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
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* DESKTOP SIDEBAR */}
      {!isActivityMode && (
        <aside
          className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 border-r bg-card/50 backdrop-blur-xl transition-[width] duration-300 ${
            sidebarCollapsed ? "w-24" : "w-64"
          }`}
        >
          <Sidebar
            user={user}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
          />
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 flex flex-col h-full relative overflow-hidden transition-[padding] duration-300 
        ${
          isActivityMode ? "pl-0" : sidebarCollapsed ? "md:pl-24" : "md:pl-64"
        }`}
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
              />
            </div>
          </>
        )}

        {/* ✅ CONTENT SCROLL AREA WITH DYNAMIC PADDING */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar  ${getContentPadding()}`}
        >
          <Outlet />
        </div>
      </main>

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
