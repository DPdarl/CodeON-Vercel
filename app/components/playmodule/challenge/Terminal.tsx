// app/components/challenge/Terminal.tsx
import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import { useChallengeContext } from "~/contexts/ChallengeContext";

import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { useThemeDetector } from "~/hooks/useThemeDetector";

interface TerminalProps {
  className?: string;
}

const Terminal = ({ className }: TerminalProps) => {
  const { output, setOutput, isWaitingForInput, submitTerminalInput } =
    useChallengeContext();
  const aceRef = useRef<any>(null);
  const isDark = useThemeDetector();

  // Refs for stable access inside Ace commands (avoids stale closures)
  const historyRef = useRef<string | null>(null);
  const stateRef = useRef({ isWaitingForInput, submitTerminalInput });

  // Keep stateRef updated
  useEffect(() => {
    stateRef.current = { isWaitingForInput, submitTerminalInput };
  }, [isWaitingForInput, submitTerminalInput]);

  // Auto scroll to bottom whenever output changes
  useEffect(() => {
    const editor = aceRef.current?.editor;
    if (editor) {
      editor.renderer.scrollToLine(Number.POSITIVE_INFINITY);
      editor.clearSelection();
      editor.navigateFileEnd();
      editor.focus();
    }
  }, [output]);

  // Snapshot the history when we start waiting for input
  useEffect(() => {
    if (isWaitingForInput && historyRef.current === null) {
      historyRef.current = output;
    }
    if (!isWaitingForInput) {
      historyRef.current = null;
    }
  }, [isWaitingForInput, output]);

  const handleChange = (newValue: string) => {
    if (!isWaitingForInput) return;

    // If we have a snapshot, ensure we don't edit history
    if (historyRef.current) {
      if (newValue.startsWith(historyRef.current)) {
        setOutput(newValue);
      }
      // If it doesn't start with history (user tried to delete prompt), do nothing
    } else {
      // Fallback
      setOutput(newValue);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-[#282a36] border-t border-gray-200 dark:border-gray-800 ${className}`}
    >
      <div className="flex-1 relative">
        <AceEditor
          ref={aceRef}
          mode="text"
          theme={isDark ? "dracula" : "github"}
          name="terminal_output"
          width="100%"
          height="100%"
          value={output}
          onChange={handleChange}
          readOnly={!isWaitingForInput}
          showGutter={false}
          showPrintMargin={false}
          highlightActiveLine={false}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: false,
            tabSize: 2,
            fontFamily: "monospace",
            fontSize: 14,
            cursorStyle: "wide",
          }}
          commands={[
            {
              name: "submitInput",
              bindKey: { win: "Enter", mac: "Enter" },
              exec: (editor) => {
                const {
                  isWaitingForInput: waiting,
                  submitTerminalInput: submit,
                } = stateRef.current;

                if (!waiting) return;

                const val = editor.getValue();
                const historySnapshot = historyRef.current;

                // 1. Priority: Extract based on historySnapshot (supports custom prompts)
                if (
                  historySnapshot !== null &&
                  val.startsWith(historySnapshot)
                ) {
                  const input = val.substring(historySnapshot.length);
                  submit(input);
                  return;
                }

                // 2. Fallback: Look for standard prompt marker
                const promptMarker = "> ";
                const lastIdx = val.lastIndexOf(promptMarker);

                if (lastIdx !== -1) {
                  const input = val.substring(lastIdx + promptMarker.length);
                  submit(input);
                }
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Terminal;
