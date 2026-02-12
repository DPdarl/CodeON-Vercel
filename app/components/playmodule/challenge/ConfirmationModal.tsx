import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const isDanger = variant === "danger";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
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
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isDanger
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}
              >
                <AlertTriangle
                  className={`w-8 h-8 ${
                    isDanger
                      ? "text-red-600 dark:text-red-500"
                      : "text-yellow-600 dark:text-yellow-500"
                  }`}
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                {description}
              </p>

              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  className={`flex-1 text-white ${
                    isDanger
                      ? "bg-red-600 hover:bg-red-700 border-red-600"
                      : "bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
                  }`}
                >
                  {confirmText}
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
