import { useUiStore } from '@/stores';
import { Box } from '@mui/material';
import classNames from 'classnames';
import ResizableBlock from '../ResizableBlock';
import style from './RightDrawer.module.scss';
import TestDetails from '@/modules/dashboard/ProjectPage/TestDetails';
import {
  RIGHT_DRAWER_DEFAULT_WIDTH,
  RIGHT_DRAWER_MAX_WIDTH_PERCENTAGE,
  RIGHT_DRAWER_MIN_WIDTH
} from '@/constants/app';
import { useEffect, useRef, useState } from 'react';

export const DRAWER_CONTENT_TYPE = {
  TEST_CASE_INFO: 'TEST_CASE_INFO'
};

export const ANIMATION_STATE = {
  CLOSED: 'closed',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing'
};

const RightDrawer = () => {
  const { rightDrawerSettings, setRightDrawerIsNarrow, setRightDrawerWidth, setRightDrawerAnimating } = useUiStore();
  const { width } = useUiStore(({ editor }) => ({ width: editor.width }));
  const drawerRef = useRef(null);

  const [renderDrawer, setRenderDrawer] = useState(false);
  const [animationState, setAnimationState] = useState(ANIMATION_STATE.CLOSED);

  const content = rightDrawerSettings.contentType === DRAWER_CONTENT_TYPE.TEST_CASE_INFO
    ? <TestDetails />
    : null;

  useEffect(() => {
    let timeout;

    if (rightDrawerSettings.isOpen) {
      setRenderDrawer(true);
      setAnimationState(ANIMATION_STATE.CLOSED);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState(ANIMATION_STATE.OPENING);
        });
      });

      timeout = setTimeout(() => {
        timeout = setTimeout(() => {
          setAnimationState(ANIMATION_STATE.OPEN);
        }, 220);
      }, 10);
    } else if (renderDrawer) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState(ANIMATION_STATE.CLOSING);
        });
      });

      timeout = setTimeout(() => {
        setAnimationState(ANIMATION_STATE.CLOSED);
        setRenderDrawer(false);
      }, 220);
    }

    return () => clearTimeout(timeout);
  }, [rightDrawerSettings.isOpen, renderDrawer, setRightDrawerWidth]);

  useEffect(() => {
    if (!drawerRef.current || !renderDrawer) return;

    const updateWidth = () => {
      if (
        animationState !== ANIMATION_STATE.OPEN
        && animationState !== ANIMATION_STATE.OPENING
      ) {
        return;
      }

      const w = drawerRef.current.getBoundingClientRect().width;
      setRightDrawerWidth(w);
      setRightDrawerIsNarrow(w < 400);
    };

    if (animationState === ANIMATION_STATE.OPENING) {
      requestAnimationFrame(updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(drawerRef.current);

    return () => observer.disconnect();
  }, [
    renderDrawer,
    animationState,
    setRightDrawerWidth,
    setRightDrawerIsNarrow
  ]);

  useEffect(() => {
    if (animationState !== ANIMATION_STATE.CLOSING) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRightDrawerWidth(0);
      });
    });
  }, [animationState, setRightDrawerWidth]);

  useEffect(() => {
    setRightDrawerAnimating(
      animationState === ANIMATION_STATE.OPENING
      || animationState === ANIMATION_STATE.CLOSING
    );
  }, [animationState, setRightDrawerAnimating]);

  if (!renderDrawer) return null;

  const maxWidth = width * (RIGHT_DRAWER_MAX_WIDTH_PERCENTAGE / 100);

  return (
    <ResizableBlock
      ref={drawerRef}
      width={RIGHT_DRAWER_DEFAULT_WIDTH}
      axis='x'
      resizeHandles={['w']}
      minWidth={RIGHT_DRAWER_MIN_WIDTH}
      maxConstraints={[maxWidth, 0]}
      closeable={false}
      className={classNames(style.resizableWrapper, {
        [style.opening]: animationState === ANIMATION_STATE.OPENING,
        [style.open]: animationState === ANIMATION_STATE.OPEN,
        [style.closing]: animationState === ANIMATION_STATE.CLOSING,
        [style.closed]: animationState === ANIMATION_STATE.CLOSED
      })}
    >
      <Box
        className={classNames(style.root, {
          [style.open]: animationState === ANIMATION_STATE.OPEN || animationState === ANIMATION_STATE.OPENING,
          [style.narrow]: rightDrawerSettings.isNarrow,
          [style.testDrawer]: rightDrawerSettings.contentType === DRAWER_CONTENT_TYPE.TEST_CASE_INFO
        })}
      >
        {content}
      </Box>
    </ResizableBlock>
  );
};

export default RightDrawer;
