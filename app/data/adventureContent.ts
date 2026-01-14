import {
  Terminal,
  Code,
  Box,
  Cpu,
  Layers,
  PlayCircle,
  Braces,
  Database,
  AlertTriangle,
  Zap,
} from "lucide-react";

// --- VISUAL TEMPLATE (Icons & Colors) ---
export const CHAPTER_VISUALS = [
  {
    id: 1,
    icon: Terminal,
    color: "bg-blue-500",
    activityLabel: "System Boot",
  },
  {
    id: 2,
    icon: Code,
    color: "bg-emerald-500",
    activityLabel: "Syntax Repair",
  },
  { id: 3, icon: Box, color: "bg-indigo-500", activityLabel: "Data Sort" },
  { id: 4, icon: Cpu, color: "bg-orange-500", activityLabel: "Logic Gate" },
  {
    id: 5,
    icon: Layers,
    color: "bg-purple-500",
    activityLabel: "Flow Control",
  },
  {
    id: 6,
    icon: PlayCircle,
    color: "bg-pink-500",
    activityLabel: "Ability Forge",
  },
  {
    id: 7,
    icon: Braces,
    color: "bg-cyan-500",
    activityLabel: "Construct Bay",
  },
  {
    id: 8,
    icon: Zap,
    color: "bg-teal-500",
    activityLabel: "Pillar Defense",
  },
  {
    id: 9,
    icon: Database,
    color: "bg-yellow-500",
    activityLabel: "Data Stream",
  },
  {
    id: 10,
    icon: AlertTriangle,
    color: "bg-red-500",
    activityLabel: "Fault Zone",
  },
];

