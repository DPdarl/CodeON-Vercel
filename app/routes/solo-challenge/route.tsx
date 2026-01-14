// app/routes/solo-challenge.tsx
import { Link } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ClientOnly } from "remix-utils/client-only"; // 1. Import ClientOnly

// Import your components (no changes here)
import { ChallengeProvider } from "~/contexts/ChallengeContext";
import Header from "~/components/playmodule/challenge/Header";
import Sidebar from "~/components/playmodule/challenge/Sidebar";
import ChallengeInfo from "~/components/playmodule/challenge/ChallengeInfo";
import CodeEditor from "~/components/playmodule/challenge/CodeEditor";
import Terminal from "~/components/playmodule/challenge/Terminal";
import NavigationButtons from "~/components/playmodule/challenge/NavigationButtons";

// A simple loading placeholder for the editors
const EditorFallback = ({ height = "400px" }) => (
  <div
    className="bg-gray-800 rounded-lg shadow-lg mt-4 flex items-center justify-center"
    style={{ height: height }}
  >
    <p className="text-gray-400">Loading Editor...</p>
  </div>
);

export default function SoloChallengePage() {
  return (
    <ChallengeProvider>
      <div className="min-h-screen bg-gray-900 text-white ">
        <Header />

        <div className="container mx-auto p-4">
          <Button
            asChild
            variant="outline"
            className="mb-4 bg-gray-700 border-gray-600"
          >
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="container p-4 flex flex-col lg:flex-row gap-4 ">
            <Sidebar />

            <div className="w-full flex flex-col gap-4">
              <ChallengeInfo />

              {/* 2. Wrap your client-only components */}
              <ClientOnly fallback={<EditorFallback height="400px" />}>
                {() => <CodeEditor />}
              </ClientOnly>

              <ClientOnly fallback={<EditorFallback height="200px" />}>
                {() => <Terminal />}
              </ClientOnly>

              <NavigationButtons />
            </div>
          </div>
        </div>
      </div>
    </ChallengeProvider>
  );
}
