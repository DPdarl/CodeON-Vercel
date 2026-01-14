import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { StoreTab } from "~/components/dashboardmodule/StoreTab";

// 1. Meta Data
export const meta: MetaFunction = () => {
  return [
    { title: "Store | CodeON" },
    { name: "description", content: "Shop your power-ups" },
  ];
};

// 2. ✅ THE FIX: You must export a loader!
// Even if it returns nothing, it tells Remix "I can handle this GET request."
export async function loader() {
  return json({});
}

// 3. The Page Component
export default function StorePage() {
  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-6">
      {/* Renders the complex logic component you created earlier */}
      <StoreTab />
    </div>
  );
}
