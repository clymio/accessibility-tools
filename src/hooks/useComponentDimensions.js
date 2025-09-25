import { useEffect, useState } from 'react';

const useComponentDimensions = ({ ref, onResize }) => {
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
  const [offsetX, setOffsetX] = useState();
  const [offsetY, setOffsetY] = useState();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (ref.current.offsetWidth !== width) {
        setWidth(ref.current.offsetWidth);
      }
      if (ref.current.offsetHeight !== height) {
        setHeight(ref.current.offsetHeight);
      }
      const boundingRect = ref.current.getBoundingClientRect();
      if (boundingRect.x !== offsetX) {
        setOffsetX(boundingRect.x);
      }
      if (boundingRect.y !== offsetY) {
        setOffsetY(boundingRect.y);
      }
      onResize && onResize({ width: boundingRect.width, height: boundingRect.height, x: boundingRect.x, y: boundingRect.y });
    });
    resizeObserver.observe(ref.current);
    return function cleanup() {
      resizeObserver.disconnect();
    };
  }, [ref.current]);
  return { width, height, x: offsetX, y: offsetY };
};
export default useComponentDimensions;
