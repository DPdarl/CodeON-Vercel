export interface Challenge {
  id: string;
  moduleId?: number;
  title: string;
  description: string;
  page?: number;
  starterCode: string;
  hint: string;
  solution: string;
  language?: string;
  requiredVersion?: string;
  difficulty?: "Easy" | "Medium" | "Hard";

  // Rewards
  xpReward?: number;
  coinsReward?: number;

  // Verification & Testing
  testInputs?: string[];
  runner?: (
    input: (prompt: string) => Promise<string>,
    output: (text: string) => void,
  ) => Promise<void>;

  // Grading
  targetTimeMinutes?: number;

  // Construction Mode
  constructionTemplate?: string;
  constructionPool?: string[];
}
