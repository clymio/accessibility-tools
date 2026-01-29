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
    isAnimating: false,
    contentType: null,
    isNarrow: false,
    drawerWidth: 0
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
  setRightDrawerWidth: w =>
    set(state => ({
      rightDrawerSettings: {
        ...state.rightDrawerSettings,
        drawerWidth: w
      }
    })),

  openRightDrawer: contentType =>
    set(state => ({
      rightDrawerSettings: {
        ...state.rightDrawerSettings,
        isOpen: true,
        contentType
      }
    })),

  closeRightDrawer: () =>
    set(state => ({
      rightDrawerSettings: {
        ...state.rightDrawerSettings,
        isOpen: false
      }
    })),
  setRightDrawerAnimating: isAnimating =>
    set(state => ({
      rightDrawerSettings: {
        ...state.rightDrawerSettings,
        isAnimating
      }
    })),
  setRightDrawerIsNarrow: isNarrow =>
    set(state => ({
      rightDrawerSettings: {
        ...state.rightDrawerSettings,
        isNarrow
      }
    }))
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
