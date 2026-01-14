// app/types/lesson.types.ts

export type ActivityType = "QUIZ" | "BUILDING_BLOCKS" | "MATCHING";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  data: any; // Flexible data structure for different game types
}

export interface ArticleSection {
  title: string;
  content: string; // Text content
  codeSnippet?: string; // Optional code block
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  article: {
    sections: ArticleSection[];
  };
  activities: Activity[];
}
