import { create } from 'zustand';

const initialState = {
  isDomReady: false,
  openDevTools: () => {}
};

const useWebviewStore = create(set => ({
  ...initialState,
  setIsDomReady: isDomReady => set({ isDomReady }),
  setOpenDevTools: openDevTools => set({ openDevTools }),
  reset: () => set(initialState)
}));

export default useWebviewStore;
