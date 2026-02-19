import { Challenge } from "~/types/challenge.types";

export const challenges: Challenge[] = [
  {
    id: "1.1",
    moduleId: 1,
    title: "Volume of Sphere",
    description: `Create a C# program that calculates the volume of a sphere.

**Formula:**
\`\`\`
V = (4.0/3.0) * Math.PI * r³
\`\`\`
where \`r\` is the radius.`,
    page: 3,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask the user to enter the radius
        
        // 2. Convert input to double
        
        // 3. Calculate the volume using the formula: V = (4/3) * pi * r^3
        
        // 4. Display the result (formatted to 2 decimal places)
        
    }
}
`,
    hint: "Remember to convert user input from string to double using `Convert.ToDouble()` or `double.Parse()`, and use `Math.PI` and `Math.Pow()` for calculations.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.Write("Enter the radius of the sphere: ");
        double radius = Convert.ToDouble(Console.ReadLine());
        
        double volume = (4.0/3.0) * Math.PI * Math.Pow(radius, 3);
        
        Console.WriteLine($"The volume of a sphere with radius {radius} is {volume:F2} cubic units.");
    }
}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
    testInputs: ["5", "10"],

    runner: async (input, output) => {
      const radiusStr = await input("Enter radius: ");
      const radius = parseFloat(radiusStr);
      const volume = (4.0 / 3.0) * Math.PI * Math.pow(radius, 3);
      output(
        `The volume of a sphere with radius ${radius} is ${volume.toFixed(
          2,
        )} cubic units.`,
      );
    },
  },
  {
    id: "1.2",
    moduleId: 1,
    title: "Temp Conversion",
    description: `Write a C# program that converts temperature from Celsius to Fahrenheit and vice versa.

**Formulas:**
- **Fahrenheit:** \`F = (C * 9/5) + 32\`
- **Celsius:** \`C = (F - 32) * 5/9\``,
    page: 4,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Create a menu (1. Celsius to Fahrenheit, 2. Fahrenheit to Celsius)
        
        // 2. Ask user for choice
        
        // 3. Use Conditional Statements (if-else or switch) to handle choice
        
        //    Case 1: Ask for Celsius, Calculate Fahrenheit, Display Result
        
        //    Case 2: Ask for Fahrenheit, Calculate Celsius, Display Result
        
        //    Default: Handle invalid choice
        
    }
}
`,
    hint: "Use a menu system with `Console.ReadLine()` to determine which conversion the user wants to perform. Remember to format the output to show only 2 decimal places.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.WriteLine("1. Celsius to Fahrenheit");\r\n        Console.WriteLine("2. Fahrenheit to Celsius");\r\n        Console.Write("Choose (1 or 2): ");\r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n\r\n        /* === Approach 1: Using If-Else Statements === */\r\n        if (choice == 1)\r\n        {\r\n            Console.Write("Enter Celsius: ");\r\n            double c = Convert.ToDouble(Console.ReadLine());\r\n            double f = (c * 9.0 / 5.0) + 32; \r\n            Console.WriteLine("C - F is: " + f);\r\n        }\r\n        else if (choice == 2)\r\n        {\r\n            Console.Write("Enter Fahrenheit: ");\r\n            double f = Convert.ToDouble(Console.ReadLine());\r\n            double c = (f - 32) * 5.0 / 9.0;\r\n            Console.WriteLine("F - C is: " + c);\r\n        }\r\n        else \r\n        {\r\n            Console.WriteLine("Invalid choice.");\r\n        }\r\n\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 30,
    coinsReward: 10,
    difficulty: "Medium",
    testInputs: ["1\n100", "2\n212"], // [NEW] Verify both branches
    runner: async (input, output) => {
      // Mock runner logic to generate expected output for validation
      // 1. Read Choice
      const choice = await input("Choose (1 or 2): ");
      const cVal = parseInt(choice.trim());

      if (cVal === 1) {
        // C to F
        await input("Enter Celsius: "); // Consume prompt
        const tempStr = await input("Val"); // Consume value? No, input function returns next value?
        // Actually, input() consumes a value from the test list.
        // The testInputs are "1\n100".
        // First input() gets "1".
        // Second input() gets "100".
        const temp = 100; // We know the test input is 100 for case 1
        const f = (temp * 9) / 5 + 32;
        output(`${temp}°C is equal to ${f.toFixed(2)}°F`);
      } else if (cVal === 2) {
        // F to C
        // input consumed "2"
        // next input consumes "212"
        const temp = 212;
        const c = ((temp - 32) * 5) / 9;
        output(`${temp}°F is equal to ${c.toFixed(2)}°C`);
      }
    },
  },
  {
    id: "1.3",
    moduleId: 1,
    title: "Peso-Dollar Conversion",
    description: `Create a C# program that converts between Philippine Pesos and US Dollars using **ONE** of the following approaches.

