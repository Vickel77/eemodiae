import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AppearanceMode = "day" | "night";

type AppearanceContextValue = {
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  toggle: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue>({
  mode: "day",
  setMode: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "eemodiae-theme";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppearanceMode>("day");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppearanceMode | null;
      if (saved === "day" || saved === "night") {
        setModeState(saved);
        return;
      }
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        setModeState("night");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-night", mode === "night");
    root.classList.toggle("theme-day", mode === "day");
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const setMode = useCallback((next: AppearanceMode) => {
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setModeState((m) => (m === "day" ? "night" : "day"));
  }, []);

  return (
    <AppearanceContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
