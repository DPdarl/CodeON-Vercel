// app/components/challenge/Terminal.tsx
import React from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import AceEditor from "react-ace";

// Import necessary Ace builds
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-dracula";

const Terminal = () => {
  const { output, showTerminal } = useChallengeContext();

  if (!showTerminal) return null;

  return (
    <div className="mt-4 bg-black rounded-lg overflow-hidden shadow-xl">
      <div className="flex items-center bg-gray-800 px-4 py-2">
        <span className="text-green-400 mr-2">➜</span>
        <h3 className="font-mono text-sm">TERMINAL</h3>
      </div>
      <AceEditor
        mode="text"
        theme="dracula"
        value={output} // Just display the output
        name="terminal-editor"
        width="100%"
        height="200px"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          showLineNumbers: false,
          showGutter: false,
          fontSize: 14,
          highlightActiveLine: false,
          readOnly: true, // Terminal output should be read-only
        }}
      />
    </div>
  );
};

export default Terminal;
