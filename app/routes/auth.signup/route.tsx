// app/routes/signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase"; // 1. Import Supabase directly
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
// 2. Kept ThemeToggle from your request
import { ThemeToggle } from "~/components/ThemeToggle";
import {
  Loader2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Star,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { CoinIcon } from "~/components/ui/Icons";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // 3. Direct Supabase Signup (Bypasses Context to avoid race conditions)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: username },
        },
      });

      if (error) throw error;

      // 4. Auto-Login Check
      if (data.session) {
        // Session exists! Wait briefly for AuthContext to sync, then redirect
        setTimeout(() => {
          navigate("/auth/onboarding");
        }, 500);
      } else if (data.user) {
        // If no session, fallback to manual login logic (rare if confirm is off)
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginData.session) {
          setTimeout(() => {
            navigate("/auth/onboarding");
          }, 500);
        } else {
          alert("Account created! Please log in.");
          navigate("/auth/login");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // Supabase redirects the window, no navigate needed
    } catch (error) {
      console.error(error);
      setError("Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900 relative transition-colors duration-300">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Left Side: Visuals */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-12">
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[90%] h-[90%] bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], rotate: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-pink-600/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 text-center space-y-8 max-w-lg">
          <div className="flex justify-center">
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
              <CoinIcon className="h-24 w-24" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight font-pixelify">
            Join the <br /> Code Revolution
          </h1>
          <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Star className="text-purple-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Master C#</h3>
                <p className="text-sm text-gray-400">
                  Interactive lessons & challenges
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Trophy className="text-pink-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">Compete & Win</h3>
                <p className="text-sm text-gray-400">
                  Climb the global leaderboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start your adventure today
            </p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  placeholder="CodeMaster99"
                  required
                  className="pl-12 h-12"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="coder@example.com"
                  required
                  className="pl-12 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-12 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  className="pl-12 h-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Start Adventure <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                Or register with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={handleGoogleLogin}
          >
            <svg
              className="mr-3 h-5 w-5"
              aria-hidden="true"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Google
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-bold text-purple-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
