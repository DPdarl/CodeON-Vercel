// app/components/dashboardmodule/SideBar.tsx
import {
  MoreHorizontal,
  Settings,
  LogOut,
  Info,
  UserCog,
  Bug,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { UserData } from "~/contexts/AuthContext";
import { useQuestNotifications } from "~/hooks/useQuestNotifications";
import { useStreakNotifications } from "~/hooks/useStreakNotifications";
import {
  AdminIcon,
  CoinIcon,
  ControllerIcon,
  CrownIcon,
  FlameIcon,
  HomeIcon,
  IconStore,
  // ProfileIcon, // ✅ REMOVED: No longer needed here
  ReportIcon,
  ScrollQuestIcon,
  TogaIcon,
} from "../ui/Icons";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user?: UserData | null;
  collapsed?: boolean;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  user,
  collapsed = false,
}: SidebarProps) {
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notification Hook
  const { hasUnclaimedQuests } = useQuestNotifications();
  const { hasUnclaimedStreak } = useStreakNotifications();

  // --- NAVIGATION CONFIGURATION ---
  const ALL_ROLES = ["superadmin", "admin", "instructor", "user"];
  const STAFF_ROLES = ["superadmin", "admin", "instructor"];
  const ADMIN_ROLES = ["superadmin", "admin"];
  const SUPER_ONLY = ["superadmin"];

  const allNavItems = [
    // Standard Tabs
    { id: "home", label: "Home", icon: HomeIcon, roles: ALL_ROLES },
    { id: "play", label: "Play", icon: ControllerIcon, roles: ALL_ROLES },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: CrownIcon,
      roles: ALL_ROLES,
    },
    {
      id: "quest",
      label: "Quests",
      icon: ScrollQuestIcon,
      roles: ALL_ROLES,
    },
    { id: "streak", label: "Streak", icon: FlameIcon, roles: ALL_ROLES },
    { id: "store", label: "Store", icon: IconStore, roles: ALL_ROLES },

    // Management Tabs (RBAC)
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
    {
      id: "bug-reports",
      label: "Bugs",
      icon: Bug,
      roles: STAFF_ROLES,
    },

    // ✅ REMOVED: Profile Tab from here
    // { id: "profile", label: "Profile", icon: ProfileIcon, roles: ALL_ROLES },

    {
      id: "more",
      label: "More",
      icon: MoreHorizontal,
      hasDropdown: true,
      roles: ALL_ROLES,
    },
  ];

  // Filter items based on user role
  const userRole = user?.role || "user";
  const navigationItems = allNavItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const moreOptions = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
    { id: "logout-trigger", label: "Logout", icon: LogOut },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMoreClick = () => {
    setIsMoreDropdownOpen(!isMoreDropdownOpen);
  };

  const handleMoreOptionClick = (option: (typeof moreOptions)[0]) => {
    if (option.id === "logout-trigger") {
      setShowLogoutDialog(true);
    } else {
      onTabChange(option.id);
    }
    setIsMoreDropdownOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => {
      onLogout();
    }, 100);
  };

  return (
    <>
      <div
        className={`bg-gray-150 dark:bg-gray-900 border-r shadow-sm flex flex-col h-full w-full transition-all duration-300`}
      >
        {/* Logo Section */}
        <div
          className={`h-[88px] flex items-center border-b ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <div
            className={`flex items-center w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <CoinIcon
              className={`h-8 w-8 flex-shrink-0 ${collapsed ? "" : "mx-3"}`}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <img
                    src="/assets/icons/CodeONTextLogo.png"
                    alt="CodeON"
                    className="h-6 w-auto dark:hidden block"
                  />
                  <img
                    src="/assets/icons/CodeONTextLogoDark.png"
                    alt="CodeON"
                    className="h-6 w-auto hidden dark:block"
                  />
                  <span className="text-xs text-muted-foreground leading-tight capitalize truncate">
                    {userRole} View
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isMoreItem = item.id === "more";

              // Define the button content separately for cleaner Tooltip usage
              const NavButton = (
                <button
                  className={`w-full flex items-center rounded-lg text-left transition-colors group relative
                    ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    ${
                      collapsed
                        ? "justify-center p-2 mb-2"
                        : "space-x-3 px-3 py-3"
                    }
                    ${
                      isMoreItem && isMoreDropdownOpen
                        ? "bg-primary/10 text-primary"
                        : ""
                    }
                  `}
                  onClick={
                    isMoreItem ? handleMoreClick : () => onTabChange(item.id)
                  }
                >
                  <div className="relative">
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    {item.id === "quest" && hasUnclaimedQuests && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                      </span>
                    )}
                    {item.id === "streak" && hasUnclaimedStreak && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-900"></span>
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="truncate overflow-hidden whitespace-nowrap ml-3"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );

              return (
                <div
                  key={item.id}
                  className="relative"
                  ref={isMoreItem ? dropdownRef : null}
                >
                  {collapsed ? (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>{NavButton}</TooltipTrigger>
                        <TooltipContent side="right" className="ml-2 font-bold">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    NavButton
                  )}

                  {/* More Dropdown */}
                  {isMoreItem && isMoreDropdownOpen && (
                    <div
                      className={`absolute ${
                        collapsed
                          ? "left-full ml-4 top-0"
                          : "left-0 top-full mt-1 w-full"
                      } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-48`}
                    >
                      {moreOptions.map((option) => {
                        const OptionIcon = option.icon;
                        const isLogout = option.id === "logout-trigger";
                        return (
                          <button
                            key={option.id}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                              isLogout
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => handleMoreOptionClick(option)}
                          >
                            <OptionIcon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You will need to log back in to
              access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
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
