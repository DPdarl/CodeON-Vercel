import { json, type MetaFunction } from "@remix-run/node";
import { useAuth } from "~/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { supabase } from "~/lib/supabase";
import {
  BugReportsTable,
  type BugReport,
} from "~/components/admin/BugReportsTable";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [
    { title: "Bug Reports | CodeON Admin" },
    { name: "description", content: "Manage bug reports submitted by users." },
  ];
};

export default function BugReportsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth/login");
        return;
      }

      // Check Role
      const role = user.role?.toLowerCase();
      if (role !== "admin" && role !== "superadmin" && role !== "instructor") {
        toast.error("Unauthorized access.");
        navigate("/dashboard");
        return;
      }

      // Fetch Reports
      const fetchReports = async () => {
        try {
          const { data, error } = await supabase
            .from("bug_reports")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          setReports(data || []);
        } catch (err: any) {
          console.error("Error fetching reports:", err);
          toast.error("Failed to load bug reports.");
        } finally {
          setFetching(false);
        }
      };

      fetchReports();
    }
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bug Reports</h1>
        <p className="text-muted-foreground">
          Review and manage issues reported by users.
        </p>
      </div>

      <BugReportsTable initialReports={reports} />
    </div>
  );
}
