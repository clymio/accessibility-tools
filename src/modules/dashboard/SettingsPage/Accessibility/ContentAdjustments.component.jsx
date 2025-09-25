import { ADJUSTMENTS, CONTENT_CARD_ITEMS, CONTENT_SLIDER_ITEMS } from '@/constants/accessibility';
import { AdjustmentsList } from '@/modules/dashboard/SettingsPage/Accessibility/AdjustmentsList.component';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import { useAccessibilityStore } from '@/stores';
import { Box, Slider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import { minus, plus, reset } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

export default function ContentAdjustments() {
  const {
    adjustments,
    setAdjustment,
    bulkResetAdjustments
  } = useAccessibilityStore();

  const isScaledContent = adjustments.CONTENT_SCALING > 2;

  const resetAllTextAdjustments = async () => {
    await bulkResetAdjustments([ADJUSTMENTS.CONTENT_SCALING, ADJUSTMENTS.FONT_SIZE, ADJUSTMENTS.LETTER_SPACING, ADJUSTMENTS.LINE_SPACING]);
  };

  const handleSliderChange = async (adjustment, value) => {
    const newValue = Math.min(5, Math.max(0, value));
    await setAdjustment(adjustment, newValue);
  };

  return (
    <>
      <Box className={styles.slidersContainer}>
        {CONTENT_SLIDER_ITEMS.map(({ id, adjustment, title }) => (
          <Box key={id} sx={{ mb: 2 }} className={classNames(styles.sliderContainerOuter, { [styles.scaled]: isScaledContent })}>
            <Typography className={styles.sliderTitle}>{title}</Typography>
            <Box className={styles.sliderContainer} sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={async () => await handleSliderChange(adjustment, Math.max(0, (adjustments[adjustment] ?? 0) - 1))} size='small' className={styles.sliderButtonDecrease}>
                <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.removeIcon)} icon={minus} />
              </IconButton>
              <Slider
                aria-labelledby={id}
                className={styles.slider}
                value={adjustments[adjustment] ?? 0}
                onChange={async (e, newValue) => await handleSliderChange(adjustment, newValue)}
                valueLabelDisplay='auto'
                step={1}
                marks
                min={0}
                max={5}
              />
              <IconButton onClick={async () => await handleSliderChange(adjustment, Math.max(0, (adjustments[adjustment] ?? 0) + 1))} size='small' className={styles.sliderButtonIncrease}>
                <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.plusIcon)} icon={plus} />
              </IconButton>
            </Box>

          </Box>

        ))}
        <Button onClick={resetAllTextAdjustments} className={styles.sliderResetButton} variant='outlined' startIcon={<Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={reset} />}>
          <Typography variant='body2' className={styles.sliderResetButtonText}>Reset</Typography>
        </Button>
      </Box>

      <AdjustmentsList items={CONTENT_CARD_ITEMS} listType='content' />
    </>
  );
};
