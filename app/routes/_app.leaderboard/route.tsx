import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { LeaderboardTab } from "~/components/dashboardmodule/LeaderboardTab";

// 1. Meta Data
export const meta: MetaFunction = () => {
  return [
    { title: "Leaderboard | CodeON" },
    { name: "description", content: "Compete with other students" },
  ];
};

// 2. ✅ THE FIX: You must export a loader!
// Even if it returns nothing, it tells Remix "I can handle this GET request."
export async function loader() {
  return json({});
}

// 3. The Page Component
export default function LeaderboardPage() {
  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-6">
      {/* Renders the complex logic component you created earlier */}
      <LeaderboardTab />
    </div>
  );
}
