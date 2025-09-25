'use strict';
import { useEffect } from 'react';
import { useUiStore, getWindowDimensions } from '@/stores';
import { useMediaQuery } from '@mui/material';

export default function UiProvider({
  children
}) {
  const { setEditorSize, setColorMode } = useUiStore();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  /**
   * Hook-up for window resizes.
   * */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function handleResize() {
      const d = getWindowDimensions();
      if (!d) return;
      setEditorSize(d);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Hook-up for theme
   * */
  useEffect(() => {
    let nextMode = prefersDarkMode ? 'dark' : 'light';
    setColorMode(nextMode);
  }, []);

  return children;
}
