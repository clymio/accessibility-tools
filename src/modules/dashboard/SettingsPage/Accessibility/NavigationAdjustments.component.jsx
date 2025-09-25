import { NAVIGATION_CARD_ITEMS } from '@/constants/accessibility';
import { AdjustmentsList } from '@/modules/dashboard/SettingsPage/Accessibility/AdjustmentsList.component';

export default function NavigationAdjustments() {
  return (
    <AdjustmentsList items={NAVIGATION_CARD_ITEMS} listType='navigation' />
  );
};
