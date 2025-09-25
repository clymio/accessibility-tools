import { Box, Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import styles from '@/modules/dashboard/SettingsPage/Settings.module.scss';
import AccessibilityProfiles from '@/modules/dashboard/SettingsPage/Accessibility/AccessibilityProfiles.component';
import ContentAdjustments from '@/modules/dashboard/SettingsPage/Accessibility/ContentAdjustments.component';
import ColorAdjustments from '@/modules/dashboard/SettingsPage/Accessibility/ColorAdjustments.component';
import NavigationAdjustments from '@/modules/dashboard/SettingsPage/Accessibility/NavigationAdjustments.component';
import { useState } from 'react';
import classNames from 'classnames';
import { chevronDown } from '@/assets/icons';
import Icon from '@/modules/core/Icon';

export default function Accessibility() {
  const [expanded, setExpanded] = useState([0]);

  const handleChange = index => (event, isExpanded) => {
    setExpanded(prevExpanded =>
      isExpanded
        ? [...prevExpanded, index]
        : prevExpanded.filter(i => i !== index)
    );
  };

  const accordionSections = [
    {
      name: 'Accessibility profiles',
      component: AccessibilityProfiles
    },
    {
      name: 'Content adjustments',
      component: ContentAdjustments
    },
    {
      name: 'Color adjustments',
      component: ColorAdjustments
    },
    {
      name: 'Navigation adjustments',
      component: NavigationAdjustments
    }
  ];

  return (
    <>
      <Box className={styles.accessibilityPage}>
        {accordionSections.map(({ name, component: Component }, index) => (
          <Accordion
            key={name}
            className={styles.accordion}
            expanded={expanded.includes(index)}
            onChange={handleChange(index)}
          >
            <AccordionSummary className={styles.accordionSummary} expandIcon={<Icon className={classNames('clym-contrast-exclude', styles.icon)} icon={chevronDown} />}>
              <Typography className={styles.accordionTitle} variant='subtitle1'>
                {name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionContent}>
              <Component />

            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </>
  );
}
