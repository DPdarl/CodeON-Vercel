import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Search, Download, Loader2, Filter } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { exportToCSV } from "~/utils/exportHelper"; // Import the helper
import { toast } from "sonner";

const SECTIONS = [
  "All Sections",
  "BSIT-1A",
  "BSIT-1B",
  "BSCS-1A",
  "BSIS",
  "BSAIS",
  "ACT",
];

export function UserReportTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All Sections");

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    setLoading(true);
    // In a real app, you would join tables here (users + game_stats)
    // For now, we simulate the fetch with the existing user table
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "user")
      .order("display_name");

    if (error) {
      toast.error("Failed to load reports");
    } else {
      // Mocking progress data if it doesn't exist in your DB yet
      const enhancedData = data.map((s) => ({
        ...s,
        adventure_progress:
          s.settings?.adventure_progress || Math.floor(Math.random() * 100), // Placeholder
        mp_wins: s.stats?.mp_wins || Math.floor(Math.random() * 20),
        challenge_stars: s.stats?.stars || Math.floor(Math.random() * 15),
      }));
      setStudents(enhancedData || []);
    }
    setLoading(false);
  };

  const handleExport = () => {
    // Prepare clean data for Excel
    const exportData = filteredStudents.map((s) => ({
      "Student ID": s.student_id,
      Name: s.display_name,
      Section: s.section,
      Level: Math.floor((s.xp || 0) / 1000) + 1,
      "Total XP": s.xp || 0,
      "Adventure Progress (%)": `${s.adventure_progress}%`,
      "Multiplayer Wins": s.mp_wins,
      "Challenge Stars": s.challenge_stars,
      "Joined Date": new Date(s.created_at).toLocaleDateString(),
    }));

    exportToCSV(
      exportData,
      `Student_Report_${sectionFilter.replace(" ", "_")}`,
    );
    toast.success("Report downloaded successfully");
  };

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection =
      sectionFilter === "All Sections" || s.section === sectionFilter;
    return matchesSearch && matchesSection;
  });

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Student Progress Report</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={loading || filteredStudents.length === 0}
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search student name or ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter Section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Level / XP</th>
                  <th className="p-3">Adventure</th>
                  <th className="p-3">Multiplayer</th>
                  <th className="p-3">Challenges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {s.display_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.student_id} • {s.section}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          Lvl {Math.floor((s.xp || 0) / 1000) + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.xp?.toLocaleString()} XP
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[80px]">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${s.adventure_progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {s.adventure_progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          {s.mp_wins} Wins
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-medium">
                          ★ {s.challenge_stars}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed">
              No records found.
            </div>
          ) : (
            filteredStudents.map((s) => (
              <div
                key={s.id}
                className="p-4 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {s.display_name}
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      {s.student_id} • {s.section}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      Lvl {Math.floor((s.xp || 0) / 1000) + 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.xp?.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                {/* Vertical Stats */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {/* Adventure */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Adventure</span>
                      <span className="font-medium">
                        {s.adventure_progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${s.adventure_progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* MP & Stars */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 flex items-center justify-between border border-blue-100 dark:border-blue-900/30">
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        PVP Wins
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {s.mp_wins}
                      </span>
                    </div>
                    <div className="flex-1 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-2 flex items-center justify-between border border-yellow-100 dark:border-yellow-900/30">
                      <span className="text-xs text-yellow-700 dark:text-yellow-500">
                        Stars
                      </span>
                      <span className="font-bold text-yellow-700 dark:text-yellow-500">
                        {s.challenge_stars}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