// --- C# LESSON DATA ---
export const CSHARP_LESSONS = [
  {
    id: 1,
    title: "Understanding C# and .NET",
    description: "The Grid is offline. ION activates the Language Core.",
    content_markdown: `
🧭 Lore — Sector 01: System Boot
The Grid is offline. Raw energy flows without structure. ION activates the Language Core.

ION: "Before the world can run, it must understand its language. C# is that language. .NET is the engine that sustains it."

🚀 What is C#?
C# (pronounced C-sharp) is a modern, object-oriented programming language created by Microsoft. It is widely used for:
🖥 Desktop applications
🌐 Web applications
📱 Mobile apps
🎮 Games (Unity)

⚙️ What is .NET?
.NET is the development platform (engine) that runs your C# code. It manages memory, handles errors, and compiles your code.

🧩 Analogy
C# is the language you speak. .NET is the brain that understands and executes it.
    `,
    codeSnippet: `Console.WriteLine("Hello, CodeON!");`,
    keyTakeaway: "You write in C#, but .NET makes it run.",
    xp_reward: 50,
    activities: [
      {
        type: "QUIZ",
        prompt: "Concept Check",
        data: {
          question: "Which of these is the 'Engine' that runs your code?",
          options: ["C#", ".NET", "Visual Studio", "CodeON"],
          answer: ".NET",
        },
      },
      {
        type: "MATCHING",
        prompt: "Connect the Concepts",
        data: {
          pairs: [
            { left: "C#", right: "The Language" },
            { left: ".NET", right: "The Engine" },
            { left: "Console", right: "Output Screen" },
          ],
        },
      },
      {
        type: "QUIZ",
        prompt: "Knowledge Check",
        data: {
          question: "What is the file extension for a C# file?",
          options: [".py", ".java", ".cs", ".net"],
          answer: ".cs",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Build your first command",
        data: {
          segments: ["Console", ".", "WriteLine", "(", '"Hello!"', ");"],
          correctOrder: [0, 1, 2, 3, 4, 5],
        },
      },
      {
        type: "QUIZ",
        prompt: "History Check",
        data: {
          question: "Who created C#?",
          options: ["Apple", "Google", "Microsoft", "Facebook"],
          answer: "Microsoft",
        },
      },
    ],
  },
  {
    id: 2,
    title: "Basic Syntax and Structure",
    description: "Fragments of corrupted code collapse unstable zones.",
    content_markdown: `
🧭 Lore — Sector 02: Structural Integrity
Fragments of corrupted code collapse unstable zones.

ION: "Structure is survival. Without order, even power fails."

✍️ What is syntax?
Syntax is the rulebook of C#. Even one missing symbol can break your program.

🏗 Structure of a C# program
Every program follows a clear structure:
1. using → imports tools
2. class → container for your code
3. Main() → where execution starts
    `,
    codeSnippet: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Welcome to CodeON");
    }
}`,
    keyTakeaway:
      "C# follows strict structure, and Main() is where everything begins.",
    xp_reward: 100,
    activities: [
      {
        type: "MATCHING",
        prompt: "Syntax Meanings",
        data: {
          pairs: [
            { left: "using", right: "Import Tools" },
            { left: "class", right: "Code Container" },
            { left: "Main()", right: "Start Point" },
          ],
        },
      },
      {
        type: "QUIZ",
        prompt: "Structure Check",
        data: {
          question: "Where does the C# program start executing?",
          options: ["Start()", "Run()", "Main()", "Begin()"],
          answer: "Main()",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Assemble the Entry Point",
        data: {
          segments: ["static", "void", "Main", "(", ")", "{", "}"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        type: "QUIZ",
        prompt: "Symbol Check",
        data: {
          question: "What symbol ends a statement in C#?",
          options: [".", ";", ":", ","],
          answer: ";",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Import the System",
        data: {
          segments: ["using", "System", ";"],
          correctOrder: [0, 1, 2],
        },
      },
    ],
  },
  {
    id: 3,
    title: "Variables and Data Types",
    description:
      "Data crystals flood the sector—each must be stored correctly.",
    content_markdown: `
🧭 Lore — Sector 03: Memory Vaults
Data crystals flood the sector—each must be stored correctly.

ION: "Power wasted is power lost. Choose the right container."

📦 What is a variable?
A variable is a container that stores data. It has a Type, a Name, and a Value.

🔢 Common Data Types
int → whole numbers (e.g., 5)
double → decimals (e.g., 5.99)
string → text (e.g., "Alex")
bool → true / false
    `,
    codeSnippet: `int age = 18;
string name = "Alex";
bool isStudent = true;`,
    keyTakeaway:
      "Variables store data, and data types define what kind of data is allowed.",
    xp_reward: 150,
    activities: [
      {
        type: "MATCHING",
        prompt: "Match Data to Type",
        data: {
          pairs: [
            { left: "100", right: "int" },
            { left: "99.5", right: "double" },
            { left: '"Hello"', right: "string" },
            { left: "true", right: "bool" },
          ],
        },
      },
      {
        type: "QUIZ",
        prompt: "Type Selection",
        data: {
          question: "Which type is best for storing a user's age?",
          options: ["string", "bool", "int", "double"],
          answer: "int",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Create a Text Variable",
        data: {
          segments: ["string", "hero", "=", '"ION"', ";"],
          correctOrder: [0, 1, 2, 3, 4],
        },
      },
      {
        type: "QUIZ",
        prompt: "Boolean Logic",
        data: {
          question: "What values can a 'bool' hold?",
          options: ["Yes/No", "True/False", "0/1", "Any text"],
          answer: "True/False",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Define a Whole Number",
        data: {
          segments: ["int", "score", "=", "100", ";"],
          correctOrder: [0, 1, 2, 3, 4],
        },
      },
    ],
  },
  {
    id: 4,
    title: "Operators",
    description: "Ancient gates respond only to precise calculations.",
    content_markdown: `
🧭 Lore — Sector 04: Logic Gates
Ancient gates respond only to precise calculations.

ION: "Logic opens paths. Guessing closes them."

➗ What are operators?
Symbols that perform actions like math and logic.

🧮 Types
1. Arithmetic: + - * /
2. Comparison: == != > <
3. Logical: && (AND), || (OR), ! (NOT)
    `,
    codeSnippet: `int total = 5 + 3;
bool isPassed = total >= 8;`,
    keyTakeaway: "Operators are how your code thinks and calculates.",
    xp_reward: 150,
    activities: [
      {
        type: "QUIZ",
        prompt: "Math Check",
        data: {
          question: "What is the result of: 10 + 5?",
          options: ["105", "15", "50", "Error"],
          answer: "15",
        },
      },
      {
        type: "MATCHING",
        prompt: "Identify Symbols",
        data: {
          pairs: [
            { left: "==", right: "Equals" },
            { left: "!=", right: "Not Equals" },
            { left: "&&", right: "AND" },
            { left: "||", right: "OR" },
          ],
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Check if Score is Passing",
        data: {
          segments: ["bool", "pass", "=", "score", ">", "50", ";"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        type: "QUIZ",
        prompt: "Concatenation",
        data: {
          question: "What happens when you add two strings?",
          options: [
            "They multiply",
            "They join together",
            "It causes an error",
            "They subtract",
          ],
          answer: "They join together",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Calculate Sum",
        data: {
          segments: ["int", "sum", "=", "a", "+", "b", ";"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
    ],
  },
  {
    id: 5,
    title: "Control Structures",
    description: "Time loops fracture the Grid, repeating endlessly.",
    content_markdown: `
🧭 Lore — Sector 05: Flow Nexus
Time loops fracture the Grid, repeating endlessly.

ION: "Decisions define direction. Loops define endurance."

🔀 Control Structures
They decide which code runs and when.

if / else: Makes decisions based on conditions.
for / while: Repeats tasks efficiently.
    `,
    codeSnippet: `if (score >= 75) {
    Console.WriteLine("Passed!");
}

for (int i = 0; i < 3; i++) {
    Console.WriteLine("Looping...");
}`,
    keyTakeaway: "They control decisions and repetition in your program.",
    xp_reward: 200,
    activities: [
      {
        type: "MATCHING",
        prompt: "Flow Keywords",
        data: {
          pairs: [
            { left: "if", right: "Make decision" },
            { left: "else", right: "Alternative" },
            { left: "for", right: "Repeat count" },
            { left: "while", right: "Repeat condition" },
          ],
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Construct an If Statement",
        data: {
          segments: ["if", "(", "energy", ">", "0", ")", "{", "Run();", "}"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        },
      },
      {
        type: "QUIZ",
        prompt: "Loop Logic",
        data: {
          question:
            "Which loop is best when you know exactly how many times to repeat?",
          options: ["while", "foreach", "for", "if"],
          answer: "for",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Create a While Loop",
        data: {
          segments: ["while", "(", "isRunning", ")", "{", "Update();", "}"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        type: "QUIZ",
        prompt: "Condition Check",
        data: {
          question: "What runs if the 'if' condition is FALSE?",
          options: [
            "The if block",
            "The else block",
            "The program crashes",
            "Nothing ever",
          ],
          answer: "The else block",
        },
      },
    ],
  },
  {
    id: 6,
    title: "Methods",
    description: "Runners begin crafting repeatable skills.",
    content_markdown: `
🧭 Lore — Sector 06: Ability Forge
Runners begin crafting repeatable skills.

ION: "Mastery is not repetition. It is refinement."

🧩 What is a method?
A method is a reusable block of code that performs a specific task. Instead of writing the same code twice, you call the method.

DRY Principle: Don't Repeat Yourself.
    `,
    codeSnippet: `static int Add(int a, int b) 
{
    return a + b;
}`,
    keyTakeaway: "Methods group logic into reusable actions.",
    xp_reward: 200,
    activities: [
      {
        type: "MATCHING",
        prompt: "Method Terms",
        data: {
          pairs: [
            { left: "void", right: "Returns nothing" },
            { left: "return", right: "Sends data back" },
            { left: "Parameter", right: "Input data" },
          ],
        },
      },
      {
        type: "QUIZ",
        prompt: "Calling Code",
        data: {
          question: "How do you execute a method named 'Jump'?",
          options: ["Jump", "Jump();", "Call Jump", "Execute(Jump)"],
          answer: "Jump();",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Define a Greeting Method",
        data: {
          segments: [
            "void",
            "Greet",
            "(",
            ")",
            "{",
            'Console.WriteLine("Hi");',
            "}",
          ],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        type: "QUIZ",
        prompt: "Naming Convention",
        data: {
          question: "How should public methods be named in C#?",
          options: ["camelCase", "PascalCase", "snake_case", "UPPERCASE"],
          answer: "PascalCase",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Return a Value",
        data: {
          segments: ["int", "GetScore", "(", ")", "{", "return", "100;", "}"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
        },
      },
    ],
  },
  {
    id: 7,
    title: "Classes and Objects",
    description: "Blueprints transform into living constructs.",
    content_markdown: `
🧭 Lore — Sector 07: Construct Bay
Blueprints transform into living constructs.

ION: "Design shapes reality. Objects make it real."

🏭 Class vs Object
Class: The Blueprint (e.g., definition of a Car).
Object: The Instance (e.g., that specific Red Toyota).
    `,
    codeSnippet: `class Car {
    public string Color;
}

Car myCar = new Car();
myCar.Color = "Red";`,
    keyTakeaway: "Classes define objects. Objects use those definitions.",
    xp_reward: 250,
    activities: [
      {
        type: "MATCHING",
        prompt: "Blueprint vs Reality",
        data: {
          pairs: [
            { left: "Class", right: "The Blueprint" },
            { left: "Object", right: "The Real Thing" },
            { left: "new", right: "Creates Object" },
          ],
        },
      },
      {
        type: "QUIZ",
        prompt: "Instantiation",
        data: {
          question: "Which keyword creates a new instance of a class?",
          options: ["create", "make", "new", "init"],
          answer: "new",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Create a New Object",
        data: {
          segments: ["Car", "myRide", "=", "new", "Car", "(", ")", ";"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
        },
      },
      {
        type: "QUIZ",
        prompt: "Accessing Data",
        data: {
          question: "How do you access a variable inside an object?",
          options: ["Arrow (->)", "Dot (.)", "Slash (/)", "Colon (:)"],
          answer: "Dot (.)",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Set Object Property",
        data: {
          segments: ["myRide", ".", "Color", "=", '"Blue"', ";"],
          correctOrder: [0, 1, 2, 3, 4, 5],
        },
      },
    ],
  },
  {
    id: 8,
    title: "OOP Pillars",
    description: "Four ancient structures stabilize the Core.",
    content_markdown: `
🧭 Lore — Sector 08: The Four Obelisks
Four ancient structures stabilize the Core.

ION: "These pillars have held worlds together. Respect them."

🏛 The 4 Pillars
1. Encapsulation: Hiding/Protecting data.
2. Inheritance: Reusing code from a parent.
3. Polymorphism: Same action, different behaviors.
4. Abstraction: Hiding complexity.
    `,
    codeSnippet: `// 1. Encapsulation
// 2. Inheritance
// 3. Polymorphism
// 4. Abstraction`,
    keyTakeaway: "OOP pillars keep large programs organized and flexible.",
    xp_reward: 300,
    activities: [
      {
        type: "QUIZ",
        prompt: "Pillar Knowledge",
        data: {
          question: "Which pillar involves 'Protecting Data'?",
          options: [
            "Inheritance",
            "Polymorphism",
            "Encapsulation",
            "Abstraction",
          ],
          answer: "Encapsulation",
        },
      },
      {
        type: "MATCHING",
        prompt: "Match the Meaning",
        data: {
          pairs: [
            { left: "Inheritance", right: "Reuse Parent Code" },
            { left: "Polymorphism", right: "Many Forms" },
            { left: "Abstraction", right: "Hide Details" },
          ],
        },
      },
      {
        type: "QUIZ",
        prompt: "Syntax Symbol",
        data: {
          question: "Which symbol represents Inheritance in C#?",
          options: [":", "->", "=>", "::"],
          answer: ":",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Inherit a Class",
        data: {
          segments: ["class", "Dog", ":", "Animal", "{", "}"],
          correctOrder: [0, 1, 2, 3, 4, 5],
        },
      },
      {
        type: "QUIZ",
        prompt: "Concept Check",
        data: {
          question: "What does 'Poly' mean in Polymorphism?",
          options: ["One", "Many", "Hidden", "Secure"],
          answer: "Many",
        },
      },
    ],
  },
  {
    id: 9,
    title: "Arrays and Collections",
    description: "Streams of entities surge through the Grid.",
    content_markdown: `
🧭 Lore — Sector 09: Data Streams
Streams of entities surge through the Grid.

ION: "Single strength is fragile. Groups endure."

📚 Arrays vs Collections
Array []: Fixed size. Good for static lists.
List<T>: Dynamic size. Good when items are added/removed.
    `,
    codeSnippet: `int[] numbers = { 1, 2, 3 };
List<string> names = new List<string>();
names.Add("ION");`,
    keyTakeaway: "Arrays and collections store groups of data efficiently.",
    xp_reward: 250,
    activities: [
      {
        type: "MATCHING",
        prompt: "Data Structures",
        data: {
          pairs: [
            { left: "Array", right: "Fixed Size" },
            { left: "List", right: "Dynamic Size" },
            { left: "Index 0", right: "First Item" },
          ],
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Define a Number Array",
        data: {
          segments: [
            "int",
            "[",
            "]",
            "nums",
            "=",
            "{",
            "1",
            ",",
            "2",
            "}",
            ";",
          ],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      },
      {
        type: "QUIZ",
        prompt: "Counting Logic",
        data: {
          question:
            "If an array has 5 items, what is the index of the last item?",
          options: ["5", "4", "1", "0"],
          answer: "4",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Add to List",
        data: {
          segments: ["names", ".", "Add", "(", '"ION"', ")", ";"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
      {
        type: "QUIZ",
        prompt: "Syntax Check",
        data: {
          question: "Which one can change its size dynamically?",
          options: ["Array", "int", "List", "string"],
          answer: "List",
        },
      },
    ],
  },
  {
    id: 10,
    title: "Error Handling",
    description: "The System glitches. Failures threaten collapse.",
    content_markdown: `
🧭 Lore — Sector 10: Fault Zone
The System glitches. Failures threaten collapse.

ION: "Errors are not the end. They are signals."

🚨 Try-Catch
Error handling prevents crashes. You "try" to run risky code, and "catch" any errors if they happen.
    `,
    codeSnippet: `try {
    int num = int.Parse("abc");
} catch {
    Console.WriteLine("That is not a number!");
}`,
    keyTakeaway: "try-catch keeps your program safe from unexpected errors.",
    xp_reward: 300,
    activities: [
      {
        type: "MATCHING",
        prompt: "Error Terms",
        data: {
          pairs: [
            { left: "Try", right: "Attempt Code" },
            { left: "Catch", right: "Handle Error" },
            { left: "Finally", right: "Always Runs" },
          ],
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Safeguard the Code",
        data: {
          segments: ["try", "{", "Risk();", "}", "catch", "{", "Safe();", "}"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
        },
      },
      {
        type: "QUIZ",
        prompt: "Safety Check",
        data: {
          question: "What block runs if an error happens?",
          options: ["try", "if", "catch", "else"],
          answer: "catch",
        },
      },
      {
        type: "QUIZ",
        prompt: "Concept Check",
        data: {
          question: "Why do we use try-catch?",
          options: [
            "To make code faster",
            "To prevent crashing",
            "To hide code",
            "To declare variables",
          ],
          answer: "To prevent crashing",
        },
      },
      {
        type: "BUILDING_BLOCKS",
        prompt: "Throw an Error",
        data: {
          segments: ["throw", "new", "Exception", "(", '"Error!"', ")", ";"],
          correctOrder: [0, 1, 2, 3, 4, 5, 6],
        },
      },
    ],
  },
];
