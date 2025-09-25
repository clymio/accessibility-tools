import { AdjustmentCard } from './AdjustmentCard.component';
import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useAccessibilityStore } from '@/stores';

export const AdjustmentsList = ({ items = [], listType = '', isProfiles = false }) => {
  const {
    adjustments
  } = useAccessibilityStore();

  const gridRef = useRef(null);
  const isScaledContent = adjustments.CONTENT_SCALING > 2;

  useEffect(() => {
    if (gridRef.current) {
      const cards = Array.from(gridRef.current.children);
      const maxHeight = Math.max(...cards.map(card => card.offsetHeight));

      cards.forEach((card) => {
        card.style.height = `${maxHeight}px`;
      });
    }
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: {
          md: isScaledContent ? 'repeat(1, minmax(150px, 1fr))' : 'repeat(4, minmax(150px, 1fr))',
          lg: isScaledContent ? 'repeat(1, minmax(150px, 1fr))' : 'repeat(5, minmax(150px, 1fr))',
          xl: isScaledContent ? 'repeat(2, minmax(150px, 1fr))' : 'repeat(6, minmax(150px, 1fr))'
        },
        gap: 0,
        alignItems: 'stretch',
        gridAutoRows: '1fr'
      }}
      ref={gridRef}
    >
      {items.map(({ id, title, description, icon, adjustment }, index) => {
        const colSpan = {
          md: isScaledContent ? 1 : 4,
          lg: isScaledContent ? 1 : 5,
          xl: isScaledContent ? 2 : 6
        };

        let columns;

        if (isScaledContent) {
          columns = colSpan[window.innerWidth < 600 ? 'xs' : window.innerWidth < 900 ? 'sm' : window.innerWidth < 1300 ? 'md' : window.innerWidth < 1536 ? 'lg' : 'xl'];
        } else {
          columns = colSpan[window.innerWidth < 600 ? 'xs' : window.innerWidth < 900 ? 'sm' : window.innerWidth < 1200 ? 'md' : window.innerWidth < 1536 ? 'lg' : 'xl'];
        }

        const isLast = index === items.length - 1;
        const isFirstRow = index < columns;
        const isLastRow = index >= items.length - columns;
        const isLeftColumn = index % columns === 0;
        const isRightColumn = (index + 1) % columns === 0 || isLast;
        const isFirstInRow = index % columns === 0;

        const gridSettings = {
          isLast,
          isFirstInRow,
          isLastRow,
          isLeftColumn,
          isRightColumn,
          isFirstRow
        };

        const cardData = {
          id,
          title,
          description,
          icon,
          adjustment,
          gridSettings,
          listType
        };

        return (
          <AdjustmentCard key={id} data={cardData} />
        );
      })}
    </Box>
  );
};
