// app/components/dashboardmodule/MatchHistoryTab.tsx
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/contexts/AuthContext"; // Import Auth
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Download,
  Gamepad2,
  Trophy,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  Map as MapIcon,
  User,
  Clock,
  Target, // Target icon for Accuracy
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { exportToCSV } from "~/utils/exportHelper";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Match {
  id: string;
  mode: string;
  played_at: string;
  winner_name: string;
  participants_count: number;
  duration_seconds: number | null;
  user_id: string; // Ensure this exists in your DB interface
  results: any[];
}

export function MatchHistoryTab() {
  const { user } = useAuth(); // Get current user
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>("all");

  // Helper to format seconds
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Helper to extract accuracy for the specific user or winner
  const getAccuracy = (match: Match) => {
    if (!match.results || match.results.length === 0) return "-";

    // 1. Try to find THIS user's result specifically
    const myResult = match.results.find(
      (r: any) => r.name === user?.displayName,
    );
    if (myResult && myResult.accuracy) return myResult.accuracy;

    // 2. Fallback: Return the first result (usually winner/solo player)
    return match.results[0]?.accuracy || "-";
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Start Query
        let query = supabase
          .from("match_history")
          .select("*")
          .order("played_at", { ascending: false });

        // --- RESTRICTION LOGIC ---
        // If user is NOT an admin or instructor, restrict to their own ID.
        const isPrivileged = ["superadmin", "admin", "instructor"].includes(
          user.role || "",
        );

        if (!isPrivileged) {
          query = query.eq("user_id", user.uid);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          setMatches(data as Match[]);
        }
      } catch (err) {
        console.error("Error fetching match history:", err);
        toast.error("Failed to load match history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Define static game modes based on requirements
  const PREDEFINED_MODES = [
    { label: "Adventure", value: "adventure" },
    { label: "Multiplayer", value: "multiplayer" },
    { label: "Challenges", value: "challenge" },
  ];

  const filteredMatches = matches.filter((match) => {
    if (filterMode === "all") return true;
    // Flexible matching: check if the match mode string contains the filter keyword
    // e.g. "C# Adventures" -> includes "adventure"
    return match.mode.toLowerCase().includes(filterMode);
  });

  const handleExportMatch = (match: Match) => {
    if (!match.results || match.results.length === 0) {
      toast.error("No detailed results available for this match.");
      return;
    }

    const exportData = match.results.map((r: any) => ({
      Rank: r.rank,
      "Player Name": r.name,
      "Total Score": r.score,
      Accuracy: r.accuracy,
      Duration: formatDuration(match.duration_seconds),
      "Game Mode": match.mode,
      "Date Played": new Date(match.played_at).toLocaleDateString(),
    }));

    exportToCSV(
      exportData,
      `Match_${match.mode.replace(/[\s:]+/g, "_")}_${match.id.slice(0, 4)}`,
    );
    toast.success(`Exported results for ${match.mode}`);
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Match History</CardTitle>
            <CardDescription>
              Review your Multiplayer battles and Adventure progress.
            </CardDescription>
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {PREDEFINED_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="border-t border-gray-200 dark:border-gray-800">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm text-left relative">
              {/* STICKY HEADER */}
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                <tr>
                  <th className="p-4 whitespace-nowrap">Game Session</th>
                  <th className="p-4 whitespace-nowrap">Date & Time</th>
                  <th className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Duration
                    </div>
                  </th>
                  {/* NEW ACCURACY COLUMN */}
                  <th className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" /> Accuracy
                    </div>
                  </th>
                  <th className="p-4 whitespace-nowrap">Result / Winner</th>
                  <th className="p-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Loader2 className="animate-spin mx-auto w-8 h-8 text-indigo-500" />
                      <p className="text-gray-500 mt-2">Loading matches...</p>
                    </td>
                  </tr>
                ) : filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p>No matches found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((match) => {
                    const isAdventure = match.mode
                      .toLowerCase()
                      .includes("adventure");

                    const accuracy = getAccuracy(match);

                    return (
                      <tr
                        key={match.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        {/* Game Mode */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isAdventure
                                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                                  : "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                              }`}
                            >
                              {isAdventure ? (
                                <MapIcon className="w-5 h-5" />
                              ) : (
                                <Gamepad2 className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div
                                className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]"
                                title={match.mode}
                              >
                                {match.mode}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                ID: {match.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.played_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs opacity-70 mt-1 pl-6 whitespace-nowrap">
                            {new Date(match.played_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">
                          {formatDuration(match.duration_seconds)}
                        </td>

                        {/* Accuracy (NEW) */}
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={`font-mono ${
                              accuracy === "100%"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : ""
                            }`}
                          >
                            {accuracy}
                          </Badge>
                        </td>

                        {/* Winner / Result */}
                        <td className="p-4 whitespace-nowrap">
                          {match.winner_name ? (
                            <Badge
                              variant="outline"
                              className={`gap-1 border ${
                                isAdventure
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                              }`}
                            >
                              <Trophy className="w-3 h-3" />{" "}
                              {isAdventure ? "Completed" : match.winner_name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportMatch(match)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-4 pt-4">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <Loader2 className="animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-900 border-dashed">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 opacity-20" />
                  <p>No matches found.</p>
                </div>
              </div>
            ) : (
              filteredMatches.map((match) => {
                const isAdventure = match.mode
                  .toLowerCase()
                  .includes("adventure");
                const accuracy = getAccuracy(match);

                return (
                  <div
                    key={match.id}
                    className="p-4 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
                  >
                    {/* Header: Mode & Download */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isAdventure
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                              : "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                          }`}
                        >
                          {isAdventure ? (
                            <MapIcon className="w-5 h-5" />
                          ) : (
                            <Gamepad2 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                            {match.mode}
                          </h3>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(match.played_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExportMatch(match)}
                        className="h-8 w-8 -mr-2 -mt-2"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Duration
                        </span>
                        <span className="font-mono font-medium text-sm">
                          {formatDuration(match.duration_seconds)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="text-xs text-gray-500 block">
                          Accuracy
                        </span>
                        <span className="font-mono font-medium text-sm text-green-600 dark:text-green-400">
                          {accuracy}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Winner */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(match.played_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {match.winner_name && (
                        <Badge
                          variant="outline"
                          className={`gap-1 border ${
                            isAdventure
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          <Trophy className="w-3 h-3" />{" "}
                          {isAdventure ? "Completed" : match.winner_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
