// app/components/dashboardmodule/MultiplayerQuiz.tsx
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Users, Plus, LogIn } from "lucide-react";

interface MultiplayerQuizProps {
  onStartMultiplayerQuiz: () => void;
  onJoinMultiplayerQuiz: () => void;
}

// Add the 'export' keyword here
export function MultiplayerQuiz({
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: MultiplayerQuizProps) {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Side: Illustration/Info */}
        <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 dark:bg-red-950/30 rounded-2xl">
          <Users className="w-16 h-16 text-red-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
            Test Your Might!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Challenge your friends or join a public game to see who's the true
            code master.
          </p>
        </div>

        {/* Right Side: Actions */}
        <div className="space-y-4">
          <Button
            onClick={onStartMultiplayerQuiz}
            className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create a New Game
          </Button>
          <Button
            onClick={onJoinMultiplayerQuiz}
            className="w-full h-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 font-bold rounded-xl text-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Join with a Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
