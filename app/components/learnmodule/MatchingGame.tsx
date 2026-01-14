// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { GameContainer } from "./GameContainer";
// import { cn } from "~/lib/utils";

// interface Pair {
//   left: string;
//   right: string;
// }

// interface MatchingGameProps {
//   data: { pairs: Pair[] };
//   onComplete: () => void;
// }

// export function MatchingGame({ data, onComplete }: MatchingGameProps) {
//   // We need to flatten the pairs into a single list of items, but keep track of their match ID
//   // e.g., [{id: '1', text: 'int', matchId: 'A'}, {id: '2', text: 'Number', matchId: 'A'}]

//   interface CardItem {
//     id: string;
//     text: string;
//     matchId: number; // The index of the pair this belongs to
//     col: "left" | "right";
//   }

//   const [items, setItems] = useState<CardItem[]>([]);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [matchedIds, setMatchedIds] = useState<string[]>([]); // IDs of cards that are done
//   const [status, setStatus] = useState<boolean | null>(null); // Game level status

//   useEffect(() => {
//     // Transform pairs into shuffled list
//     const list: CardItem[] = [];
//     data.pairs.forEach((pair, idx) => {
//       list.push({ id: `L-${idx}`, text: pair.left, matchId: idx, col: "left" });
//       list.push({
//         id: `R-${idx}`,
//         text: pair.right,
//         matchId: idx,
//         col: "right",
//       });
//     });
//     // Shuffle
//     setItems(list.sort(() => Math.random() - 0.5));
//   }, [data]);

//   const handleCardClick = (item: CardItem) => {
//     if (matchedIds.includes(item.id)) return;

//     // Deselect if clicking same card
//     if (selectedId === item.id) {
//       setSelectedId(null);
//       return;
//     }

//     // If nothing selected, select this
//     if (!selectedId) {
//       setSelectedId(item.id);
//       return;
//     }

//     // Check Match
//     const selectedItem = items.find((i) => i.id === selectedId);
//     if (!selectedItem) return;

//     if (selectedItem.matchId === item.matchId && selectedItem.id !== item.id) {
//       // MATCH!
//       setMatchedIds((prev) => [...prev, selectedItem.id, item.id]);
//       setSelectedId(null);
//     } else {
//       // NO MATCH - Shake or visual feedback could go here
//       // For now just quick deselect
//       setSelectedId(item.id); // Switch selection to new card implies retry
//     }
//   };

//   // Auto-check completion
//   useEffect(() => {
//     if (items.length > 0 && matchedIds.length === items.length) {
//       setStatus(true);
//     }
//   }, [matchedIds, items]);

//   return (
//     <GameContainer
//       title="Concept Match"
//       description="Tap matching pairs to clear the board."
//       xpReward={15}
//       isCorrect={status}
//       onCheck={() => {}} // Auto-checks
//       onContinue={onComplete}
//       isCheckDisabled={true} // Logic is internal
//       onComplete={onComplete}
//     >
//       <div className="grid grid-cols-2 gap-4 h-full content-center">
//         <AnimatePresence>
//           {items.map((item) => {
//             const isMatched = matchedIds.includes(item.id);
//             const isSelected = selectedId === item.id;

//             if (isMatched) return <div key={item.id} className="h-24" />; // Placeholder to keep grid layout

//             return (
//               <motion.button
//                 key={item.id}
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0, opacity: 0 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => handleCardClick(item)}
//                 className={cn(
//                   "h-24 rounded-2xl font-bold text-center p-2 shadow-sm border-b-4 transition-all flex items-center justify-center",
//                   isSelected
//                     ? "bg-indigo-500 border-indigo-700 text-white"
//                     : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
//                 )}
//               >
//                 {item.text}
//               </motion.button>
//             );
//           })}
//         </AnimatePresence>
//       </div>
//     </GameContainer>
//   );
// }
