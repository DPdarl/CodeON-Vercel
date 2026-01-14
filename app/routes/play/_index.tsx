import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";

export default function PlayIndex() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else {
        navigate("/play/adventure"); // default play route
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading Play Mode...
          </h2>
        </div>
      </div>
    );
  }

  return null;
}
