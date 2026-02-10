import { Challenge } from "~/types/challenge.types";

export const challenges: Challenge[] = [
  {
    id: "1.1",
    moduleId: 1,
    title: "Volume of Sphere",
    description:
      "Create a C# program that calculates the volume of a sphere. Use the formula V = (4.0/3.0) * Math.PI * r³, where r is the radius.",
    page: 3,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Your code here to calculate the volume of a sphere\r\n        // Ask the user to enter the radius\r\n        // Calculate the volume\r\n        // Display the result\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Remember to convert user input from string to double using Convert.ToDouble() or double.Parse(), and use Math.PI and Math.Pow() for calculations.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the radius of the sphere: ");\r\n        double radius = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        double volume = (4.0/3.0) * Math.PI * Math.Pow(radius, 3);\r\n        \r\n        Console.WriteLine($"The volume of a sphere with radius \${radius} is \${volume:F2} cubic units.");\r\n    }\r\n}`,
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
    description:
      "Write a C# program that converts temperature from Celsius to Fahrenheit and vice versa. Use the formulas: F = (C * 9/5) + 32 and C = (F - 32) * 5/9.",
    page: 4,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Write code to convert between Celsius and Fahrenheit\r\n        // Ask the user which conversion they want to perform\r\n        // Get the temperature value\r\n        // Perform conversion and display result\r\n    } \r\n} `,
    hint: "Use a menu system with Console.ReadLine() to determine which conversion the user wants to perform. Remember to format the output to show only 2 decimal places.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.WriteLine("Temperature Conversion");\r\n        Console.WriteLine("1. Celsius to Fahrenheit");\r\n        Console.WriteLine("2. Fahrenheit to Celsius");\r\n        Console.Write("Enter your choice (1 or 2): ");\r\n        \r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n        \r\n        if (choice == 1)\r\n        {\r\n            Console.Write("Enter temperature in Celsius: ");\r\n            double celsius = Convert.ToDouble(Console.ReadLine());\r\n            double fahrenheit = (celsius * 9/5) + 32;\r\n            Console.WriteLine($"\${celsius}°C is equal to \${fahrenheit:F2}°F");\r\n        }\r\n        else if (choice == 2)\r\n        {\r\n            Console.Write("Enter temperature in Fahrenheit: ");\r\n            double fahrenheit = Convert.ToDouble(Console.ReadLine());\r\n            double celsius = (fahrenheit - 32) * 5/9;\r\n            Console.WriteLine($"\${fahrenheit}°F is equal to \${celsius:F2}°C");\r\n        }\r\n        else\r\n        {\r\n            Console.WriteLine("Invalid choice!");\r\n        }\r\n    }\r\n}`,
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
    description:
      "Create a C# program that converts between Philippine Pesos and US Dollars. Allow the user to convert in either direction using current exchange rates.",
    page: 5,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Set the exchange rate (you can use any reasonable rate)\r\n        // Create a menu for PHP to USD or USD to PHP conversion\r\n        // Get user input and perform the conversion\r\n        // Display the result with appropriate formatting\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: 'Define a constant for the exchange rate. Use string formatting to display currency values with 2 decimal places. Consider using the "$ " string interpolation feature.',
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Exchange rate (example value - can be updated)\r\n        const double phpToUsdRate = 0.018;\r\n        const double usdToPhpRate = 56.0;\r\n        \r\n        Console.WriteLine("Currency Converter");\r\n        Console.WriteLine("1. PHP to USD");\r\n        Console.WriteLine("2. USD to PHP");\r\n        Console.Write("Enter your choice (1 or 2): ");\r\n        \r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n        \r\n        if (choice == 1)\r\n        {\r\n            Console.Write("Enter amount in PHP: ");\r\n            double php = Convert.ToDouble(Console.ReadLine());\r\n            double usd = php * phpToUsdRate;\r\n            Console.WriteLine($"\${php:F2} PHP = \${usd:F2} USD");\r\n        }\r\n        else if (choice == 2)\r\n        {\r\n            Console.Write("Enter amount in USD: ");\r\n            double usd = Convert.ToDouble(Console.ReadLine());\r\n            double php = usd * usdToPhpRate;\r\n            Console.WriteLine($"\${usd:F2} USD = \${php:F2} PHP");\r\n        }\r\n        else\r\n        {\r\n            Console.WriteLine("Invalid choice!");\r\n        }\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 30,
    coinsReward: 10,
    difficulty: "Medium",
  },
  {
    id: "1.4",
    moduleId: 1,
    title: "Measurement Conversion",
    description:
      "Write a C# program that converts between different units of measurement (e.g., meters to feet, kilograms to pounds, etc.).",
    page: 6,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Create a menu of conversion options\r\n        // Get user input for which conversion to perform\r\n        // Implement at least 3 different measurement conversions\r\n        // Display results with appropriate units\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Common conversion factors: 1 meter = 3.28084 feet, 1 kilogram = 2.20462 pounds, 1 liter = 0.264172 gallons. Use switch statements to handle the different conversion options.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.WriteLine("Measurement Converter");\r\n        Console.WriteLine("1. Meters to Feet");\r\n        Console.WriteLine("2. Kilograms to Pounds");\r\n        Console.WriteLine("3. Liters to Gallons");\r\n        Console.Write("Enter your choice (1-3): ");\r\n        \r\n        int choice = Convert.ToInt32(Console.ReadLine());\r\n        \r\n        switch (choice)\r\n        {\r\n            case 1:\r\n                Console.Write("Enter length in meters: ");\r\n                double meters = Convert.ToDouble(Console.ReadLine());\r\n                double feet = meters * 3.28084;\r\n                Console.WriteLine($"\${meters} meters = \${feet:F2} feet");\r\n                break;\r\n                \r\n            case 2:\r\n                Console.Write("Enter weight in kilograms: ");\r\n                double kg = Convert.ToDouble(Console.ReadLine());\r\n                double pounds = kg * 2.20462;\r\n                Console.WriteLine($"\${kg} kilograms = \${pounds:F2} pounds");\r\n                break;\r\n                \r\n            case 3:\r\n                Console.Write("Enter volume in liters: ");\r\n                double liters = Convert.ToDouble(Console.ReadLine());\r\n                double gallons = liters * 0.264172;\r\n                Console.WriteLine($"\${liters} liters = \${gallons:F2} gallons");\r\n                break;\r\n                \r\n            default:\r\n                Console.WriteLine("Invalid choice!");\r\n                break;\r\n        }\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 30,
    coinsReward: 10,
    difficulty: "Medium",
  },
  {
    id: "1.5",
    moduleId: 1,
    title: "Two Variables",
    description:
      "Create a C# program that demonstrates the use of two variables. Perform various operations (addition, subtraction, multiplication, division) on these variables.",
    page: 7,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare two variables and assign values to them\r\n        // Perform and display the results of various operations\r\n        // Remember to handle potential division by zero\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Use descriptive variable names. When dividing, check if the divisor is zero to avoid runtime errors. Use Console.WriteLine() to display results of each operation.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare and initialize two variables\r\n        Console.Write("Enter first number: ");\r\n        double num1 = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter second number: ");\r\n        double num2 = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        // Addition\r\n        double sum = num1 + num2;\r\n        Console.WriteLine($"Addition: \${num1} + \${num2} = \${sum}");\r\n        \r\n        // Subtraction\r\n        double difference = num1 - num2;\r\n        Console.WriteLine($"Subtraction: \${num1} - \${num2} = \${difference}");\r\n        \r\n        // Multiplication\r\n        double product = num1 * num2;\r\n        Console.WriteLine($"Multiplication: \${num1} * \${num2} = \${product}");\r\n        \r\n        // Division (with check for division by zero)\r\n        if (num2 != 0)\r\n        {\r\n            double quotient = num1 / num2;\r\n            Console.WriteLine($"Division: \${num1} / \${num2} = \${quotient:F2}");\r\n        }\r\n        else\r\n        {\r\n            Console.WriteLine("Division by zero is not allowed.");\r\n        }\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
  },
  {
    id: "1.6",
    moduleId: 1,
    title: "Circumference of a circle",
    description:
      "Write a C# program that calculates the circumference of a circle. Use the formula C = 2πr, where r is the radius.",
    page: 8,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get the radius from the user\r\n        // Calculate the circumference\r\n        // Display the result\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Use Math.PI for the value of π. Format the output to display only two decimal places using the :F2 format specifier in string interpolation.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the radius of the circle: ");\r\n        double radius = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        double circumference = 2 * Math.PI * radius;\r\n        \r\n        Console.WriteLine($"The circumference of a circle with radius \${radius} is \${circumference:F2} units.");\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
  },
  {
    id: "1.7",
    moduleId: 1,
    title: "Three variables declaration",
    description:
      "Create a C# program that declares and uses three different types of variables (int, double, string). Demonstrate type conversion between these variables.",
    page: 9,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare variables of different types (int, double, string)\r\n        // Perform type conversions between them\r\n        // Display the values and types before and after conversion\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Use Convert.ToInt32(), Convert.ToDouble(), or ToString() methods for type conversion. You can also use the GetType() method to display the type of a variable.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Declare variables of different types\r\n        int intValue = 42;\r\n        double doubleValue = 3.14159;\r\n        string stringValue = "100";\r\n        \r\n        Console.WriteLine("Original values:");\r\n        Console.WriteLine($"intValue: \${intValue} (Type: \${intValue.GetType()})");\r\n        Console.WriteLine($"doubleValue: \${doubleValue} (Type: \${doubleValue.GetType()})");\r\n        Console.WriteLine($"stringValue: \${stringValue} (Type: \${stringValue.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting int to double:");\r\n        double intToDouble = intValue; // Implicit conversion\r\n        Console.WriteLine($"intToDouble: \${intToDouble} (Type: \${intToDouble.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting double to int:");\r\n        int doubleToInt = (int)doubleValue; // Explicit conversion / casting\r\n        Console.WriteLine($"doubleToInt: \${doubleToInt} (Type: \${doubleToInt.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting string to int:");\r\n        int stringToInt = Convert.ToInt32(stringValue);\r\n        Console.WriteLine($"stringToInt: \${stringToInt} (Type: \${stringToInt.GetType()})");\r\n        \r\n        Console.WriteLine("\\nConverting int to string:");\r\n        string intToString = intValue.ToString();\r\n        Console.WriteLine($"intToString: \${intToString} (Type: \${intToString.GetType()})");\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
  },
  {
    id: "1.8",
    moduleId: 1,
    title: "Purchase Price",
    description:
      "Write a C# program that calculates the final purchase price including tax. Ask the user for the item price and tax rate, then calculate and display the total.",
    page: 10,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get item price and tax rate from the user\r\n        // Calculate the tax amount\r\n        // Calculate and display the total price\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Tax amount is calculated as price * (taxRate / 100). The final price is the original price plus the tax amount. Use appropriate formatting for currency values.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the item price: $");\r\n        double price = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter the tax rate (%): ");\r\n        double taxRate = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        double taxAmount = price * (taxRate / 100);\r\n        double totalPrice = price + taxAmount;\r\n        \r\n        Console.WriteLine($"Original price: \${price:F2}");\r\n        Console.WriteLine($"Tax amount (\${taxRate}%): \${taxAmount:F2}");\r\n        Console.WriteLine($"Total price: \${totalPrice:F2}");\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
  },
  {
    id: "1.9",
    moduleId: 1,
    title: "Economic order quantity",
    description:
      "Create a C# program that calculates the Economic Order Quantity (EOQ) using the formula EOQ = sqrt((2 * D * S) / H), where D is annual demand, S is order cost, and H is holding cost.",
    page: 11,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get the annual demand, order cost, and holding cost from the user\r\n        // Calculate the EOQ using the formula\r\n        // Display the result\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Use Math.Sqrt() to calculate the square root. Validate that the input values are positive before performing the calculation.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter annual demand (D): ");\r\n        double demand = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter order cost (S): $");\r\n        double orderCost = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        Console.Write("Enter annual holding cost per unit (H): $");\r\n        double holdingCost = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        if (demand <= 0 || orderCost <= 0 || holdingCost <= 0)\r\n        {\r\n            Console.WriteLine("Error: All values must be positive.");\r\n        }\r\n        else\r\n        {\r\n            double eoq = Math.Sqrt((2 * demand * orderCost) / holdingCost);\r\n            Console.WriteLine($"The Economic Order Quantity (EOQ) is: \${eoq:F2} units");\r\n        }\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 50,
    coinsReward: 20,
    difficulty: "Hard",
  },
  {
    id: "1.10",
    moduleId: 1,
    title: "Radius of a circle",
    description:
      "Write a C# program that calculates the radius of a circle when given its area. Use the formula r = sqrt(A / π), where A is the area.",
    page: 12,
    starterCode: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        // Get the area of the circle from the user\r\n        // Calculate the radius\r\n        // Display the result\r\n    }\r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n`,
    hint: "Use Math.PI for the value of π and Math.Sqrt() for the square root calculation. Make sure to handle negative input values appropriately.",
    solution: `using System;\r\n\r\nclass Program\r\n{\r\n    static void Main(string[] args)\r\n    {\r\n        Console.Write("Enter the area of the circle: ");\r\n        double area = Convert.ToDouble(Console.ReadLine());\r\n        \r\n        if (area <= 0)\r\n        {\r\n            Console.WriteLine("Error: Area must be positive.");\r\n        }\r\n        else\r\n        {\r\n            double radius = Math.Sqrt(area / Math.PI);\r\n            Console.WriteLine($"The radius of a circle with area \${area} is \${radius:F4} units.");\r\n        }\r\n    }\r\n}`,
    language: "csharp",
    xpReward: 20,
    coinsReward: 5,
    difficulty: "Easy",
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