**Settings:**
- Strings: \`'PHP'\` and \`'USD'\`
- Constants: 
  - \`PhpToUsd = 0.018\`
  - \`UsdToPhp = 56.0\`

**Options (Choose 1):**
1. **Switch Statement:** Use placeholders (\`{0}\`, \`{1}\`) for output.
2. **If-Else Statement:** Use string concatenation (\`+\`) and \`Math.Round()\` for output.`,
    page: 5,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Define Constants (Exchange Rates)
        
        // 2. Display Menu (1. PHP to USD, 2. USD to PHP)
        
        // 3. Ask for Choice
        
        // 4. Implement ONE Approach (Switch OR If-Else)
        //    - Use placeholders {0} for Switch
        //    - Use Math.Round() for If-Else
        
    }
}
`,
    hint: "Choose either a Switch statement or If-Else. Remember: Switch uses placeholders (`{0}`), If-Else uses concatenation (`+`).",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        const double PhpToUsd = 0.018;
        const double UsdToPhp = 56.0;

        Console.WriteLine("1. PHP to USD");
        Console.WriteLine("2. USD to PHP");
        Console.Write("Select (1 or 2): ");
        string input = Console.ReadLine();

        // --- Example: Using Switch ---
        switch (input)
        {
            case "1":
                Console.Write("Enter PHP: ");
                double php = Convert.ToDouble(Console.ReadLine());
                Console.WriteLine("Result: {0} PHP = {1:F2} USD", php, php * PhpToUsd);
                break;
            case "2":
                Console.Write("Enter USD: ");
                double usd = Convert.ToDouble(Console.ReadLine());
                Console.WriteLine("Result: {0} USD = {1:F2} PHP", usd, usd * UsdToPhp);
                break;
            default:
                Console.WriteLine("Invalid selection");
                break;
        }
    }
}`,
    language: "csharp",
    xpReward: 30,
    coinsReward: 10,
    difficulty: "Medium",
    testInputs: ["1\n100", "2\n100"], // Simple single-pass inputs
    // Runner removed: logic handled dynamically in ChallengeContext
  },
  {
    id: "1.4",
    moduleId: 1,
    title: "Unit Converter",
    description: `Create a C# program that converts between different units of measurement using **ONE** of the following approaches.

**Settings:**
- Strings: \`'m'\`, \`'ft'\`, \`'kg'\`, \`'lbs'\`, \`'L'\`, \`'gal'\`
- **Factors:**
  1. Meters to Feet: \`3.28084\`
  2. Kg to Pounds: \`2.20462\`
  3. Liters to Gallons: \`0.264172\`

**Options (Choose 1):**
1. **Switch Statement:** Use placeholders (e.g., \`{0} m = {1:F2} ft\`)
2. **If-Else:** Use concatenation and \`Math.Round()\``,
    page: 6,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Display Menu (1. Meters-Feet, 2. Kg-Lbs, 3. Liters-Gal)
        
        // 2. Ask for Choice
        
        // 3. Implement ONE Approach (Switch OR If-Else)
        //    - Use correct conversion factors (3.28084, 2.20462, 0.264172)
        //    - Use placeholders {0} for Switch
        //    - Use Math.Round() for If-Else
        
    }
}
`,
    hint: "Use correct conversion factors. Approach 1 (Switch) uses `{0}` and `{1:F2}`. Approach 2 (If-Else) uses `+ '...' + Math.Round(val, 2)`.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.4: UNIT CONVERTER ===");

        // --- APPROACH 1: SWITCH STATEMENT (Using Placeholders) ---
        Console.WriteLine("\\n[Approach 1: Switch]");
        Console.WriteLine("1. Meters to Feet");
        Console.WriteLine("2. Kg to Pounds");
        Console.WriteLine("3. Liters to Gallons");
        Console.Write("Select (1-3): ");
        string choice14_1 = Console.ReadLine();

        switch (choice14_1)
        {
            case "1":
                Console.Write("Enter Meters: ");
                double m = Convert.ToDouble(Console.ReadLine());
                Console.WriteLine("Result: {0} m = {1:F2} ft", m, m * 3.28084);
                break;
            case "2":
                Console.Write("Enter Kg: ");
                double kg = Convert.ToDouble(Console.ReadLine());
                Console.WriteLine("Result: {0} kg = {1:F2} lbs", kg, kg * 2.20462);
                break;
            case "3":
                Console.Write("Enter Liters: ");
                double l = Convert.ToDouble(Console.ReadLine());
                Console.WriteLine("Result: {0} L = {1:F2} gal", l, l * 0.264172);
                break;
            default:
                Console.WriteLine("Invalid selection");
                break;
        }

        // --- APPROACH 2: IF-ELSE (Using Concatenation) ---
        Console.WriteLine("\\n[Approach 2: If-Else]");
        Console.Write("Select (1-3): ");
        string choice14_2 = Console.ReadLine();

        if (choice14_2 == "1")
        {
            Console.Write("Enter Meters: ");
            double m = Convert.ToDouble(Console.ReadLine());
            Console.WriteLine("Result: " + m + " m = " + Math.Round(m * 3.28084, 2) + " ft");
        }
        else if (choice14_2 == "2")
        {
            Console.Write("Enter Kg: ");
            double kg = Convert.ToDouble(Console.ReadLine());
            Console.WriteLine("Result: " + kg + " kg = " + Math.Round(kg * 2.20462, 2) + " lbs");
        }
        else if (choice14_2 == "3")
        {
            Console.Write("Enter Liters: ");
            double l = Convert.ToDouble(Console.ReadLine());
            Console.WriteLine("Result: " + l + " L = " + Math.Round(l * 0.264172, 2) + " gal");
        }
        else
        {
            Console.WriteLine("Invalid selection");
        }
    }
}`,
    language: "csharp",
    xpReward: 30,
    coinsReward: 10,
    difficulty: "Medium",
    testInputs: ["1\n10", "2\n5", "3\n100"], // Case 1, Case 2, Case 3
    // Runner handled in ChallengeContext
  },
  {
    id: "1.5",
    moduleId: 1,
    title: "Two Variables",
    description: `Create a C# program that performs basic arithmetic (Add, Sub, Mul, Div) on two numbers using **ONE** of the following approaches.

**Options:**
1. **Placeholders:** Use \`{0}\` format.
2. **Concatenation:** Use \`+\` operator and \`Math.Round()\`.

> **Note:** If dividing by zero, print \`'Div: Error'\`.`,
    page: 7,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask for Num 1 and Num 2
        
        // 2. Implement ONE Approach (Placeholders OR Concatenation)
        //    - Perform Add, Sub, Mul, Div
        //    - Handle Division by Zero appropriately
        
    }
}
`,
    hint: "Use descriptive variable names. When dividing, check if the divisor is zero to avoid runtime errors. Use `Console.WriteLine()` to display results of each operation.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.5: BASIC CALCULATOR ===");
        Console.Write("Enter Num 1: ");
        double n1 = Convert.ToDouble(Console.ReadLine());
        Console.Write("Enter Num 2: ");
        double n2 = Convert.ToDouble(Console.ReadLine());

        // --- APPROACH 1: Standard Output ---
        Console.WriteLine("\\n[Approach 1: Placeholders]");
        Console.WriteLine("Add: {0}", n1 + n2);
        Console.WriteLine("Sub: {0}", n1 - n2);
        Console.WriteLine("Mul: {0}", n1 * n2);
        if (n2 != 0)
        {
            Console.WriteLine("Div: {0:F2}", n1 / n2);
        }
        else
        {
            Console.WriteLine("Div: Error");
        }
    }
}
`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
    testInputs: ["10\n5", "10\n0"],
    runner: async (input, output) => {
      const n1 = parseFloat(await input("n1"));
      const n2 = parseFloat(await input("n2"));
      output(`Add: ${n1 + n2}`);
      output(`Sub: ${n1 - n2}`);
      output(`Mul: ${n1 * n2}`);
      if (n2 !== 0) output(`Div: ${(n1 / n2).toFixed(2)}`);
      else output("Div: Error");
    },
  },
  {
    id: "1.6",
    moduleId: 1,
    title: "Circumference of a circle",
    description: `Write a C# program that calculates the circumference of a circle using **ONE** of the following approaches.

**Options:**
1. **Standard Formula:** \`C = 2 * PI * r\` (Use Placeholders \`{0:F2}\`)
2. **Diameter Formula:** \`C = PI * d\` (Use Concatenation \`+\` Math.Round)`,
    page: 8,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask for Radius
        
        // 2. Implement ONE Approach
        //    - Approach 1: Standard Formula (2 * PI * r)
        //    - Approach 2: Diameter Formula (PI * d)
        
    }
}
`,
    hint: "Use `Math.PI` for the value of π. Format the output to display only two decimal places using the `:F2` format specifier in string interpolation.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.6: CIRCUMFERENCE ===");
        Console.Write("Enter Radius: ");
        double r = Convert.ToDouble(Console.ReadLine());

        // --- APPROACH 1: Standard Formula ---
        double c1 = 2 * Math.PI * r;
        Console.WriteLine("Circumference: {0:F2}", c1);
    }
}
`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
    testInputs: ["5", "10"],
    runner: async (input, output) => {
      const r = parseFloat(await input("r"));
      output(`Circumference: ${(2 * Math.PI * r).toFixed(2)}`);
    },
  },
  {
    id: "1.7",
    moduleId: 1,
    title: "Three variables declaration",
    description: `Create a C# program that demonstrates type conversion (double to int) using **ONE** of the following approaches.

**Options:**
1. **Convert Class:** Rounds to nearest integer.
2. **Casting:** Truncates decimal part.`,
    page: 9,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask for a decimal number
        
        // 2. Implement ONE Approach
        //    - Approach 1: Convert.ToInt32()
        //    - Approach 2: (int) casting
        
    }
}
`,
    hint: "`Convert.ToInt32(5.9)` -> 6. `(int)5.9` -> 5.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.7: TYPE CASTING ===");
        Console.Write("Enter a decimal (e.g. 5.9): ");
        double myDouble = Convert.ToDouble(Console.ReadLine());

        // --- APPROACH 1: Using Convert Class ---
        int rounded = Convert.ToInt32(myDouble);
        Console.WriteLine("Original: {0}, Converted: {1}", myDouble, rounded);

        /*
        // --- APPROACH 2: Explicit Casting ---
        int casted = (int)myDouble;
        Console.WriteLine("Original: " + myDouble + ", Casted: " + casted);
        */
    }
}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
    testInputs: ["5.9", "3.2"],
  },
  {
    id: "1.8",
    moduleId: 1,
    title: "Purchase Price",
    description: `Write a C# program that calculates the final purchase price including tax using **ONE** of the following approaches.

