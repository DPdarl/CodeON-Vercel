export function AboutTab() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          About ℹ️
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Learn more about CodeON
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            CodeON - Learn & Compete
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            CodeON is an interactive platform for learning C# programming
            through gamified lessons and multiplayer coding challenges.
          </p>
        </div>

        <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 text-sm">
            Version 1.0.0 • Built with passion for developers
          </p>
        </div>
      </div>
    </div>
  );
}
