// app/components/dashboardmodule/DashboardTabs.tsx
import { useMemo } from "react";
import { HomeTab } from "./HomeTab";
import { PlayTab } from "./PlayTab";
import { LeaderboardTab } from "./LeaderboardTab";
import { QuestTab } from "./QuestTab";
import { StreakTab } from "./StreakTaB";
import { SettingsTab } from "./SettingsTab";
import { AboutTab } from "./AboutTab";
import { StoreTab } from "./StoreTab";
import { ProfileTab } from "./ProfileTab";
import { StudentManagementTab } from "../managementmodule/StudentManagementTab";
import { InstructorManagementTab } from "../managementmodule/InstructorManagementTab";
import { AdminManagementTab } from "../managementmodule/AdminManagementTab";
import { UserReportTab } from "./UserReportTab";
import { MatchHistoryTab } from "./MatchHistoryTab";

// --- PLACEHOLDER IMPORTS (Replace these with actual files when you create them) ---
// import { UserManagementTab } from "./UserManagementTab";
// import { StudentManagementTab } from "./StudentManagementTab";
// import { InstructorManagementTab } from "./InstructorManagementTab";
// import { AdminManagementTab } from "./AdminManagementTab";
// import { UserReportsTab } from "./UserReportsTab";

// Temporary placeholder component for visualization
const PlaceholderTab = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full p-10 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p>This module is under construction.</p>
    </div>
  </div>
);

// --- PERMISSION CONFIGURATION ---
const ROLE_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  instructor: 2,
  user: 1,
};

// Define which roles are allowed for each RESTRICTED tab
const TAB_PERMISSIONS: Record<string, string[]> = {
  "user-management": ["superadmin", "admin", "instructor"],
  "student-management": ["superadmin", "admin", "instructor"],
  "instructor-management": ["superadmin", "admin"],
  "admin-management": ["superadmin"],
  "user-reports": ["superadmin", "admin", "instructor"],
};

interface DashboardTabsProps {
  activeTab: string;
  user: any;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
  onStartMultiplayerQuiz: () => void;
  onJoinMultiplayerQuiz: () => void;
}

export function DashboardTabs({
  activeTab,
  user,
  onSaveAvatar,
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: DashboardTabsProps) {
  // Helper to check permission
  const hasAccess = useMemo(() => {
    const requiredRoles = TAB_PERMISSIONS[activeTab];
    // If tab isn't in the restricted list, everyone has access (e.g., home, play)
    if (!requiredRoles) return true;

    // Check if user has required role
    return requiredRoles.includes(user?.role || "user");
  }, [activeTab, user]);

  // Unauthorized Fallback
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-red-100 text-red-600 rounded-full">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Access Denied
        </h2>
        <p className="text-gray-500 max-w-sm">
          You do not have permission to view the <strong>{activeTab}</strong>{" "}
          module. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative fade-in-animation">
      {/* Standard User Tabs */}
      {activeTab === "home" && (
        <HomeTab
          onTabChange={(tab) => {
            /* Handle internal navigation if needed */
          }}
        />
      )}
      {activeTab === "play" && <PlayTab />}
      {activeTab === "leaderboard" && <LeaderboardTab />}
      {activeTab === "quest" && <QuestTab />}
      {activeTab === "streak" && <StreakTab />}
      {activeTab === "store" && <StoreTab />}
      {activeTab === "profile" && (
        <ProfileTab user={user} onSaveAvatar={onSaveAvatar} />
      )}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "about" && <AboutTab />}

      {/* --- MANAGEMENT TABS --- */}

      {/* 2. Student Management (SuperAdmin, Admin, Instructor) */}
      {activeTab === "student-management" && <StudentManagementTab />}

      {/* 3. Instructor Management (SuperAdmin, Admin) */}
      {activeTab === "instructor-management" && <InstructorManagementTab />}

      {/* 4. Admin Management (SuperAdmin Only) */}
      {activeTab === "admin-management" && <AdminManagementTab />}

      {/* 5. User Reports (SuperAdmin, Admin, Instructor) */}
      {activeTab === "user-reports" && <UserReportTab />}
      {/* {activeTab === "match-history" && <MatchHistoryTab />} */}
    </div>
  );
}
