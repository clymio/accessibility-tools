import { ADJUSTMENTS as ADJUSTMENT, ADJUSTMENTS } from '@/constants/accessibility';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import { useAccessibilityStore } from '@/stores';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import classNames from 'classnames';
import Icon from '@/modules/core/Icon';

export const AdjustmentCard = ({ data }) => {
  const {
    adjustments,
    setAdjustment
  } = useAccessibilityStore();
  const { id, title, description, icon, adjustment, listType } = data;

  const toggleColorAdjustment = async (value) => {
    await setAdjustment(ADJUSTMENTS.SATURATION, adjustments[ADJUSTMENTS.SATURATION] === value ? undefined : value);
  };

  const toggleContentAdjustment = async (prop, id) => {
    const currentValue = adjustments[prop];

    if (prop === ADJUSTMENTS.FONT_CHANGE) {
      const newValue = currentValue === id ? undefined : id;
      await setAdjustment(ADJUSTMENTS.FONT_CHANGE, newValue);
      return;
    }

    if (prop === ADJUSTMENTS.READING_MODE) {
      const isActive = currentValue?.isActive;
      if (!isActive) {
        await setAdjustment(ADJUSTMENTS.READING_MODE, {
          isActive: true,
          onCloseClick: () => {
            useAccessibilityStore.getState().setAdjustment(ADJUSTMENTS.READING_MODE, undefined);
          }
        });
      } else {
        await setAdjustment(ADJUSTMENTS.READING_MODE, undefined);
      }
      return;
    }

    const newValue = currentValue ? undefined : true;
    await setAdjustment(prop, newValue);
  };

  const toggleNavigationAdjustment = async (prop) => {
    await setAdjustment(prop, !adjustments[prop]);
  };

  return (
    <Card
      className={classNames('clym-contrast-exclude', styles.card)}
      sx={{
        borderRadius: 0,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRightWidth: 1,

        ...(data.gridSettings.isFirstInRow && { borderLeftWidth: 1 }),
        ...(!data.gridSettings.isFirstInRow && { borderLeftWidth: 0 }),
        ...(!data.gridSettings.isFirstRow ? { borderTop: 0 } : {}),

        ...(data.gridSettings.isFirstRow && data.gridSettings.isLeftColumn && { borderTopLeftRadius: '8px' }),
        ...(data.gridSettings.isFirstRow && data.gridSettings.isRightColumn && { borderTopRightRadius: '8px' }),
        ...(data.gridSettings.isLastRow && data.gridSettings.isLeftColumn && { borderBottomLeftRadius: '8px' }),
        ...(data.gridSettings.isLastRow && data.gridSettings.isRightColumn && { borderBottomRightRadius: '8px' })
      }}
    >
      <CardActionArea
        onClick={async () =>
          data.listType === 'color'
            ? await toggleColorAdjustment(id)
            : data.listType === 'content'
              ? await toggleContentAdjustment(adjustment, id)
              : data.listType === 'navigation'
                ? await toggleNavigationAdjustment(adjustment)
                : ''}
        className='clym-contrast-exclude'
        data-active={
          data.listType === 'content'
            ? adjustment === ADJUSTMENT.FONT_CHANGE
              ? adjustments[ADJUSTMENT.FONT_CHANGE] === id
                ? ''
                : undefined
              : adjustments[adjustment]
                ? ''
                : undefined
            : data.listType === 'navigation'
              ? adjustments[adjustment]
                ? ''
                : undefined
              : adjustments[adjustment] === id
                ? ''
                : undefined
        }
        sx={{
          height: '100%',
          backgroundColor:
            data.listType === 'content'
              ? adjustment === ADJUSTMENT.FONT_CHANGE
                ? adjustments[ADJUSTMENT.FONT_CHANGE] === id
                  ? 'action.selected'
                  : 'inherit'
                : adjustments[adjustment]
                  ? 'action.selected'
                  : 'inherit'
              : data.listType === 'navigation'
                ? adjustments[adjustment]
                  ? 'action.selected'
                  : 'inherit'
                : adjustments[adjustment] === id
                  ? 'action.selected'
                  : 'inherit',
          '&:hover': {
            backgroundColor: 'action.selectedHover'
          }
        }}
      >
        <CardContent sx={{ height: '100%' }} className={classNames('clym-contrast-exclude', styles.cardContent)}>
          {icon && (
            <div className={styles.iconContainer}>
              <Icon
                className={classNames(
                  'clym-contrast-exclude',
                  styles.icon,
                  {
                    [styles.colorIcon]: data.listType === 'color',
                    [styles.contentIcon]: data.listType === 'content',
                    [styles.navigationIcon]: data.listType === 'navigation'
                  })}
                icon={icon}
              />
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
};