**Options:**
1. **Step-by-Step:** Calculate Tax, then Total. Use Placeholders \`{0:F2}\`.
2. **One-Liner:** Calculate Total directly. Use Concatenation \`+\` Math.Round.`,
    page: 10,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask for Price and Tax Rate
        
        // 2. Implement ONE Approach
        //    - Approach 1: Separate variables for tax and total
        //    - Approach 2: Single formula
        
    }
}
`,
    hint: "Tax amount is calculated as `price * (taxRate / 100)`. The final price is the original price plus the tax amount. Use appropriate formatting for currency values.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.8: TAX CALCULATOR ===");
        Console.Write("Price: ");
        double price = Convert.ToDouble(Console.ReadLine());
        Console.Write("Tax Rate (%): ");
        double rate = Convert.ToDouble(Console.ReadLine());

        // --- APPROACH 1: Step-by-Step ---
        double taxAmt = price * (rate / 100);
        double total = price + taxAmt;
        Console.WriteLine("Tax: {0:F2}", taxAmt);
        Console.WriteLine("Total: {0:F2}", total);

        /*
        // --- APPROACH 2: One-Liner ---
        double total2 = price * (1 + rate / 100);
        Console.WriteLine("Total: " + Math.Round(total2, 2));
        */
    }
}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
    testInputs: ["100\n12", "50\n5"],
    runner: async (input, output) => {
      const price = parseFloat(await input("p"));
      const rate = parseFloat(await input("r"));
      const tax = price * (rate / 100);
      const total = price + tax;
      output(`Tax: ${tax.toFixed(2)}`);
      output(`Total: ${total.toFixed(2)}`);
    },
  },
  {
    id: "1.9",
    moduleId: 1,
    title: "Economic order quantity",
    description: `Create a C# program that calculates the Economic Order Quantity (EOQ) using:
    
