import { Navigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // FIX: Only show loading spinner if we are loading AND we have no user data.
  // This covers the initial page load, but skips the background revalidation on Alt+Tab.
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we aren't loading, OR if we are refreshing but didn't find a user...
  // Redirect to login.
  if (!user && !loading) {
    return <Navigate to="/auth/login" replace />;
  }

  // If we have a user (even if 'loading' is true in the background), show the app.
  return <>{children}</>;
};
