// app/components/challenge/Toast.tsx
import { useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <FiCheckCircle className="mr-2" />,
    error: <FiAlertCircle className="mr-2" />,
    info: <FiInfo className="mr-2" />,
  };

  const colors: Record<ToastType, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl z-50 flex items-center text-white ${colors[type]} animate-fade-in`}
    >
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
