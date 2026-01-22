// app/components/dashboardmodule/MobileNavBar.tsx
import {
  MoreHorizontal,
  Settings,
  LogOut,
  Info,
  UserCog,
  // Menu, // Unused import removed
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { UserData } from "~/contexts/AuthContext";
import { useQuestNotifications } from "~/hooks/useQuestNotifications";
import {
  AdminIcon,
  ControllerIcon,
  CrownIcon,
  FlameIcon,
  HomeIcon,
  IconStore,
  // ProfileIcon, // ✅ REMOVED: No longer needed here
  ReportIcon,
  ScrollQuestIcon,
  TogaIcon,
} from "~/components/ui/Icons";
import { cn } from "~/lib/utils";

interface MobileNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user?: UserData | null;
}

export function MobileNavBar({
  activeTab,
  onTabChange,
  onLogout,
  user,
}: MobileNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Notification Hook
  const { hasUnclaimedQuests } = useQuestNotifications();

  // --- CONFIGURATION ---
  const ALL_ROLES = ["superadmin", "admin", "instructor", "user"];
  const STAFF_ROLES = ["superadmin", "admin", "instructor"];
  const ADMIN_ROLES = ["superadmin", "admin"];
  const SUPER_ONLY = ["superadmin"];

  const allNavItems = [
    // Primary Tabs
    { id: "home", label: "Home", icon: HomeIcon, roles: ALL_ROLES },
    { id: "play", label: "Play", icon: ControllerIcon, roles: ALL_ROLES },
    { id: "leaderboard", label: "Rank", icon: CrownIcon, roles: ALL_ROLES },
    { id: "quest", label: "Quests", icon: ScrollQuestIcon, roles: ALL_ROLES },

    // Secondary Tabs (Will move to Menu on mobile)
    { id: "streak", label: "Streak", icon: FlameIcon, roles: ALL_ROLES },
    { id: "store", label: "Store", icon: IconStore, roles: ALL_ROLES },

    // Management Tabs
    {
      id: "student-management",
      label: "Students",
      icon: TogaIcon,
      roles: STAFF_ROLES,
    },
    {
      id: "instructor-management",
      label: "Instructors",
      icon: UserCog,
      roles: ADMIN_ROLES,
    },
    {
      id: "admin-management",
      label: "Admins",
      icon: AdminIcon,
      roles: SUPER_ONLY,
    },
    {
      id: "user-reports",
      label: "Reports",
      icon: ReportIcon,
      roles: STAFF_ROLES,
    },

    // ✅ REMOVED: Profile Tab
    // { id: "profile", label: "Profile", icon: ProfileIcon, roles: ALL_ROLES },
  ];

  // 1. Filter based on Role
  const userRole = user?.role || "user";
  const navigationItems = allNavItems.filter((item) =>
    item.roles.includes(userRole),
  );

  // 2. Split Items: First 4 go on Bar, Rest go in Menu
  const primaryIds = ["home", "play", "leaderboard", "quest"];
  const primaryItems = navigationItems.filter((i) => primaryIds.includes(i.id));
  const menuItems = navigationItems.filter((i) => !primaryIds.includes(i.id));

  const moreOptions = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
    { id: "logout-trigger", label: "Logout", icon: LogOut },
  ];

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuOptionClick = (id: string) => {
    if (id === "logout-trigger") {
      setShowLogoutDialog(true);
    } else {
      onTabChange(id);
    }
    setIsMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => onLogout(), 100);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 px-2 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-full relative">
          {/* --- 1. PRIMARY ITEMS (Home, Play, etc.) --- */}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform"
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200 relative",
                    isActive
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800"
                      : "text-gray-400 dark:text-gray-500 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800",
                  )}
                >
                  <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                  {item.id === "quest" && hasUnclaimedQuests && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* --- 2. MENU BUTTON (The 5th Element) --- */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full py-1 active:scale-95 transition-transform px-4"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isMenuOpen
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800"
                    : "text-gray-400 dark:text-gray-500 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
              >
                <MoreHorizontal className="w-6 h-6" />
              </div>
            </button>

            {/* UPWARD POPUP MENU */}
            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-4 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
                  {/* Remaining Navigation Items (Store, Admin, etc.) */}
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuOptionClick(item.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  {/* More Options (Settings, Logout) */}
                  {moreOptions.map((option) => {
                    const Icon = option.icon;
                    const isLogout = option.id === "logout-trigger";
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleMenuOptionClick(option.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isLogout
                            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will need to log back in to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            <Button variant="ghost" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
