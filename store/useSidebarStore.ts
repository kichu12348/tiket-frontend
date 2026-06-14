import { create } from "zustand";

interface SidebarStore {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
}));
