import { useUiStore } from '@/stores';
import { Box } from '@mui/material';
import classNames from 'classnames';
import { forwardRef, useState } from 'react';
import { Resizable } from 'react-resizable';
import style from './ResizeBlock.module.scss';

const ResizableBlock = ({ children, width, height, minWidth, minHeight, maxHeight, closeable = false, axis = 'x', className = '', onResize = () => {}, ...props }) => {
  const { setIsResizing } = useUiStore();

  const [dimensions, setDimensions] = useState({ width, height });
  const [isHidden, setIsHidden] = useState(false);

  const isHiddenOnXAxis = isHidden && (axis === 'x' || axis === 'both');
  const isHiddenOnYAxis = isHidden && (axis === 'y' || axis === 'both');
  const minimumWidth = minWidth || props.minConstraints?.[0];
  const maximumWidth = props.maxConstraints?.[0];
  const minimumHeight = minHeight || props.minConstraints?.[1];
  const maximumHeight = maxHeight || props.maxConstraints?.[1];

  let isMaxed = false;
  if (axis === 'both') {
    isMaxed = dimensions.width >= maximumWidth && dimensions.height >= maximumHeight;
  } else if (axis === 'x') {
    isMaxed = dimensions.width >= maximumWidth;
  } else if (axis === 'y') {
    isMaxed = dimensions.height >= maximumHeight;
  }

  const handleResize = (_, { size }) => {
    setDimensions(size);
    onResize(size);
    if (!closeable) return;
    if (axis === 'x' && minimumWidth) {
      if (size.width < minimumWidth * 0.4) {
        if (!isHiddenOnXAxis) {
          setDimensions(prev => ({ ...prev, width: 0 }));
        }
        setIsHidden(true);
      } else {
        if (isHiddenOnXAxis) {
          setDimensions(prev => ({ ...prev, width: minimumWidth }));
        }
        setIsHidden(false);
      }
    }
    if (axis === 'y' && minimumHeight) {
      if (size.height < minimumHeight * 0.4) {
        if (!isHiddenOnYAxis) {
          setDimensions(prev => ({ ...prev, height: 5 }));
        }
        setIsHidden(true);
      } else {
        if (isHiddenOnYAxis) {
          setDimensions(prev => ({ ...prev, height: minimumHeight }));
        }
        setIsHidden(false);
      }
    }
    onResize(dimensions);
  };

  const handleResizeHandlerDoubleClick = () => {
    if (axis === 'both') {
      setDimensions({ width, height });
    } else if (axis === 'x') {
      setDimensions(prev => ({ ...prev, width }));
    } else if (axis === 'y') {
      setDimensions(prev => ({ ...prev, height }));
    }
    onResize({ width, height });
  };

  return (
    <Resizable
      axis={axis}
      onResize={handleResize}
      className={classNames(style.root, className)}
      width={dimensions.width}
      height={dimensions.height < 5 ? 5 : dimensions.height}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={() => setIsResizing(false)}
      handle={<ResizeHandler axis={axis} isHidden={isHidden} isMaxed={isMaxed} onDoubleClick={handleResizeHandlerDoubleClick} />}
      minConstraints={closeable ? [0, 0] : props.minConstraints}
      {...props}
    >
      <Box
        width={dimensions.width}
        height={dimensions.height < 5 ? 5 : dimensions.height}
        className={style.blockContainer}
        minWidth={isHiddenOnXAxis ? 0 : minimumWidth || 'unset'}
        maxWidth={isHiddenOnXAxis ? 0 : 'unset'}
        minHeight={isHiddenOnYAxis ? 0 : minimumHeight || 'unset'}
        maxHeight={isHiddenOnYAxis ? 5 : 'unset'}
      >
        <Box overflow='hidden' height='100%' width='100%'>
          {children}
        </Box>
      </Box>
    </Resizable>
  );
};

const ResizeHandler = forwardRef(({ handleAxis, axis, isHidden, isMaxed, onDoubleClick, ...props }, ref) => {
  const componentSx = {};
  if (axis === 'both') {
    componentSx.cursor = 'nesw-resize';
  } else if (axis === 'x') {
    if (isHidden) {
      componentSx.cursor = 'e-resize';
    } else if (isMaxed) {
      componentSx.cursor = 'w-resize';
    } else {
      componentSx.cursor = 'ew-resize';
    }
    componentSx.right = 0;
    componentSx.top = 0;
    componentSx.bottom = 0;
    componentSx['--handle-width'] = '5px';
    componentSx['--handle-height'] = '100%';
  } else if (axis === 'y') {
    if (isHidden) {
      componentSx.cursor = 'n-resize';
    } else if (isMaxed) {
      componentSx.cursor = 's-resize';
    } else {
      componentSx.cursor = 'ns-resize';
    }
    componentSx.right = 0;
    componentSx.left = 0;
    componentSx.top = 0;
    componentSx['--handle-width'] = '100%';
    componentSx['--handle-height'] = '5px';
  }
  return <Box onDoubleClick={onDoubleClick} className={classNames(style.handle, `handle-${handleAxis}`)} ref={ref} {...props} sx={componentSx}></Box>;
});
ResizeHandler.displayName = 'ResizeHandler';

export default ResizableBlock;
