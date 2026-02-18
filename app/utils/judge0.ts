import { toast } from "sonner";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
}

// C# Language ID for Judge0
// 51 is C# (Mono 6.6.0.161)
// 21 is C# (.NET Core SDK 3.1.406)
// 22 is C# (Mono 6.12.0.122)
const CSHARP_LANGUAGE_ID = 51;

export const executeCodeCode = async (
  language: string, // Kept for compatibility, but we basically ignore it as we only do C#
  code: string,
  stdin: string = "",
): Promise<ExecutionResult> => {
  const apiKey = import.meta.env.VITE_JUDGE0_API_KEY;
  const apiUrl = import.meta.env.VITE_JUDGE0_API_URL;

  if (!apiKey || !apiUrl) {
    toast.error("Judge0 API Key or URL is missing in environment variables.");
    return {
      stdout: "",
      stderr: "Configuration Error: Missing API Key/URL",
      output: "Configuration Error: Missing API Key/URL",
      code: -1,
      signal: null,
    };
  }

  try {
    // Construct URL based on whether the base URL already includes /submissions
    // The user's .env has https://judge0-ce.p.rapidapi.com/submissions
    // But we need to add query params for synchronous execution

    // We'll treat apiUrl as the base endpoint for submissions.
    // Query params: base64_encoded=false (or true if needed), wait=true
    const url = new URL(apiUrl);
    url.searchParams.append("base64_encoded", "true");
    url.searchParams.append("wait", "true");

    // Encode content to Base64 to avoid issues with special characters
    const encodedSource = btoa(code);
    const encodedStdin = btoa(stdin);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com", // Usually required for RapidAPI
      },
      body: JSON.stringify({
        source_code: encodedSource,
        language_id: CSHARP_LANGUAGE_ID,
        stdin: encodedStdin,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Execution failed: ${response.status} ${response.statusText} - ${errText}`,
      );
    }

    const result = await response.json();

    // Map Judge0 response to our ExecutionResult
    // judge0 response keys (when base64_encoded=true): stdout, stderr, compile_output, message
    // all are base64 encoded strings

    const decode = (str: string | null) => {
      if (!str) return "";
      try {
        return atob(str);
      } catch (e) {
        console.error("Failed to decode base64:", str);
        return str;
      }
    };

    const stdout = decode(result.stdout);
    const stderr = decode(result.stderr);
    const compileOutput = decode(result.compile_output);
    const message = decode(result.message); // Status message if any

    // Combine error outputs
    const fullSidebarError = [stderr, compileOutput, message]
      .filter(Boolean)
      .join("\n");
    const fullOutput = [stdout, fullSidebarError].filter(Boolean).join("\n");

    return {
      stdout: stdout,
      stderr: fullSidebarError,
      output: fullOutput,
      code: result.status?.id === 3 ? 0 : 1, // 3 is Accepted
      signal: null,
    };
  } catch (error: any) {
    console.error("Judge0 Execution Error:", error);
    return {
      stdout: "",
      stderr: error.message || "Failed to connect to compiler service.",
      output: error.message || "Failed to connect to compiler service.",
      code: -1,
      signal: null,
    };
  }
};
