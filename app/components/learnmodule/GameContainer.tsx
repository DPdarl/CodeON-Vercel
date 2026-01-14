// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "~/components/ui/button";
// import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// interface GameContainerProps {
//   title: string;
//   description: string;
//   xpReward: number;
//   onComplete: () => void;
//   children: React.ReactNode;
//   isCorrect: boolean | null; // null = waiting, true = success, false = fail
//   onCheck: () => void;
//   onContinue: () => void;
//   isCheckDisabled?: boolean;
// }

// export function GameContainer({
//   title,
//   description,
//   xpReward,
//   children,
//   isCorrect,
//   onCheck,
//   onContinue,
//   isCheckDisabled = false,
// }: GameContainerProps) {
//   return (
//     <div className="flex flex-col h-full max-w-2xl mx-auto p-4 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//             {title}
//           </h2>
//           <p className="text-gray-500 dark:text-gray-400 text-sm">
//             {description}
//           </p>
//         </div>
//         <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-700">
//           <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
//           <span className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">
//             +{xpReward} XP
//           </span>
//         </div>
//       </div>

//       {/* Game Area */}
//       <div className="flex-1 min-h-[400px] relative">{children}</div>

//       {/* Footer / Feedback Area */}
//       <AnimatePresence mode="wait">
//         {isCorrect === null ? (
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="w-full"
//           >
//             <Button
//               className="w-full h-12 text-lg font-bold"
//               size="lg"
//               onClick={onCheck}
//               disabled={isCheckDisabled}
//             >
//               Check Answer
//             </Button>
//           </motion.div>
//         ) : (
//           <motion.div
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className={`absolute bottom-0 left-0 right-0 p-6 rounded-t-3xl border-t-2 shadow-2xl z-50 ${
//               isCorrect
//                 ? "bg-green-50 border-green-200 dark:bg-green-900/90 dark:border-green-700"
//                 : "bg-red-50 border-red-200 dark:bg-red-900/90 dark:border-red-700"
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 {isCorrect ? (
//                   <div className="p-2 bg-green-100 rounded-full dark:bg-green-800">
//                     <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-300" />
//                   </div>
//                 ) : (
//                   <div className="p-2 bg-red-100 rounded-full dark:bg-red-800">
//                     <XCircle className="w-8 h-8 text-red-600 dark:text-red-300" />
//                   </div>
//                 )}
//                 <div>
//                   <h3
//                     className={`text-xl font-extrabold ${
//                       isCorrect
//                         ? "text-green-800 dark:text-green-200"
//                         : "text-red-800 dark:text-red-200"
//                     }`}
//                   >
//                     {isCorrect ? "Correct!" : "Not quite..."}
//                   </h3>
//                   {!isCorrect && (
//                     <p className="text-red-600 dark:text-red-300 text-sm">
//                       Try again to earn your XP!
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <Button
//                 onClick={onContinue}
//                 variant={isCorrect ? "default" : "destructive"}
//                 className={`px-8 font-bold ${
//                   isCorrect ? "bg-green-600 hover:bg-green-700" : ""
//                 }`}
//               >
//                 {isCorrect ? (
//                   <>
//                     Continue <ArrowRight className="ml-2 w-4 h-4" />
//                   </>
//                 ) : (
//                   "Try Again"
//                 )}
//               </Button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
