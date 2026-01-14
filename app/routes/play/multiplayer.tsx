// app/routes/play.multiplayer.tsx
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { ArrowLeft, Users, School, Play, Settings, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAuth } from "~/contexts/AuthContext"; // Assuming you have this

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user role

  // Mock Role for Demo (Replace with user.role)
  const isInstructor = user?.role === "instructor";

  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Button
          variant="outline"
          className="mb-8 gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
            Multiplayer Arena
          </h1>
          <p className="text-muted-foreground">
            Battle your peers in real-time code quizzes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* STUDENT VIEW: JOIN ROOM */}
          <Card
            className={`border-2 ${
              !isInstructor ? "border-indigo-500 shadow-xl" : "opacity-60"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" /> Join a Session
              </CardTitle>
              <CardDescription>
                Enter the code shared by your instructor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Room Code</Label>
                <Input
                  placeholder="X J 9 - 2 2"
                  className="text-center text-2xl tracking-widest uppercase font-mono h-14"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
              </div>
              <Button className="w-full h-12 text-lg" disabled={!roomCode}>
                Join Battle
              </Button>
            </CardContent>
          </Card>

          {/* INSTRUCTOR VIEW: CREATE ROOM */}
          <Card
            className={`border-2 ${
              isInstructor
                ? "border-orange-500 shadow-xl"
                : "opacity-60 grayscale"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-6 h-6" /> Instructor Controls
              </CardTitle>
              <CardDescription>
                Create a lobby and configure the match.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstructor ? (
                <>
                  <div className="space-y-2">
                    <Label>Game Mode</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Quiz</SelectItem>
                        <SelectItem value="survival">Sudden Death</SelectItem>
                        <SelectItem value="team">Team Battle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Section</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        <SelectItem value="bsit-1a">BSIT-1A</SelectItem>
                        <SelectItem value="bsit-1b">BSIT-1B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700">
                      <Play className="w-5 h-5 mr-2" /> Create Room
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-xl bg-muted/50">
                  <Settings className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="font-semibold">Instructor Access Required</p>
                  <p className="text-xs text-muted-foreground">
                    Only instructors can host games.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
