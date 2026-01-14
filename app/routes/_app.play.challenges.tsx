// app/routes/play.challenges.tsx
import { useNavigate } from "@remix-run/react";
import { ArrowLeft, Code2, Terminal, Cpu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { challenges } from "~/data/challenges"; // Using your existing data file

export default function ChallengesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="mb-6 gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Code2 className="w-10 h-10 text-orange-500" />
          <div>
            <h1 className="text-3xl font-black">C#allenges</h1>
            <p className="text-muted-foreground">Solve real coding problems.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="cursor-pointer hover:border-orange-500 transition-all hover:shadow-md"
              onClick={() =>
                navigate(`/solo-challenge`, { state: { challenge } })
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">
                  {challenge.title}
                </CardTitle>
                <Badge
                  variant={
                    challenge.difficulty === "Hard"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {challenge.difficulty || "Easy"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {challenge.description}
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {challenge.language === "python" ? (
                      <Terminal className="w-3 h-3 mr-1" />
                    ) : (
                      <Cpu className="w-3 h-3 mr-1" />
                    )}
                    {challenge.language}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
