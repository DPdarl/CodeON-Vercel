export interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
}

export const executeCode = async (
  language: string,
  code: string,
  stdin: string = "",
): Promise<PistonResponse["run"]> => {
  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        version: "*", // Get latest available
        files: [
          {
            content: code,
          },
        ],
        stdin,
      }),
    });

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`);
    }

    const result: PistonResponse = await response.json();
    return result.run;
  } catch (error: any) {
    return {
      stdout: "",
      stderr: error.message || "Failed to connect to compiler service.",
      output: error.message || "Failed to connect to compiler service.",
      code: -1,
      signal: null,
    };
  }
};
