// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowUp } from "lucide-react";
// import { GameContainer } from "./GameContainer";
// import { cn } from "~/lib/utils";

// interface CodeBlock {
//   id: string;
//   text: string;
// }

// interface CodeBuilderProps {
//   data: {
//     blocks: CodeBlock[];
//     correct_order_ids: string[];
//   };
//   onComplete: () => void;
// }

// export function CodeBuilderGame({ data, onComplete }: CodeBuilderProps) {
//   // Pool of available blocks
//   const [availableBlocks, setAvailableBlocks] = useState<CodeBlock[]>([]);
//   // Blocks placed in the answer area
//   const [solutionBlocks, setSolutionBlocks] = useState<CodeBlock[]>([]);

//   const [status, setStatus] = useState<boolean | null>(null);

//   useEffect(() => {
//     // Shuffle blocks initially
//     const shuffled = [...data.blocks].sort(() => Math.random() - 0.5);
//     setAvailableBlocks(shuffled);
//     setSolutionBlocks([]);
//   }, [data]);

//   const handleAddBlock = (block: CodeBlock) => {
//     setSolutionBlocks([...solutionBlocks, block]);
//     setAvailableBlocks(availableBlocks.filter((b) => b.id !== block.id));
//     setStatus(null); // Reset status on change
//   };

//   const handleRemoveBlock = (block: CodeBlock) => {
//     setAvailableBlocks([...availableBlocks, block]);
//     setSolutionBlocks(solutionBlocks.filter((b) => b.id !== block.id));
//     setStatus(null);
//   };

//   const handleCheck = () => {
//     const currentOrder = solutionBlocks.map((b) => b.id);
//     const isCorrect =
//       JSON.stringify(currentOrder) === JSON.stringify(data.correct_order_ids);
//     setStatus(isCorrect);
//   };

//   return (
//     <GameContainer
//       title="Code Builder"
//       description="Arrange the blocks in the correct order."
//       xpReward={20}
//       isCorrect={status}
//       onCheck={handleCheck}
//       onContinue={() => status && onComplete()}
//       onComplete={onComplete}
//       isCheckDisabled={solutionBlocks.length === 0}
//     >
//       <div className="flex flex-col h-full gap-8">
//         {/* Solution Area (The Code Editor View) */}
//         <div className="flex-1 min-h-[160px] bg-gray-900 rounded-xl p-6 shadow-inner border-2 border-gray-700 relative">
//           <div className="absolute top-3 right-3 text-xs text-gray-500 font-mono">
//             main.cs
//           </div>

//           <div className="flex flex-wrap gap-2 content-start h-full font-mono text-lg">
//             <AnimatePresence>
//               {solutionBlocks.length === 0 && (
//                 <div className="w-full h-full flex items-center justify-center text-gray-600 italic">
//                   Tap blocks to build code...
//                 </div>
//               )}
//               {solutionBlocks.map((block) => (
//                 <motion.button
//                   layoutId={block.id}
//                   key={block.id}
//                   initial={{ scale: 0.8, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   exit={{ scale: 0.8, opacity: 0 }}
//                   onClick={() => !status && handleRemoveBlock(block)}
//                   className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md shadow-sm border border-indigo-400"
//                 >
//                   {block.text}
//                 </motion.button>
//               ))}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* Available Blocks Area */}
//         <div className="min-h-[120px]">
//           <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
//             Available Blocks
//           </p>
//           <div className="flex flex-wrap gap-3">
//             {availableBlocks.map((block) => (
//               <motion.button
//                 layoutId={block.id}
//                 key={block.id}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => handleAddBlock(block)}
//                 className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono px-4 py-3 rounded-xl shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
//               >
//                 {block.text}
//               </motion.button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </GameContainer>
//   );
// }
