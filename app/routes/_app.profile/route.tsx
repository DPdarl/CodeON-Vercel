import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { ProfileTab } from "~/components/dashboardmodule/ProfileTab";
import { useAuth } from "~/contexts/AuthContext";

export const meta: MetaFunction = () => {
  return [
    { title: "My Profile | CodeON" },
    { name: "description", content: "View and edit your profile" },
  ];
};

export async function loader() {
  return json({});
}

export default function ProfilePage() {
  // 1. Get user data and update function from Auth Context
  const { user, updateProfile } = useAuth();

  // 2. Define the handler for saving the avatar
  const handleSaveAvatar = async (avatarConfig: any) => {
    if (!user) return;
    try {
      // This calls Supabase to update the 'avatar_config' column
      await updateProfile({ avatarConfig });
      // You can add a toast notification here if you have one
      console.log("Avatar updated successfully!");
    } catch (error) {
      console.error("Failed to save avatar", error);
    }
  };

  // Prevent rendering if user is still loading (optional, but safer)
  if (!user) return null;

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-6 custom-scrollbar">
      {/* 3. Pass the required props to the component */}
      <ProfileTab user={user} onSaveAvatar={handleSaveAvatar} />
    </div>
  );
}
