import singlePlayerIcon from "~/assets/singleplayer.png";

export default function MyComponent() {
  return (
    <button
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
        activeTab === "single-player"
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      onClick={() => setActiveTab("single-player")}
    >
      <img src={singlePlayerIcon} alt="Single Player" className="h-5 w-5" />
      <span>Single Player</span>
    </button>
  );
}
