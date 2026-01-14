// app/data/roadmap.ts
import {
  BookOpen,
  Code,
  Terminal,
  Cpu,
  Box,
  Layers,
  PlayCircle,
  Braces,
  AlertTriangle,
  Database,
} from "lucide-react";

export interface RoadmapChapter {
  id: number;
  title: string;
  description: string;
  lessonType: "Article";
  activityType: string;
  icon: any;
  color: string;
}

export const roadmapChapters: RoadmapChapter[] = [
  {
    id: 1,
    title: "Understanding C# & .NET",
    description: "The Recipe & The Kitchen. Learn how they work together.",
    lessonType: "Article",
    activityType: "Identify the Concept",
    icon: Terminal,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Basic Syntax",
    description: "Writing your first sentences in code.",
    lessonType: "Article",
    activityType: "Code Builder",
    icon: Code,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    title: "Variables & Data",
    description: "Storing information in boxes.",
    lessonType: "Article",
    activityType: "Hybrid (Match + Build)",
    icon: Box,
    color: "bg-indigo-500",
  },
  {
    id: 4,
    title: "Operators",
    description: "Math and logic magic.",
    lessonType: "Article",
    activityType: "Math Ops Rush",
    icon: Cpu,
    color: "bg-orange-500",
  },
  {
    id: 5,
    title: "Control Structures",
    description: "Making decisions with code.",
    lessonType: "Article",
    activityType: "Flow Control Runner",
    icon: Layers,
    color: "bg-purple-500",
  },
  {
    id: 6,
    title: "Methods",
    description: "Creating your own superpowers.",
    lessonType: "Article",
    activityType: "Method Maker",
    icon: PlayCircle,
    color: "bg-pink-500",
  },
  {
    id: 7,
    title: "Classes & Objects",
    description: "Blueprints for building anything.",
    lessonType: "Article",
    activityType: "Object Creator",
    icon: Braces,
    color: "bg-cyan-500",
  },
  {
    id: 8,
    title: "OOP Pillars",
    description: "The 4 rules of robust coding.",
    lessonType: "Article",
    activityType: "Concept Match",
    icon: Database,
    color: "bg-teal-500",
  },
  {
    id: 9,
    title: "Arrays & Collections",
    description: "Managing lists of data.",
    lessonType: "Article",
    activityType: "Predict the Output",
    icon: Layers,
    color: "bg-yellow-500",
  },
  {
    id: 10,
    title: "Error Handling",
    description: "Catching bugs before they bite.",
    lessonType: "Article",
    activityType: "Exception Escape",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
];
