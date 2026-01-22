import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";

export interface UserData {
  uid: string;
  email?: string;
  studentId?: string;
  section?: string;
  displayName: string;
  photoURL?: string;
  avatarConfig?: any;
  isOnboarded?: boolean;
  settings?: any;
  xp?: number;
  level?: number;
  streaks?: number;
  coins?: number;
  hearts?: number;
  trophies?: number;
  league?: string;
  joinedAt?: string;
  role?: "superadmin" | "admin" | "user" | "instructor";
  streakFreezes?: number;
  hints?: number;
  ownedCosmetics?: string[];
  inventory?: string[];
  activeDates?: string[];
  badges?: string[];
  googleBound?: boolean;
  birthdate?: string;
  completedChapters?: string[];
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  loginWithStudentId: (
    studentId: string,
    p: string,
  ) => Promise<UserData | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  updatePassword: (p: string) => Promise<void>;
  syncUser: (data: UserData) => void;
  refreshSession: () => Promise<User | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_CACHE_KEY = "codeon_user_cache";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ------------------------
  // Mappers
  // ------------------------
  const mapUserFromDB = useCallback(
    (db: any): UserData => ({
      uid: db.id,
      email: db.email,
      studentId: db.student_id,
      section: db.section,
      displayName: db.display_name ?? "Coder",
      photoURL: db.photo_url,
      avatarConfig: db.avatar_config,
      isOnboarded: db.is_onboarded,
      settings: db.settings,
      xp: db.xp,
      level: db.level,
      streaks: db.streaks,
      coins: db.coins,
      hearts: db.hearts,
      trophies: db.trophies,
      league: db.league,
      joinedAt: db.joined_at,
      role: db.role,
      streakFreezes: db.streak_freezes,
      hints: db.hints,
      ownedCosmetics: db.owned_cosmetics ?? [],
      inventory: db.inventory ?? [],
      activeDates: db.active_dates ?? [],
      badges: db.badges ?? [],
      googleBound: db.google_bound === true || !!db.google_provider_id,
      birthdate: db.birthdate,
      completedChapters: db.completed_chapters ?? [],
    }),
    [],
  );

  const mapUserToDB = useCallback((data: Partial<UserData>) => {
    const db: any = { ...data };

    // Mapping logic...
    if ("displayName" in db) {
      db.display_name = db.displayName;
      delete db.displayName;
    }
    if ("photoURL" in db) {
      db.photo_url = db.photoURL;
      delete db.photoURL;
    }
    if ("avatarConfig" in db) {
      db.avatar_config = db.avatarConfig;
      delete db.avatarConfig;
    }
    if ("isOnboarded" in db) {
      db.is_onboarded = db.isOnboarded;
      delete db.isOnboarded;
    }
    if ("streakFreezes" in db) {
      db.streak_freezes = db.streakFreezes;
      delete db.streakFreezes;
    }
    if ("ownedCosmetics" in db) {
      db.owned_cosmetics = db.ownedCosmetics;
      delete db.ownedCosmetics;
    }
    if ("activeDates" in db) {
      db.active_dates = db.activeDates;
      delete db.activeDates;
    }
    if ("googleBound" in db) {
      db.google_bound = db.googleBound;
      delete db.googleBound;
    }
    if ("completedChapters" in db) {
      db.completed_chapters = db.completedChapters;
      delete db.completedChapters;
    }

    delete db.uid;
    delete db.studentId;
    return db;
  }, []);

