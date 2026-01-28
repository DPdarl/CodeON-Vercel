import { useEffect, useRef } from "react";
import {
  useNavigate,
  useLoaderData,
  type ClientLoaderFunctionArgs,
  type ShouldRevalidateFunction,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

// ✅ 1. Import HomeTab directly (instead of DashboardTabs)
import { HomeTab } from "~/components/dashboardmodule/HomeTab";

import { useAuth, type UserData } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Skeleton } from "~/components/ui/skeleton";
import { StreakChecker } from "~/components/dashboardmodule/StreakChecker";

// --- LOADER ---
export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { user: null };

  const { data: dbUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !dbUser) return { user: null };

  const mappedUser: UserData = {
    uid: dbUser.id,
    email: dbUser.email,
    studentId: dbUser.student_id,
    displayName: dbUser.display_name || "Coder",
    photoURL: dbUser.photo_url,
    avatarConfig: dbUser.avatar_config,
    isOnboarded: dbUser.is_onboarded ?? false,
    settings: dbUser.settings,
    xp: dbUser.xp,
    level: dbUser.level,
    streaks: dbUser.streaks,
    coins: dbUser.coins,
    hearts: dbUser.hearts,
    streakFreezes: dbUser.streak_freezes || 0,
    hints: dbUser.hints || 0,
    ownedCosmetics: dbUser.owned_cosmetics || [],
    inventory: dbUser.inventory || [],
    trophies: dbUser.trophies,
    league: dbUser.league,
    joinedAt: dbUser.joined_at,
    role: dbUser.role,
    activeDates: dbUser.active_dates || [],
    badges: dbUser.badges || [],
    googleBound: !!dbUser.google_provider_id,
  };

  return { user: mappedUser };
}

clientLoader.hydrate = true;

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  defaultShouldRevalidate,
}) => {
  if (formMethod === "GET") return false;
  return defaultShouldRevalidate;
};

// --- LOADING FALLBACK ---
export function HydrateFallback() {
  return (
    <div className="flex flex-col space-y-6 p-6 h-full">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-indigo-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-48 bg-indigo-100 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-48 w-full rounded-3xl bg-gray-100 dark:bg-gray-800" />
        <Skeleton className="h-48 w-full rounded-3xl bg-gray-100 dark:bg-gray-800" />
        <Skeleton className="h-48 w-full rounded-3xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | CodeON" },
    { name: "description", content: "Your CodeON dashboard" },
  ];
};

export default function Dashboard() {
  const { user: loaderUser } = useLoaderData<typeof clientLoader>();
  const { user: contextUser, syncUser } = useAuth();
  const navigate = useNavigate();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (loaderUser && !hasSyncedRef.current) {
      if (JSON.stringify(loaderUser) !== JSON.stringify(contextUser)) {
        syncUser(loaderUser);
      }
      hasSyncedRef.current = true;
    }
  }, [loaderUser, contextUser, syncUser]);

  const activeUser = contextUser || loaderUser;

  useEffect(() => {
    if (activeUser && activeUser.isOnboarded === false) {
      navigate("/onboarding");
    }
  }, [activeUser, navigate]);

  if (activeUser && activeUser.isOnboarded === false) return null;

  // --- RENDER ---
  return (
    <div className="flex flex-col h-full w-full">
      {/* We only render HomeTab here. 
            Other tabs (Play, Leaderboard) are now handled by their own route files. 
        */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
        <HomeTab
          onTabChange={(tab) => {
            // If HomeTab has internal navigation buttons, handle them here
            if (tab === "play") navigate("/play");
          }}
        />
        <StreakChecker />
      </div>
    </div>
  );
}
