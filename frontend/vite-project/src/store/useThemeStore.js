import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("LinkUp-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("LinkUp-theme", theme);
    set({ theme });
  },
}));