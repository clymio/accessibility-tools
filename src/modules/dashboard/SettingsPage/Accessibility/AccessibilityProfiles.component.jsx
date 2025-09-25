import { PROFILES } from '@/constants/accessibility';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import { useAccessibilityStore } from '@/stores';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';

import Image from 'next/image';

import { seizure, visionImpaired, adhdFriendly, dyslexiaFriendly, cognitive, colorBlind } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

export default function AccessibilityProfiles() {
  const {
    profile,
    setProfile,
    adjustments
  } = useAccessibilityStore();
  const items = [
    {
      id: PROFILES.SEIZURE_SAFE,
      icon: seizure,
      title: 'Seizure Safe',
      description: 'Clears flashes<br/> & reduces color'
    },
    {
      id: PROFILES.VISION_IMPAIRED,
      icon: visionImpaired,
      title: 'Vision Impaired',
      description: 'Enhances<br/> website\'s visuals'
    },
    {
      id: PROFILES.ADHD,
      icon: adhdFriendly,
      title: 'ADHD Friendly',
      description: 'More focus<br/> and fewer distractions'
    },
    {
      id: PROFILES.COLOR_BLIND,
      icon: colorBlind,
      title: 'Color blind',
      description: 'Enhances websites<br/> color saturation'
    },
    {
      id: PROFILES.DYSLEXIA,
      icon: dyslexiaFriendly,
      title: 'Dyslexia Friendly',
      description: 'Enhance<br/> website\'s text'
    },
    {
      id: PROFILES.COGNITIVE,
      icon: cognitive,
      title: 'Cognitive Disability',
      description: 'Assists with reading<br/> and focusing'
    }
  ];

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
      {items.map(({ id, title, description, icon, profileSetting }, index, cards) => {
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

        return (
          <Card
            key={id}
            className={classNames('clym-contrast-exclude', styles.card)}
            sx={{
              borderRadius: 0,
              borderWidth: 1,
              borderStyle: 'solid',
              borderRightWidth: 1,

              ...(isFirstInRow && { borderLeftWidth: 1 }),
              ...(!isFirstInRow && { borderLeftWidth: 0 }),
              ...(!isFirstRow ? { borderTop: 0 } : {}),

              ...(isFirstRow && isLeftColumn && { borderTopLeftRadius: '8px' }),
              ...(isFirstRow && isRightColumn && { borderTopRightRadius: '8px' }),
              ...(isLastRow && isLeftColumn && { borderBottomLeftRadius: '8px' }),
              ...(isLastRow && isRightColumn && { borderBottomRightRadius: '8px' })
            }}
          >
            <CardActionArea
              onClick={async () => await setProfile(id)}
              className='clym-contrast-exclude'
              data-active={profile === id ? '' : undefined}
              sx={{
                height: '100%',
                backgroundColor: profile === id ? 'action.selected' : 'inherit',
                '&:hover': {
                  backgroundColor: 'action.selectedHover'
                }
              }}
            >
              <CardContent sx={{ height: '100%' }} className={styles.cardContent}>
                {icon
                && (
                  <div className={styles.iconContainer}>
                    <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.profileIcon)} icon={icon} />
                  </div>
                )}

                {title && (
                  <Typography variant='body2' className={classNames('clym-contrast-exclude', styles.cardTitle)}>
                    {title}
                  </Typography>
                )}
                <Typography variant='caption' className={classNames('clym-contrast-exclude', styles.cardDescription)} dangerouslySetInnerHTML={{ __html: description }} />
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
};
