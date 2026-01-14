// app/types/challenge.types.ts
export interface Challenge {
  id: string;
  title: string;
  description: string;
  page: number;
  starterCode: string;
  hint: string;
  solution: string;

  // FIXED: Changed from method signature to string property
  category: string;
  language: string;

  requiredVersion?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
}
