import { DEFAULT_THEME, DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from '@/constants/app';
import { getDesignTokens } from '@/constants/theme';
import { createTheme } from '@mui/material';
import { create } from 'zustand';

const initialState = {
  colorMode: DEFAULT_THEME,
  editor: {
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT
  },
  theme: createTheme({
    ...getDesignTokens(DEFAULT_THEME),
    components: {
      MuiUseMediaQuery: {
        defaultProps: {
          noSsr: true
        }
      }
    }
  }),
  isResizing: false,
  rightDrawerSettings: {
    isOpen: false,
    contentType: null
  }
};

export const useUiStore = create(set => ({
  ...initialState,
  setColorMode: colorMode => set(() => {
    const theme = createTheme(getDesignTokens(colorMode));
    window.api.theme.set(colorMode);
    return {
      colorMode,
      theme
    };
  }),
  setEditorSize: ({ width, height }) => set(() => ({
    editor: {
      width,
      height
    }
  })),
  setIsResizing: isResizing => set({ isResizing }),
  openRightDrawer: contentType => set({ rightDrawerSettings: { isOpen: true, contentType } }),
  closeRightDrawer: () => set({ rightDrawerSettings: { isOpen: false, contentType: null } })
}));

// try to initially set the editor size.
(() => {
  const editor = getWindowDimensions();
  if (!editor) return;
  useUiStore.setState({
    ...useUiStore.getInitialState(),
    editor
  });
})();

export function getWindowDimensions() {
  if (!global.window) return null;
  const { innerWidth: width, innerHeight: height } = global.window;
  return {
    width,
    height
  };
}