  // ------------------------
  // Fetch & Sync Logic
  // ------------------------
  const fetchUserData = useCallback(
    async (authUser: User) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (error) {
          console.error("Fetch user error:", error.message);
          return null;
        }

        if (data) {
          const mapped = mapUserFromDB(data);
          setUser(mapped);
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.error("Unexpected error fetching user data:", err);
      }
      return null;
    },
    [mapUserFromDB],
  );

  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserData(session.user);
    }
  }, [fetchUserData]);

  // ------------------------
  // Realtime Subscription
  // ------------------------
  const setupRealtime = useCallback(() => {
    if (!user?.uid) return;
    if (channelRef.current) channelRef.current.unsubscribe();
    channelRef.current = supabase
      .channel(`user:${user.uid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.uid}`,
        },
        (payload: { new: any }) => {
          setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...mapUserFromDB(payload.new) };
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
            return updated;
          });
        },
      )
      .subscribe();
  }, [user?.uid, mapUserFromDB]);

  // Visibility Change Listener
  useEffect(() => {
    if (!user) return;
    setupRealtime();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchUserData({ id: user.uid } as User);
        setupRealtime();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      channelRef.current?.unsubscribe();
    };
  }, [user?.uid, setupRealtime, fetchUserData]);

  // ------------------------
  // ✅ 1. NEW HASH HANDLER (The Fix)
  // ------------------------
  useEffect(() => {
    // This specifically looks for the Google OAuth hash in the URL
    const handleOAuthRedirect = async () => {
      // If we have an access token in the URL hash, process it manually
      if (
        typeof window !== "undefined" &&
        window.location.hash.includes("access_token")
      ) {
        console.log("🔹 OAuth Hash Detected. Processing...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!error && session?.user) {
          console.log("🔹 Session recovered from hash. Fetching profile...");
          await fetchUserData(session.user);

          // Force Clean URL and ensure we are on dashboard
          if (
            window.location.pathname === "/" ||
            window.location.pathname.includes("/auth")
          ) {
            window.history.replaceState(null, "", "/dashboard"); // Clean URL
            window.location.href = "/dashboard"; // Force Navigate
          }
        }
      }
    };

    handleOAuthRedirect();
  }, [fetchUserData]);

  // ------------------------
  // ✅ 2. Main Auth Listener
  // ------------------------
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
      }
      if (mounted) setLoading(false);
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await fetchUserData(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // ------------------------
  // Actions
  // ------------------------
  const refreshSession = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await fetchUserData(user);
      return user;
    }
    return null;
  };

  const syncUser = useCallback((data: UserData) => {
    setUser(data);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserData>) => {
      if (!user?.uid) return;
      syncUser({ ...user, ...data });
      await supabase.from("users").update(mapUserToDB(data)).eq("id", user.uid);
    },
    [user, mapUserToDB, syncUser],
  );

  const loginWithStudentId = async (studentId: string, p: string) => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("email")
        .eq("student_id", studentId)
        .single();

      if (profileError || !profile?.email) {
        setLoading(false);
        throw new Error("Student ID not found in records.");
      }

      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password: p,
        });

      if (!loginError && loginData.user) {
        const userData = await fetchUserData(loginData.user);
        setLoading(false);
        return userData;
      }

      // ... existing fallback signup logic ...
      if (loginError) {
        const isDefaultFormat = /^Ici\d{4}-\d{2}-\d{2}$/.test(p);
        if (isDefaultFormat) {
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email: profile.email,
              password: p,
              options: { data: { student_id: studentId } },
            });

          if (signUpError) {
            setLoading(false);
            throw loginError;
          }

          if (signUpData.user) {
            await supabase.rpc("claim_student_profile", {
              student_id_input: studentId,
            });
            const userData = await fetchUserData(signUpData.user);
            setLoading(false);
            return userData;
          }
        }
        setLoading(false);
        throw loginError;
      }
      return null;
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem(USER_CACHE_KEY);
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ 3. UPDATED GOOGLE SIGN IN
  const signInWithGoogle = async () => {
    // Explicitly calculate the redirect URL to allow testing on localhost AND Vercel
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUrl = `${origin}/dashboard`;

    console.log("Initiating Google Login. Redirecting to:", redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        // Force consent to ensure we get a refresh token if needed
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google Auth Error:", error);
    }
  };

  const linkGoogleAccount = async () => {
    if (typeof window !== "undefined")
      sessionStorage.setItem("codeon_linking_status", "pending");
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) throw error;
  };

  const unlinkGoogleAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.identities) throw new Error("No identities found");
    const googleIdentity = user.identities.find(
      (id) => id.provider === "google",
    );
    if (!googleIdentity) throw new Error("Google account is not linked");
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) throw error;
    await updateProfile({ googleBound: false });
  };

  const updatePassword = async (p: string) => {
    const { error } = await supabase.auth.updateUser({ password: p });
    if (error) throw error;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithStudentId,
      logout,
      signInWithGoogle,
      linkGoogleAccount,
      unlinkGoogleAccount,
      updateProfile,
      updatePassword,
      syncUser,
      refreshSession,
      refreshUser,
    }),
    [
      user,
      loading,
      loginWithStudentId,
      logout,
      signInWithGoogle,
      linkGoogleAccount,
      unlinkGoogleAccount,
      updateProfile,
      updatePassword,
      syncUser,
      refreshSession,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
