// // app/components/PlayModule/MultiplayerModal.tsx
// import { useState } from "react";
// import { Button } from "~/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "~/components/ui/dialog";
// import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
// import { Code, Puzzle, Zap } from "lucide-react";

// interface MultiplayerModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   // We'll pass the functions from the root dashboard
//   onCreateGame: (gameMode: string) => void;
//   onJoinGame: (gameCode: string) => void;
// }

// export function MultiplayerModal({
//   open,
//   onOpenChange,
//   onCreateGame,
//   onJoinGame,
// }: MultiplayerModalProps) {
//   const [selectedMode, setSelectedMode] = useState("quiz");
//   const [gameCode, setGameCode] = useState("");

//   const handleCreate = () => {
//     onCreateGame(selectedMode);
//   };

//   const handleJoin = () => {
//     if (gameCode) {
//       onJoinGame(gameCode);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <Tabs defaultValue="create">
//           <DialogHeader>
//             <DialogTitle className="text-center text-2xl mb-2">
//               Multiplayer
//             </DialogTitle>
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="create">Create Game</TabsTrigger>
//               <TabsTrigger value="join">Join Game</TabsTrigger>
//             </TabsList>
//           </DialogHeader>

//           {/* Create Game Tab */}
//           <TabsContent value="create" className="space-y-6 pt-4">
//             <RadioGroup
//               defaultValue={selectedMode}
//               onValueChange={setSelectedMode}
//               className="space-y-4"
//             >
//               <Label
//                 htmlFor="mode-quiz"
//                 className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent has-[input:checked]:border-primary"
//               >
//                 <Zap className="h-5 w-5" />
//                 <div className="flex-1">
//                   <span className="font-medium">Quiz</span>
//                   <p className="text-sm text-muted-foreground">
//                     Fast-paced multiple choice questions.
//                   </p>
//                 </div>
//                 <RadioGroupItem value="quiz" id="mode-quiz" />
//               </Label>

//               <Label
//                 htmlFor="mode-blitz"
//                 className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent has-[input:checked]:border-primary"
//               >
//                 <Code className="h-5 w-5" />
//                 <div className="flex-1">
//                   <span className="font-medium">Coding Blitz</span>
//                   <p className="text-sm text-muted-foreground">
//                     Solve a small challenge the fastest.
//                   </p>
//                 </div>
//                 <RadioGroupItem value="blitz" id="mode-blitz" />
//               </Label>

//               <Label
//                 htmlFor="mode-assemble"
//                 className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent has-[input:checked]:border-primary"
//               >
//                 <Puzzle className="h-5 w-5" />
//                 <div className="flex-1">
//                   <span className="font-medium">Syntax Assemble</span>
//                   <p className="text-sm text-muted-foreground">
//                     Drag-and-drop code blocks to fix a bug.
//                   </p>
//                 </div>
//                 <RadioGroupItem value="assemble" id="mode-assemble" />
//               </Label>
//             </RadioGroup>
//             <Button className="w-full" size="lg" onClick={handleCreate}>
//               Create Game
//             </Button>
//           </TabsContent>

//           {/* Join Game Tab */}
//           <TabsContent value="join" className="space-y-6 pt-4">
//             <div className="space-y-2">
//               <Label htmlFor="gameCode">Game Code</Label>
//               <Input
//                 id="gameCode"
//                 placeholder="Enter 6-digit code"
//                 value={gameCode}
//                 onChange={(e) => setGameCode(e.target.value.toUpperCase())}
//                 maxLength={6}
//               />
//             </div>
//             <Button
//               className="w-full"
//               size="lg"
//               onClick={handleJoin}
//               disabled={!gameCode}
//             >
//               Join Game
//             </Button>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// }
