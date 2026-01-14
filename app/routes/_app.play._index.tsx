import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { PlayTab } from "~/components/dashboardmodule/PlayTab";

export const meta: MetaFunction = () => {
  return [
    { title: "Game Center | CodeON" },
    { name: "description", content: "Choose your game mode" },
  ];
};

export async function loader() {
  return json({});
}

// This renders the MENU (PlayTab)
export default function PlayIndex() {
  return (
    <div className="h-full w-full overflow-y-auto">
      <PlayTab />
    </div>
  );
}
