import { useState, useEffect } from "react";
import { useAuth, type UserData } from "~/contexts/AuthContext";
import { getUserRank } from "~/lib/leaderboard-logic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CustomizeAvatar } from "./CustomizeAvatar";
import { AvatarDisplay } from "./AvatarDisplay";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  User,
  Calendar,
  Trophy,
  Sparkles,
  Medal,
  Crown,
  Check,
  Shield,
  Loader2,
  Zap,
  Plus,
  Link,
  X,
  RefreshCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

const AVAILABLE_BADGES = [
  "week-warrior",
  "consistency-king",
  "century-club",
  "bug-hunter",
  "code-wizard",
  "night-owl",
  "early-bird",
  "quest-master",
];

interface ProfileTabProps {
  user: UserData | null;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
}

export function ProfileTab({ user, onSaveAvatar }: ProfileTabProps) {
  const {
    updateProfile,
    linkGoogleAccount,
    unlinkGoogleAccount,
    refreshSession,
  } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    user?.badges || []
  );
  const [realRank, setRealRank] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showChangeAccountModal, setShowChangeAccountModal] = useState(false);

  const isProfileChanged =
    displayName.trim() !== "" && displayName.trim() !== user?.displayName;

  const isBadgesChanged =
    JSON.stringify(selectedBadges.sort()) !==
    JSON.stringify((user?.badges || []).sort());

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    if (user?.badges) setSelectedBadges(user.badges);

    const loadData = async () => {
      if (user?.trophies !== undefined) {
        try {
          const r = await getUserRank(user.trophies);
          setRealRank(r);
        } catch (e) {
          console.warn("Could not fetch rank", e);
        }
      }
    };
    loadData();
  }, [user]);

  // --- HANDLE ACCOUNT BINDING RETURN ---
  useEffect(() => {
    const checkBinding = async () => {
      const status = sessionStorage.getItem("codeon_linking_status");

      if (status === "pending") {
        sessionStorage.removeItem("codeon_linking_status");
        setIsLinking(true);
        toast.loading("Verifying Google account...", { id: "bind-load" });

        try {
          const updatedAuthUser = await refreshSession();

          if (updatedAuthUser && updatedAuthUser.identities) {
            const googleIdentity = updatedAuthUser.identities.find(
              (id) => id.provider === "google"
            );

            if (googleIdentity) {
              const googleEmail = googleIdentity.identity_data?.email;

              await updateProfile({
                googleBound: true,
                ...(googleEmail ? { email: googleEmail } : {}),
              });

              toast.success("Account successfully linked!", {
                id: "bind-load",
              });
            } else {
              toast.error("Linking failed: Identity not found.", {
                id: "bind-load",
              });
            }
          }
        } catch (error) {
          console.error("Binding error:", error);
          toast.error("Error finalizing link.", { id: "bind-load" });
        } finally {
          setIsLinking(false);
        }
      }
    };

    checkBinding();
  }, [refreshSession, updateProfile]);

  // --- HANDLERS ---

  const handleProfileUpdate = async () => {
    if (!isProfileChanged && !isBadgesChanged) return;
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        badges: selectedBadges,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSaveWithToast = async (config: any) => {
    await onSaveAvatar(config);
    toast.success("Avatar updated! Looking good.");
  };

  const initiateLinkProcess = () => {
    setShowLinkModal(true);
  };

  const confirmLinkAccount = async () => {
    setShowLinkModal(false);
    setIsLinking(true);
    try {
      await linkGoogleAccount();
    } catch (error: any) {
      console.error(error);
      setIsLinking(false);
      if (error.message?.includes("already linked")) {
        toast.error("This Google account is already used.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleChangeAccount = async () => {
    setShowChangeAccountModal(false);
    setIsLinking(true);
    try {
      await unlinkGoogleAccount();
      await linkGoogleAccount();
    } catch (error: any) {
      console.error(error);
      toast.error(`Change account failed: ${error.message}`);
      setIsLinking(false);
    }
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  if (!user) return <ProfileSkeleton />;

  const creationDate = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString()
    : "N/A";

  const stats = {
    trophies: user.trophies || 0,
    xp: user.xp || 0,
    league: user.league || "Novice",
    rank: realRank ? `#${realRank}` : "...",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-pixelify">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <AvatarDisplay config={user.avatarConfig} headOnly />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {user.displayName || "New Coder"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-mono">
                ID: {user.studentId || "Student"}
              </p>
              <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-2" /> Joined: {creationDate}
              </div>
            </div>
            <div className="hidden sm:flex ml-auto flex-col items-end gap-2 max-w-[250px]">
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                Active Badges
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {user.badges && user.badges.length > 0 ? (
                  user.badges.slice(0, 5).map((badge) => (
                    <Badge
                      key={badge}
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
                    >
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    No badges equipped
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatItem
          icon={Trophy}
          value={stats.trophies.toLocaleString()}
          label="Total Trophies"
          color="text-yellow-500"
        />
        <StatItem
          icon={Zap}
          value={stats.xp.toLocaleString()}
          label="Total XP"
          color="text-blue-500"
        />
        <StatItem
          icon={Crown}
          value={stats.league}
          label="League"
          color="text-purple-500"
        />
        <StatItem
          icon={Medal}
          value={stats.rank}
          label="Global Rank"
          color="text-indigo-500"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto h-12 rounded-xl">
            <TabsTrigger value="profile" className="h-10 rounded-lg">
              <User className="w-4 h-4 mr-2" /> Edit Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="h-10 rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" /> Edit Avatar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6 mt-4">
              {/* Personal Info */}
              <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID (Read-only)</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="studentId"
                        value={user.studentId || "N/A"}
                        disabled
                        className="pl-9 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your coder name"
                    />
                  </div>

                  {/* --- UPDATED EMAIL FIELD --- */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email</Label>
                      {user.googleBound ? (
                        <span className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Google Linked
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          Not Linked
                        </span>
                      )}
                    </div>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                      placeholder="No email associated"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Badge Showcase */}
              <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-orange-500" /> Badge Showcase
                  </CardTitle>
                  <CardDescription>
                    Select the badges you want to display.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_BADGES.map((badge) => {
                      const isSelected = selectedBadges.includes(badge);
                      return (
                        <div
                          key={badge}
                          onClick={() => toggleBadge(badge)}
                          className={`cursor-pointer px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-300"
                              : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 opacity-50" />
                          )}
                          <span className="text-xs font-bold uppercase">
                            {badge.replace(/-/g, " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl border-t-4 border-t-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" /> Account
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                        <svg className="w-6 h-6" viewBox="0 0 488 512">
                          <path
                            fill="currentColor"
                            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          Google Account
                        </h4>
                        <p className="text-sm text-gray-500">
                          {user?.googleBound
                            ? "Linked to " + user.email
                            : "Link for easier login."}
                        </p>
                      </div>
                    </div>

                    {user?.googleBound ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowChangeAccountModal(true)}
                        disabled={isLinking}
                      >
                        {isLinking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {" "}
                            <RefreshCcw className="w-4 h-4 mr-2" /> Change
                            Account
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowLinkModal(true)}
                        disabled={isLinking}
                        variant="outline"
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 text-blue-600"
                      >
                        {isLinking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {" "}
                            <Link className="w-4 h-4 mr-2" /> Bind Account
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="sticky bottom-4 z-10">
                <Button
                  onClick={handleProfileUpdate}
                  disabled={(!isProfileChanged && !isBadgesChanged) || isSaving}
                  className={`w-full h-12 font-bold rounded-xl transition-all shadow-xl ${
                    !isProfileChanged && !isBadgesChanged
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="avatar">
            <div className="mt-4">
              <CustomizeAvatar
                user={user}
                initialConfig={user.avatarConfig}
                onSave={handleAvatarSaveWithToast}
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* --- CONFIRMATION MODALS --- */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bind Google Account?</DialogTitle>
            <DialogDescription>
              Redirecting to Google to verify your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLinkModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmLinkAccount}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showChangeAccountModal}
        onOpenChange={setShowChangeAccountModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Linked Account?</DialogTitle>
            <DialogDescription>
              This will disconnect <b>{user?.email}</b> and allow you to sign in
              with a different Google account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowChangeAccountModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeAccount}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yes, Change Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ... StatItem and ProfileSkeleton
function StatItem({ icon: Icon, value, label, color }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-center md:text-left">
        <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2 flex-1 w-full sm:w-auto text-center sm:text-left">
          <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
        </div>
        <div className="hidden sm:block">
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 h-24 flex items-center gap-3"
          >
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="w-16 h-6" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full space-y-6">
        <Skeleton className="h-12 w-full max-w-sm rounded-xl mx-auto" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    </div>
  );
}
