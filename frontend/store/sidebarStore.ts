import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isOpen: boolean; // mobile drawer
  toggleCollapse: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isOpen: false,

      toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      
      collapseSidebar: () => set({ isCollapsed: true }),
      
      expandSidebar: () => set({ isCollapsed: false }),
      
      toggleMobile: () => set((state) => ({ isOpen: !state.isOpen })),
      
      openMobile: () => set({ isOpen: true }),
      
      closeMobile: () => set({ isOpen: false }),
    }),
    {
      name: 'sidebar-store',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
