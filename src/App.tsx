/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { Flame, Brain } from "lucide-react";

import { useStore } from "./store";
import { Landing } from "./Landing";
import { Dashboard } from "./Dashboard";
import { LearnModule } from "./LearnModule";

// --- THEME PROVIDER ---
type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

// --- LAYOUT ---
export function Layout() {
  const streaks = useStore((state) => state.streaks);
  const achievements = useStore((state) => state.achievements);
  const checkStreaks = useStore((state) => state.checkStreaks);
  
  useEffect(() => {
    checkStreaks();
  }, [checkStreaks]);

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 flex flex-col font-sans selection:bg-white/10 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_40%_-20%,_rgba(124,58,237,0.15),_transparent_50%)] pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(59,130,246,0.1),_transparent_40%)] pointer-events-none z-0"></div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-md relative">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Brain className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AuraLearn
              </span>
            </Link>
            <nav className="hidden md:flex gap-2 ml-4">
              <Link to="/dashboard" className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-white/10 hover:bg-white/15 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Streak</div>
              <div className="flex items-center gap-1 text-orange-400 font-bold">
                <Flame className="w-4 h-4 text-orange-400" />
                {streaks} Days
              </div>
            </div>
            <div className="w-[1px] h-10 bg-white/10 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-400">AR</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col z-10 relative">
        <Outlet />
      </main>
    </div>
  );
}

// --- APP ---
export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ai-learning-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="learn/:topicId" element={<LearnModule />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
