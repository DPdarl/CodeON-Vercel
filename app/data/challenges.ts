// app/data/challenges.ts
import type { Challenge } from "~/types/challenge.types";

// We'll strongly type the array using our new interface
export const challenges: Challenge[] = [
  {
    id: "1.1",
    title: "Volume of Sphere",
    description:
      "Create a C# program that calculates the volume of a sphere. Use the formula V = (4/3) * π * r³, where r is the radius.",
    page: 3,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Your code here to calculate the volume of a sphere\n        // Ask the user to enter the radius\n        // Calculate the volume\n        // Display the result\n    }\n}",
    hint: "Remember to convert user input from string to double using Convert.ToDouble() or double.Parse(), and use Math.PI and Math.Pow() for calculations.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.Write("Enter the radius of the sphere: ");\n        double radius = Convert.ToDouble(Console.ReadLine());\n        \n        double volume = (4.0/3.0) * Math.PI * Math.Pow(radius, 3);\n        \n        Console.WriteLine($"The volume of a sphere with radius {radius} is {volume:F2} cubic units.");\n    }\n}',
  },
  {
    id: "1.2",
    title: "Temp Conversion",
    description:
      "Write a C# program that converts temperature from Celsius to Fahrenheit and vice versa. Use the formulas: F = (C * 9/5) + 32 and C = (F - 32) * 5/9.",
    page: 4,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Write code to convert between Celsius and Fahrenheit\n        // Ask the user which conversion they want to perform\n        // Get the temperature value\n        // Perform conversion and display result\n    }\n}",
    hint: "Use a menu system with Console.ReadLine() to determine which conversion the user wants to perform. Remember to format the output to show only 2 decimal places.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Temperature Conversion");\n        Console.WriteLine("1. Celsius to Fahrenheit");\n        Console.WriteLine("2. Fahrenheit to Celsius");\n        Console.Write("Enter your choice (1 or 2): ");\n        \n        int choice = Convert.ToInt32(Console.ReadLine());\n        \n        if (choice == 1)\n        {\n            Console.Write("Enter temperature in Celsius: ");\n            double celsius = Convert.ToDouble(Console.ReadLine());\n            double fahrenheit = (celsius * 9/5) + 32;\n            Console.WriteLine($"{celsius}°C is equal to {fahrenheit:F2}°F");\n        }\n        else if (choice == 2)\n        {\n            Console.Write("Enter temperature in Fahrenheit: ");\n            double fahrenheit = Convert.ToDouble(Console.ReadLine());\n            double celsius = (fahrenheit - 32) * 5/9;\n            Console.WriteLine($"{fahrenheit}°F is equal to {celsius:F2}°C");\n        }\n        else\n        {\n            Console.WriteLine("Invalid choice!");\n        }\n    }\n}',
  },
  {
    id: "1.3",
    title: "Peso-Dollar Conversion",
    description:
      "Create a C# program that converts between Philippine Pesos and US Dollars. Allow the user to convert in either direction using current exchange rates.",
    page: 5,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Set the exchange rate (you can use any reasonable rate)\n        // Create a menu for PHP to USD or USD to PHP conversion\n        // Get user input and perform the conversion\n        // Display the result with appropriate formatting\n    }\n}",
    hint: "Define a constant for the exchange rate. Use string formatting to display currency values with 2 decimal places. Consider using the '$' string interpolation feature.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Exchange rate (example value - can be updated)\n        const double phpToUsdRate = 0.018;\n        const double usdToPhpRate = 56.0;\n        \n        Console.WriteLine("Currency Converter");\n        Console.WriteLine("1. PHP to USD");\n        Console.WriteLine("2. USD to PHP");\n        Console.Write("Enter your choice (1 or 2): ");\n        \n        int choice = Convert.ToInt32(Console.ReadLine());\n        \n        if (choice == 1)\n        {\n            Console.Write("Enter amount in PHP: ");\n            double php = Convert.ToDouble(Console.ReadLine());\n            double usd = php * phpToUsdRate;\n            Console.WriteLine($"{php:F2} PHP = {usd:F2} USD");\n        }\n        else if (choice == 2)\n        {\n            Console.Write("Enter amount in USD: ");\n            double usd = Convert.ToDouble(Console.ReadLine());\n            double php = usd * usdToPhpRate;\n            Console.WriteLine($"{usd:F2} USD = {php:F2} PHP");\n        }\n        else\n        {\n            Console.WriteLine("Invalid choice!");\n        }\n    }\n}',
  },
  {
    id: "1.4",
    title: "Measurement Conversion",
    description:
      "Write a C# program that converts between different units of measurement (e.g., meters to feet, kilograms to pounds, etc.).",
    page: 6,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Create a menu of conversion options\n        // Get user input for which conversion to perform\n        // Implement at least 3 different measurement conversions\n        // Display results with appropriate units\n    }\n}",
    hint: "Common conversion factors: 1 meter = 3.28084 feet, 1 kilogram = 2.20462 pounds, 1 liter = 0.264172 gallons. Use switch statements to handle the different conversion options.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Measurement Converter");\n        Console.WriteLine("1. Meters to Feet");\n        Console.WriteLine("2. Kilograms to Pounds");\n        Console.WriteLine("3. Liters to Gallons");\n        Console.Write("Enter your choice (1-3): ");\n        \n        int choice = Convert.ToInt32(Console.ReadLine());\n        \n        switch (choice)\n        {\n            case 1:\n                Console.Write("Enter length in meters: ");\n                double meters = Convert.ToDouble(Console.ReadLine());\n                double feet = meters * 3.28084;\n                Console.WriteLine($"{meters} meters = {feet:F2} feet");\n                break;\n                \n            case 2:\n                Console.Write("Enter weight in kilograms: ");\n                double kg = Convert.ToDouble(Console.ReadLine());\n                double pounds = kg * 2.20462;\n                Console.WriteLine($"{kg} kilograms = {pounds:F2} pounds");\n                break;\n                \n            case 3:\n                Console.Write("Enter volume in liters: ");\n                double liters = Convert.ToDouble(Console.ReadLine());\n                double gallons = liters * 0.264172;\n                Console.WriteLine($"{liters} liters = {gallons:F2} gallons");\n                break;\n                \n            default:\n                Console.WriteLine("Invalid choice!");\n                break;\n        }\n    }\n}',
  },
  {
    id: "1.5",
    title: "Two Variables",
    description:
      "Create a C# program that demonstrates the use of two variables. Perform various operations (addition, subtraction, multiplication, division) on these variables.",
    page: 7,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Declare two variables and assign values to them\n        // Perform and display the results of various operations\n        // Remember to handle potential division by zero\n    }\n}",
    hint: "Use descriptive variable names. When dividing, check if the divisor is zero to avoid runtime errors. Use Console.WriteLine() to display results of each operation.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Declare and initialize two variables\n        Console.Write("Enter first number: ");\n        double num1 = Convert.ToDouble(Console.ReadLine());\n        \n        Console.Write("Enter second number: ");\n        double num2 = Convert.ToDouble(Console.ReadLine());\n        \n        // Addition\n        double sum = num1 + num2;\n        Console.WriteLine($"Addition: {num1} + {num2} = {sum}");\n        \n        // Subtraction\n        double difference = num1 - num2;\n        Console.WriteLine($"Subtraction: {num1} - {num2} = {difference}");\n        \n        // Multiplication\n        double product = num1 * num2;\n        Console.WriteLine($"Multiplication: {num1} * {num2} = {product}");\n        \n        // Division (with check for division by zero)\n        if (num2 != 0)\n        {\n            double quotient = num1 / num2;\n            Console.WriteLine($"Division: {num1} / {num2} = {quotient:F2}");\n        }\n        else\n        {\n            Console.WriteLine("Division by zero is not allowed.");\n        }\n    }\n}',
  },
  {
    id: "1.6",
    title: "Circumference of a circle",
    description:
      "Write a C# program that calculates the circumference of a circle. Use the formula C = 2πr, where r is the radius.",
    page: 8,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Get the radius from the user\n        // Calculate the circumference\n        // Display the result\n    }\n}",
    hint: "Use Math.PI for the value of π. Format the output to display only two decimal places using the :F2 format specifier in string interpolation.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.Write("Enter the radius of the circle: ");\n        double radius = Convert.ToDouble(Console.ReadLine());\n        \n        double circumference = 2 * Math.PI * radius;\n        \n        Console.WriteLine($"The circumference of a circle with radius {radius} is {circumference:F2} units.");\n    }\n}',
  },
  {
    id: "1.7",
    title: "Three variables declaration",
    description:
      "Create a C# program that declares and uses three different types of variables (int, double, string). Demonstrate type conversion between these variables.",
    page: 9,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Declare variables of different types (int, double, string)\n        // Perform type conversions between them\n        // Display the values and types before and after conversion\n    }\n}",
    hint: "Use Convert.ToInt32(), Convert.ToDouble(), or ToString() methods for type conversion. You can also use the GetType() method to display the type of a variable.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Declare variables of different types\n        int intValue = 42;\n        double doubleValue = 3.14159;\n        string stringValue = "100";\n        \n        Console.WriteLine("Original values:");\n        Console.WriteLine($"intValue: {intValue} (Type: {intValue.GetType()})");\n        Console.WriteLine($"doubleValue: {doubleValue} (Type: {doubleValue.GetType()})");\n        Console.WriteLine($"stringValue: {stringValue} (Type: {stringValue.GetType()})");\n        \n        Console.WriteLine("\\nConverting int to double:");\n        double intToDouble = intValue; // Implicit conversion\n        Console.WriteLine($"intToDouble: {intToDouble} (Type: {intToDouble.GetType()})");\n        \n        Console.WriteLine("\\nConverting double to int:");\n        int doubleToInt = (int)doubleValue; // Explicit conversion / casting\n        Console.WriteLine($"doubleToInt: {doubleToInt} (Type: {doubleToInt.GetType()})");\n        \n        Console.WriteLine("\\nConverting string to int:");\n        int stringToInt = Convert.ToInt32(stringValue);\n        Console.WriteLine($"stringToInt: {stringToInt} (Type: {stringToInt.GetType()})");\n        \n        Console.WriteLine("\\nConverting int to string:");\n        string intToString = intValue.ToString();\n        Console.WriteLine($"intToString: {intToString} (Type: {intToString.GetType()})");\n    }\n}',
  },
  {
    id: "1.8",
    title: "Purchase Price",
    description:
      "Write a C# program that calculates the final purchase price including tax. Ask the user for the item price and tax rate, then calculate and display the total.",
    page: 10,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Get item price and tax rate from the user\n        // Calculate the tax amount\n        // Calculate and display the total price\n    }\n}",
    hint: "Tax amount is calculated as price * (taxRate / 100). The final price is the original price plus the tax amount. Use appropriate formatting for currency values.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.Write("Enter the item price: $");\n        double price = Convert.ToDouble(Console.ReadLine());\n        \n        Console.Write("Enter the tax rate (%): ");\n        double taxRate = Convert.ToDouble(Console.ReadLine());\n        \n        double taxAmount = price * (taxRate / 100);\n        double totalPrice = price + taxAmount;\n        \n        Console.WriteLine($"Original price: ${price:F2}");\n        Console.WriteLine($"Tax amount ({taxRate}%): ${taxAmount:F2}");\n        Console.WriteLine($"Total price: ${totalPrice:F2}");\n    }\n}',
  },
  {
    id: "1.9",
    title: "Economic order quantity",
    description:
      "Create a C# program that calculates the Economic Order Quantity (EOQ) using the formula EOQ = sqrt((2 * D * S) / H), where D is annual demand, S is order cost, and H is holding cost.",
    page: 11,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Get the annual demand, order cost, and holding cost from the user\n        // Calculate the EOQ using the formula\n        // Display the result\n    }\n}",
    hint: "Use Math.Sqrt() to calculate the square root. Validate that the input values are positive before performing the calculation.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.Write("Enter annual demand (D): ");\n        double demand = Convert.ToDouble(Console.ReadLine());\n        \n        Console.Write("Enter order cost (S): $");\n        double orderCost = Convert.ToDouble(Console.ReadLine());\n        \n        Console.Write("Enter annual holding cost per unit (H): $");\n        double holdingCost = Convert.ToDouble(Console.ReadLine());\n        \n        if (demand <= 0 || orderCost <= 0 || holdingCost <= 0)\n        {\n            Console.WriteLine("Error: All values must be positive.");\n        }\n        else\n        {\n            double eoq = Math.Sqrt((2 * demand * orderCost) / holdingCost);\n            Console.WriteLine($"The Economic Order Quantity (EOQ) is: {eoq:F2} units");\n        }\n    }\n}',
  },
  {
    id: "1.10",
    title: "Radius of a circle",
    description:
      "Write a C# program that calculates the radius of a circle when given its area. Use the formula r = sqrt(A / π), where A is the area.",
    page: 12,
    starterCode:
      "using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // Get the area of the circle from the user\n        // Calculate the radius\n        // Display the result\n    }\n}",
    hint: "Use Math.PI for the value of π and Math.Sqrt() for the square root calculation. Make sure to handle negative input values appropriately.",
    solution:
      'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.Write("Enter the area of the circle: ");\n        double area = Convert.ToDouble(Console.ReadLine());\n        \n        if (area <= 0)\n        {\n            Console.WriteLine("Error: Area must be positive.");\n        }\n        else\n        {\n            double radius = Math.Sqrt(area / Math.PI);\n            Console.WriteLine($"The radius of a circle with area {area} is {radius:F4} units.");\n        }\n    }\n}',
  },
];

export default challenges;
