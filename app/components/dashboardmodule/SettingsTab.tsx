import { useAuth } from "~/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Moon, Sun, Monitor, Eye, Zap, Lock, Loader2, Bug } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BugReportModal } from "../playmodule/challenge/BugReportModal";

export function SettingsTab() {
  const { user, updateProfile, updatePassword } = useAuth();

  const [settings, setSettings] = useState({
    theme: user?.settings?.theme || "system",
    reduceMotion: user?.settings?.reduceMotion || false,
    highContrast: user?.settings?.highContrast || false,
    soundEnabled: user?.settings?.soundEnabled ?? true,
  });

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setSettings({
        theme: user.settings.theme || "system",
        reduceMotion: user.settings.reduceMotion || false,
        highContrast: user.settings.highContrast || false,
        soundEnabled: user.settings.soundEnabled ?? true,
      });
    }
  }, [user]);

  const handleSettingChange = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (key === "theme") {
      if (value === "dark") document.documentElement.classList.add("dark");
      else if (value === "light")
        document.documentElement.classList.remove("dark");
      else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }

    try {
      await updateProfile({ settings: newSettings });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPass(true);
    try {
      await updatePassword(newPassword);
      toast.success("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update password. " + error.message);
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Accessibility Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Customize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for a simpler experience.
              </p>
            </div>
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) =>
                handleSettingChange("reduceMotion", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility.
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) =>
                handleSettingChange("highContrast", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds when completing tasks.
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                handleSettingChange("soundEnabled", checked)
              }
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              <ThemeButton
                active={settings.theme === "light"}
                onClick={() => handleSettingChange("theme", "light")}
                icon={Sun}
                label="Light"
              />
              <ThemeButton
                active={settings.theme === "dark"}
                onClick={() => handleSettingChange("theme", "dark")}
                icon={Moon}
                label="Dark"
              />
              <ThemeButton
                active={settings.theme === "system"}
                onClick={() => handleSettingChange("theme", "system")}
                icon={Monitor}
                label="System"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Support
          </CardTitle>
          <CardDescription>Found an issue? Let us know.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Report a Bug</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve CodeON by reporting bugs.
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsBugReportOpen(true)}>
              <Bug className="mr-2 h-4 w-4" /> Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
      />

      {/* NEW: Change Password Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-t-4 border-t-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Security
          </CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPass">New Password</Label>
              <Input
                id="newPass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPass">Confirm Password</Label>
              <Input
                id="confirmPass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isUpdatingPass}
              className="w-full sm:w-auto"
            >
              {isUpdatingPass ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function ThemeButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