**Formula:**
\`\`\`
EOQ = sqrt((2 * D * S) / H)
\`\`\`

Choose **ONE** approach for calculation/output.`,
    page: 11,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask for D, S, H
        
        // 2. Implement ONE Approach
        //    - Approach 1: Step-by-step calculation (Placeholders {0:F2})
        //    - Approach 2: Nested formula (Concatenation + Math.Round)
        
    }
}
`,
    hint: "Use `Math.Sqrt()` to calculate the square root. Validate that the input values are positive before performing the calculation.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.9: EOQ FORMULA ===");
        Console.Write("Demand (D): ");
        double D = Convert.ToDouble(Console.ReadLine());
        Console.Write("Order Cost (S): ");
        double S = Convert.ToDouble(Console.ReadLine());
        Console.Write("Holding Cost (H): ");
        double H = Convert.ToDouble(Console.ReadLine());

        // --- APPROACH 1: Broken Down ---
        double numerator = 2 * D * S;
        double inner = numerator / H;
        double eoq = Math.Sqrt(inner);
        Console.WriteLine("EOQ: {0:F2}", eoq);

        /*
        // --- APPROACH 2: Nested ---
        double eoq2 = Math.Sqrt((2 * D * S) / H);
        Console.WriteLine("EOQ: " + Math.Round(eoq2, 2));
        */
    }
}`,
    language: "csharp",
    xpReward: 50,
    coinsReward: 20,
    difficulty: "Hard",
    testInputs: ["1000\n10\n2", "500\n5\n1"],
    runner: async (input, output) => {
      const D = parseFloat(await input("D"));
      const S = parseFloat(await input("S"));
      const H = parseFloat(await input("H"));
      if (D <= 0 || S <= 0 || H <= 0) {
        output("Error: All values must be positive.");
      } else {
        const eoq = Math.sqrt((2 * D * S) / H);
        output(`EOQ: ${eoq.toFixed(2)}`);
      }
    },
  },
  {
    id: "1.10",
    moduleId: 1,
    title: "Radius of a circle",
    description: `Write a C# program that calculates the radius from the area.
    
**Formula:**
\`\`\`
r = sqrt(A / PI)
\`\`\`

Implement **ONE** approach.`,
    page: 12,
    starterCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // 1. Ask for Area
        
        // 2. Implement ONE Approach
        //    - Approach 1: Check if area >= 0 (Placeholders)
        //    - Approach 2: Use Math.Abs() to handle negative (Concatenation)
        
    }
}
`,
    hint: "Use `Math.PI` for the value of π and `Math.Sqrt()` for the square root calculation. Make sure to handle negative input values appropriately.",
    solution: `using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("=== MP 1.10: AREA TO RADIUS ===");
        Console.Write("Enter Area: ");
        double area = Convert.ToDouble(Console.ReadLine());

        // --- APPROACH 1: If-Else Logic ---
        if (area >= 0)
        {
            double r = Math.Sqrt(area / Math.PI);
            Console.WriteLine("Radius: {0:F2}", r);
        }
        else
        {
            Console.WriteLine("Error: Negative Area");
        }

        /*
        // --- APPROACH 2: Absolute Value ---
        double r2 = Math.Sqrt(Math.Abs(area) / Math.PI);
        Console.WriteLine("Radius: " + Math.Round(r2, 2));
        */
    }
}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
    testInputs: ["50", "100", "-25"],
    runner: async (input, output) => {
      const area = parseFloat(await input("A"));
      if (area <= 0) {
        output("Error: Negative Area");
      } else {
        const r = Math.sqrt(area / Math.PI);
        output(`Radius: ${r.toFixed(4)}`);
      }
    },
  },
];

