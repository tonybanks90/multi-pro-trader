import React from "react";
import { useTheme } from "../services/themes/ThemeContext";

export default function Try() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-6 transition-colors duration-300">
      <h1 className="text-3xl font-bold">🎨 Theme Test Page</h1>
<div className="bg-card text-card-foreground p-4">
  Card colors should work now if `index.css` is loaded and Tailwind is configured.
</div>

      <p className="text-muted-foreground">
        <strong>Active Theme:</strong> <span className="capitalize">{theme}</span>
      </p>

      <button
        onClick={toggleTheme}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground transition hover:opacity-90"
      >
        Toggle to {theme === "dark" ? "Light" : "Dark"} Mode
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mt-8 w-full">
        <div className="p-4 rounded bg-card text-card-foreground shadow">Card</div>
        <div className="p-4 rounded bg-popover text-popover-foreground shadow">Popover</div>
        <div className="p-4 rounded bg-muted text-muted-foreground">Muted</div>
        <div className="p-4 rounded bg-accent text-accent-foreground">Accent</div>
        <div className="p-4 rounded bg-secondary text-secondary-foreground">Secondary</div>
        <div className="p-4 rounded bg-destructive text-destructive-foreground">
          Destructive
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="safety-indicator safe" title="Safe"></div>
        <div className="safety-indicator warning" title="Warning"></div>
        <div className="safety-indicator danger" title="Danger"></div>
      </div>
    </div>
  );
}
