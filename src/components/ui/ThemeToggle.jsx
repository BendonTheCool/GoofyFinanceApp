"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
    