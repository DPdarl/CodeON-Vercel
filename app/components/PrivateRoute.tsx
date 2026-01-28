import { Navigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { LoadingScreen } from "~/components/ui/LoadingScreen";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // FIX: Only show loading spinner if we are loading AND we have no user data.
  // This covers the initial page load, but skips the background revalidation on Alt+Tab.
  if (loading && !user) {
    return <LoadingScreen />;
  }

  // If we aren't loading, OR if we are refreshing but didn't find a user...
  // Redirect to login.
  if (!user && !loading) {
    return <Navigate to="/auth/login" replace />;
  }

  // If we have a user (even if 'loading' is true in the background), show the app.
  return <>{children}</>;
};
