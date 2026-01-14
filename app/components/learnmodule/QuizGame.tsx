// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Card } from "~/components/ui/card";
// import { cn } from "~/lib/utils";
// import { GameContainer } from "./GameContainer";

// // Types from our schema
// interface QuizQuestion {
//   id: string;
//   question: string;
//   options: string[];
//   correct_answer: string;
//   type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "PREDICT_OUTPUT";
//   codeSnippet?: string; // For "Predict Output"
// }

// interface QuizGameProps {
//   data: { questions: QuizQuestion[] };
//   onComplete: () => void;
// }

// export function QuizGame({ data, onComplete }: QuizGameProps) {
//   const [currentQIndex, setCurrentQIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);
//   const [status, setStatus] = useState<boolean | null>(null); // null, true (correct), false (wrong)

//   const question = data.questions[currentQIndex];
//   const isLastQuestion = currentQIndex === data.questions.length - 1;

//   const handleCheck = () => {
//     if (!selectedOption) return;
//     const isCorrect = selectedOption === question.correct_answer;
//     setStatus(isCorrect);
//   };

//   const handleContinue = () => {
//     if (status === true) {
//       if (isLastQuestion) {
//         onComplete();
//       } else {
//         // Next Question
//         setCurrentQIndex((prev) => prev + 1);
//         setSelectedOption(null);
//         setStatus(null);
//       }
//     } else {
//       // Retry
//       setStatus(null);
//       setSelectedOption(null);
//     }
//   };

//   return (
//     <GameContainer
//       title="Quiz Time"
//       description={`Question ${currentQIndex + 1} of ${data.questions.length}`}
//       xpReward={10}
//       isCorrect={status}
//       onCheck={handleCheck}
//       onContinue={handleContinue}
//       isCheckDisabled={!selectedOption}
//       onComplete={onComplete}
//     >
//       <div className="space-y-6">
//         {/* Question Card */}
//         <Card className="p-6 border-l-4 border-l-indigo-500 shadow-md">
//           <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-4">
//             {question.question}
//           </h3>

//           {question.codeSnippet && (
//             <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm mb-4 overflow-x-auto">
//               <pre>{question.codeSnippet}</pre>
//             </div>
//           )}
//         </Card>

//         {/* Options Grid */}
//         <div className="grid grid-cols-1 gap-3">
//           {question.options.map((opt, idx) => {
//             const isSelected = selectedOption === opt;
//             return (
//               <motion.button
//                 key={idx}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => !status && setSelectedOption(opt)}
//                 disabled={status !== null}
//                 className={cn(
//                   "p-4 rounded-xl border-2 text-left font-medium transition-all duration-200",
//                   isSelected
//                     ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800"
//                     : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
//                   status !== null && !isSelected && "opacity-50"
//                 )}
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={cn(
//                       "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
//                       isSelected
//                         ? "bg-indigo-500 text-white border-indigo-500"
//                         : "bg-gray-100 dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600"
//                     )}
//                   >
//                     {String.fromCharCode(65 + idx)}
//                   </div>
//                   {opt}
//                 </div>
//               </motion.button>
//             );
//           })}
//         </div>
//       </div>
//     </GameContainer>
//   );
// }
