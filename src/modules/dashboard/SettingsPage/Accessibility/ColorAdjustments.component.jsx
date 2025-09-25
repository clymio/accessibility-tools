import { COLOR_CARD_ITEMS, COLOR_SLIDER_ITEMS } from '@/constants/accessibility';
import ColorSlider from '@/modules/core/ColorSlider';
import { AdjustmentsList } from '@/modules/dashboard/SettingsPage/Accessibility/AdjustmentsList.component';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import { useAccessibilityStore } from '@/stores';
import { Box, Slider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import Icon from '@/modules/core/Icon';
import { minus, plus, reset } from '@/assets/icons';

export default function ColorAdjustments() {
  const {
    adjustments,
    setAdjustment
  } = useAccessibilityStore();

  const isScaledContent = adjustments.CONTENT_SCALING > 2;

  const resetAllColorAdjustments = async () => {
    for (const item of COLOR_SLIDER_ITEMS) {
      const a = item.adjustment;
      await setAdjustment(a, 0);
    }
  };

  const handleSliderChange = async (adjustment, value) => {
    const newValue = Math.min(5, Math.max(0, value));
    await setAdjustment(adjustment, newValue);
  };

  const handleColorSliderChange = async (adjustment, value) => {
    if ((adjustment === 'BACKGROUND_COLOR' && value === 'white') || ((adjustment === 'CONTENT_COLOR' || adjustment === 'HEADINGS_COLOR') && value === 'black')) {
      await setAdjustment(adjustment, 0);
      return;
    }
    await setAdjustment(adjustment, value);
  };

  return (
    <>
      <Box className={styles.slidersContainer}>
        {COLOR_SLIDER_ITEMS.map(({ id, adjustment, title }) => (
          <Box key={id} sx={{ mb: 2 }} className={classNames(styles.sliderContainerOuter, { [styles.scaled]: isScaledContent })}>
            <Typography className={styles.sliderTitle}>{title}</Typography>

            {id !== 'brightness' && (
              <Box className={styles.colorSliderContainer} sx={{ display: 'flex', alignItems: 'center' }}>
                <ColorSlider value={adjustments[adjustment]} onChange={value => handleColorSliderChange(adjustment, value)} className={classNames({ [styles.scaledSlider]: isScaledContent })} />
              </Box>
            )}

            {id === 'brightness' && (
              <Box className={styles.sliderContainer} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={async () => await handleSliderChange(adjustment, Math.max(0, (adjustments[adjustment] ?? 0) - 1))} size='small' className={styles.sliderButtonDecrease}>
                  <Icon className={classNames('clym-contrast-exclude', styles.icon, styles.removeIcon)} icon={minus} />
                </IconButton>
                <Slider
                  aria-labelledby={id}
                  className={styles.slider}
                  value={typeof adjustments[adjustment] === 'number' ? adjustments[adjustment] : 0}
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
            )}

          </Box>

        ))}
        <Button onClick={resetAllColorAdjustments} className={styles.sliderResetButton} variant='outlined' startIcon={<Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={reset} />}>
          <Typography variant='body2' className={styles.sliderResetButtonText}>Reset</Typography>
        </Button>
      </Box>

      <AdjustmentsList items={COLOR_CARD_ITEMS} listType='color' />
    </>
  );
};
