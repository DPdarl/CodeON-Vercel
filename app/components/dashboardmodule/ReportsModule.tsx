import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { UserReportTab } from ".//UserReportTab";
import { MatchHistoryTab } from ".//MatchHistoryTab";
import { FileBarChart, History } from "lucide-react";

export function ReportsModule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics & Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track student progress and review multiplayer game sessions.
        </p>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="progress" className="gap-2">
            <FileBarChart className="w-4 h-4" /> Student Progress
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Match History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <UserReportTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <MatchHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
