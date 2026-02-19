import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: ExitConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600 dark:text-red-500 w-8 h-8" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Leave Challenge?
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                You are about to leave the machine problem. Your progress may
                not be saved. Are you sure you want to go back?
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Leave
                </Button>
              </div>
            </div>

            {/* Close Button */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