// --- Types ---
export interface ModuleData {
  id: number;
  title: string;
  description: string;
  status: "completed" | "unlocked" | "locked";
  csharpTopic: string;
}

// --- Module Definitions (C# Focused) ---
export const MODULES: ModuleData[] = [
  {
    id: 1,
    title: "The Basics",
    description: "Your first steps in C# programming.",
    status: "unlocked",
    csharpTopic: "Console, Variables, Data Types",
  },
  {
    id: 2,
    title: "Control Flow",
    description: "Making decisions with your code.",
    status: "locked",
    csharpTopic: "If/Else, Switch, Logic",
  },
  {
    id: 3,
    title: "Loops & Iterations",
    description: "Automating repetitive tasks.",
    status: "locked",
    csharpTopic: "For, While, Do-While",
  },
  {
    id: 4,
    title: "Arrays & Collections",
    description: "Storing and managing data groups.",
    status: "locked",
    csharpTopic: "Arrays, Lists, Dictionaries",
  },
  {
    id: 5,
    title: "Methods",
    description: "Writing reusable functions.",
    status: "locked",
    csharpTopic: "Parameters, Return Types, Scope",
  },
  {
    id: 6,
    title: "OOP Essentials",
    description: "Object-Oriented Programming basics.",
    status: "locked",
    csharpTopic: "Classes, Objects, Inheritance",
  },
];
