import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  CalendarDays, // <--- ADD THIS
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Loader2, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "~/lib/supabase";
import { CoinIcon } from "~/components/ui/Icons";

export default function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showRequestAccount, setShowRequestAccount] = useState(false);

  const { loginWithStudentId, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Wait for login and get the user object back
      const user = await loginWithStudentId(studentId, password);

      if (user) {
        if (user.isOnboarded) {
          navigate("/dashboard");
        } else {
          // ✅ Redirect to onboarding if this is their first time
          navigate("/auth/onboarding");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid Student ID or Password");
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your JSX (Layout, Inputs, Modals) is fine ...
  // Paste the rest of the existing Login UI code here (omitted for brevity)
  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-gray-900 relative transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* --- Left Side: Visuals --- */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-12">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-3xl"
        />
        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
              <CoinIcon className="h-24 w-24" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight font-pixelify">
            CodeON
          </h1>
          <p className="text-lg text-gray-300">
            Enter the battlefield. Master the code. Claim your victory.
          </p>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Student Access
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please log in with your university credentials.
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-base">
                  Student ID No.
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="studentId"
                    placeholder="e.g., 2023-10245"
                    required
                    className="pl-12 h-12 text-lg font-mono"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPass(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-12 pr-12 h-12 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground font-medium">
                  Bound Accounts Only
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={() => signInWithGoogle()}
            >
              Sign in with Google
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account yet?{" "}
              <button
                onClick={() => setShowRequestAccount(true)}
                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors underline"
              >
                Request Access
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Existing Modals */}
      <ForgotPasswordModal
        isOpen={showForgotPass}
        onClose={() => setShowForgotPass(false)}
      />
      <RequestAccountModal
        isOpen={showRequestAccount}
        onClose={() => setShowRequestAccount(false)}
      />
    </div>
  );
}

// ... ForgotPasswordModal & RequestAccountModal ...
// (Keep these exactly as they were in your previous code)
function ForgotPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Default passwords follow the format:{" "}
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-foreground font-bold">
              IciYYYY-MM-DD
            </span>{" "}
            (based on your birthdate)
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input placeholder="Enter your ID" required />
            </div>
            <div className="space-y-2">
              <Label>Personal Email</Label>
              <Input type="email" placeholder="For verification" required />
            </div>
            <DialogFooter>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6 text-center space-y-2">
            <h3 className="font-bold text-lg">Request Sent!</h3>
            <p className="text-muted-foreground">
              Please contact your professor if you do not receive a reset link
              within 24 hours.
            </p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- UPDATED REQUEST ACCOUNT MODAL ---
function RequestAccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [instructors, setInstructors] = useState<
    { id: string; display_name: string }[]
  >([]);

  // 1. Fetch Instructors when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchInstructors = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("id, display_name")
          .eq("role", "instructor"); // Only fetch users with 'instructor' role

        if (data) setInstructors(data);
        if (error) console.error("Error fetching instructors:", error);
      };
      fetchInstructors();
    }
  }, [isOpen]);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const requestData = {
      student_id: formData.get("studentNo"),
      full_name: formData.get("fullName"),
      section: formData.get("section"),
      professor: formData.get("professor"),
      birthdate: formData.get("birthdate"), // Save Birthdate
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("account_requests")
        .insert([requestData]);

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Account Access</DialogTitle>
          <DialogDescription>
            Fill out the details below. Your professor will approve your
            request.
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleRequest} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student No.</Label>
                <Input name="studentNo" required placeholder="202X-XXXX" />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select name="section" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BSIT-1A">BSIT-1A</SelectItem>
                    <SelectItem value="BSIT-1B">BSIT-1B</SelectItem>
                    <SelectItem value="BSCS-1A">BSCS-1A</SelectItem>
                    <SelectItem value="BSAIS">BSAIS</SelectItem>
                    <SelectItem value="ACT">ACT</SelectItem>
                    <SelectItem value="BSIS">BSIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                name="fullName"
                required
                placeholder="Last Name, First Name"
              />
            </div>

            {/* --- BIRTHDATE FIELD --- */}
            <div className="space-y-2">
              <Label>Birthdate</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  name="birthdate"
                  type="date"
                  required
                  className="pl-10"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-bold text-indigo-500">Note:</span> This
                date will be used to generate your default password (Format:{" "}
                <span className="font-mono">IciYYYY-MM-DD</span>).
              </p>
            </div>

            {/* --- INSTRUCTOR DROPDOWN --- */}
            <div className="space-y-2">
              <Label>Professor / Instructor</Label>
              <Select name="professor" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.length > 0 ? (
                    instructors.map((inst) => (
                      <SelectItem key={inst.id} value={inst.display_name}>
                        {inst.display_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No instructors found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <h3 className="font-bold text-xl text-green-600">Request Sent!</h3>
            <p className="text-muted-foreground">
              Your account request has been forwarded to the admin. You will be
              notified once approved.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
