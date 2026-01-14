// // app/components/dashboard/SoloChallengeModal.tsx

// import { useState } from "react";
// import { useNavigate } from "@remix-run/react";
// import { Button } from "~/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "~/components/ui/dialog";
// import { BarChart, Loader2, Target } from "lucide-react";

// // Define the shape of the progress data we expect
// interface SoloProgress {
//   level: number;
//   lastChallengeName: string;
//   userProgress: number;
// }

// interface SoloChallengeModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   progress: SoloProgress | null; // Pass the "fetched" progress data
// }

// export function SoloChallengeModal({
//   open,
//   onOpenChange,
//   progress,
// }: SoloChallengeModalProps) {
//   // This loading state is for the "Continue" button inside the modal
//   const [isNavigating, setIsNavigating] = useState(false);
//   const navigate = useNavigate();

//   const handleContinue = () => {
//     // 1. Set loading state to true (shows spinner on button)
//     setIsNavigating(true);

//     // 2. Artificial delay, as requested
//     setTimeout(() => {
//       // 3. Navigate to the solo challenge page
//       navigate("/solo-challenge");
//       // 4. Reset loading state (in case user comes back)
//       setIsNavigating(false);
//     }, 500); // 500ms artificial delay
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center space-x-2 text-2xl">
//             <Target className="h-6 w-6" />
//             <span>Solo Challenge</span>
//           </DialogTitle>
//           <DialogDescription>
//             Welcome back! Here's where you left off.
//           </DialogDescription>
//         </DialogHeader>

//         {/* Body content to show progress */}
//         <div className="space-y-4 py-4">
//           <div className="flex items-center justify-between rounded-lg border p-4">
//             <span className="text-sm font-medium text-muted-foreground">
//               Current Level
//             </span>
//             <span className="text-lg font-bold">{progress?.level || 1}</span>
//           </div>
//           <div className="flex items-center justify-between rounded-lg border p-4">
//             <span className="text-sm font-medium text-muted-foreground">
//               Next Challenge
//             </span>
//             <span className="text-lg font-bold text-right">
//               {progress?.lastChallengeName || "Volume of Sphere"}
//             </span>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="font-medium text-muted-foreground">
//                 Total Progress
//               </span>
//               <span>{Math.round(progress?.userProgress || 0)}%</span>
//             </div>
//             <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
//               <div
//                 className="h-2 rounded-full bg-blue-500"
//                 style={{ width: `${progress?.userProgress || 0}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             type="button"
//             className="w-full"
//             size="lg"
//             onClick={handleContinue}
//             disabled={isNavigating}
//           >
//             {isNavigating ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               "Continue"
//             )}
//             {isNavigating ? "Loading..." : ""}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
