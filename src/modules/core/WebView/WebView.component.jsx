import { SCREENSHOT_DEFAULT_HEIGHT, SCREENSHOT_DEFAULT_WIDTH } from '@/constants/app';
import { useTerminalStore, useUiStore } from '@/stores';
import { useProjectStore } from '@/stores/useProjectStore';
import useWebviewStore from '@/stores/useWebviewStore';
import { visuallyHidden } from '@mui/utils';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import style from './WebView.module.scss';

const WebView = ({ url, captureScreenshot = false, projectId = null }) => {
  if (!url) return null;
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (error) {
    console.error('Invalid URL:', url);
    router.push('/error');
    return null;
  }
  const { setIsPageLoading } = useProjectStore();
  const { clickedTargetContext } = useTerminalStore();
  const { setIsDomReady, setOpenDevTools, reset } = useWebviewStore();
  const ref = useRef();
  const router = useRouter();
  const { isResizing, rightDrawerSettings } = useUiStore();
  const [wait, setWait] = useState(0);

  const loadstart = () => {
    setIsPageLoading(true);
  };
  const loadstop = () => {
    setIsPageLoading(false);
  };

  useEffect(() => {
    const webview = ref.current;
    if (!webview || !clickedTargetContext || !clickedTargetContext.curr || !clickedTargetContext.curr.selector) return;

    const focus = async () => {
      try {
        const { prev, curr } = clickedTargetContext;
        if (prev && prev.selector) {
          const removeFocusScript = await window.api.pageScripts.getRemoveFocusScript(prev.selector);
          webview.executeJavaScript(removeFocusScript);
        }
        const script = await window.api.pageScripts.getFocusScript(curr.selector);
        webview.executeJavaScript(script);
      } catch (e) {
        console.log(e);
      }
    };

    if (wait > 0) {
      setTimeout(async () => {
        await focus();
        setWait(0);
      }, wait);
    } else {
      focus();
    }
  }, [clickedTargetContext, ref.current]);

  useEffect(() => {
    setWait(300);
  }, [rightDrawerSettings.isOpen]);

  const screenshotCaptureHandler = async (webview) => {
    try {
      const ss = await webview.capturePage({ width: SCREENSHOT_DEFAULT_WIDTH, height: SCREENSHOT_DEFAULT_HEIGHT });
      await window.api.project.update({ id: projectId, image: ss.toDataURL() });
    } catch (e) {
      console.log('Failed to capture screenshot:', e);
    }
  };

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;
    const handleWillNavigate = (e) => {
      webview.stop();
      console.log('Navigation attempt blocked to:', e.url);
    };
    const handleNewWindow = (e) => {
      e.preventDefault();
      webview.stop();
      console.log('New window attempt blocked for:', e.url);
    };
    const handleDomReady = () => {
      setIsDomReady(true);
      setOpenDevTools(() => {
        webview.openDevTools({ mode: 'detach', activate: true });
      });
      webview.addEventListener('will-navigate', handleWillNavigate);
      webview.addEventListener('new-window', handleNewWindow);
      if (captureScreenshot && projectId) {
        screenshotCaptureHandler(webview);
      }
      webview.executeJavaScript(`
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            console.log(JSON.stringify({ type: 'escape-pressed', shift: e.shiftKey }));
          }
        });
      `);
    };
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('did-start-loading', loadstart);
    webview.addEventListener('did-stop-loading', loadstop);
    return () => {
      if (webview) {
        webview.removeEventListener('dom-ready', handleDomReady);
        webview.removeEventListener('will-navigate', handleWillNavigate);
        webview.removeEventListener('new-window', handleNewWindow);
        webview.removeEventListener('did-start-loading', loadstart);
        webview.removeEventListener('did-stop-loading', loadstop);
        reset();
      }
    };
  }, [ref.current]);

  useEffect(() => {
    const cleanup = async () => {
      const webview = ref.current;
      if (!webview) return;
      try {
        if (webview.isDevToolsOpened()) {
          webview.closeDevTools();
        }
        reset();
        webview.remove();
      } catch (e) {
        console.error(e);
      }
    };
    router.events.on('routeChangeStart', cleanup);
    return () => {
      router.events.off('routeChangeStart', cleanup);
    };
  }, [ref.current]);

  useEffect(() => {
    const webview = ref.current;
    if (!webview) return;

    const handleMessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.message);
      } catch {
        return;
      }

      if (data?.type === 'escape-pressed') {
        const { shift } = data;
        webview.blur();

        const focusable = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
          el => !el.hasAttribute('disabled')
        );

        const currentIndex = focusable.indexOf(webview);

        let next;
        if (shift) {
          next = focusable[currentIndex - 1] || focusable[focusable.length - 1];
        } else {
          next = focusable[currentIndex + 1] || focusable[0];
        }

        if (next) {
          setTimeout(() => next.focus(), 0);
        }
      }
    };

    webview.addEventListener('console-message', handleMessage);

    return () => {
      webview.removeEventListener('console-message', handleMessage);
    };
  }, []);

  return (
    <>
      <span style={visuallyHidden} id='webview-instructions'>
        Press Escape to exit the page. Press Shift + Escape to move to the previous field.
      </span>
      <webview
        disablewebsecurity='true'
        className={style.root}
        ref={ref}
        src={url}
        aria-describedby='webview-instructions'
        tabIndex={0}
        webpreferences='allowRunningInsecureContent=yes, disableWebSecurity=yes'
        partition={`persist:${urlObj.hostname}`}
        style={{
          pointerEvents: isResizing ? 'none' : 'all'
        }}
      />
    </>
  );
};

export default WebView;
