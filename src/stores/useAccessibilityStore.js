import { ACTION_TYPES } from '@/constants/accessibility';
import { A11yHandler } from '@/handlers/accessibility';
import { create } from 'zustand';

const config = {
  actionType: '',
  payload: {}
};

export const useAccessibilityStore = create((set, get) => ({
  profile: '',
  luma: 0,
  handler: typeof window !== 'undefined' ? new A11yHandler(config) : null,
  adjustments: {},
  setLuma: v =>
    set(() => {
      return {
        luma: v
      };
    }),

  init: async config =>
    set(async (state) => {
      const { profile, adjustments = [] } = config;
      if (profile) {
        if (state.handler) {
          state.handler.triggerChange({
            actionType: ACTION_TYPES.PROFILE,
            payload: { profile }
          });
        }
      }
      if (adjustments.length > 0) {
        if (state.handler) {
          for (const adj of adjustments) {
            state.handler.triggerChange({
              actionType: ACTION_TYPES.ADJUSTMENT,
              payload: adj
            });
          }
        }
      }
    }),

  setAdjustment: async (prop, params) =>
    set(async (state) => {
      const data = {
        actionType: ACTION_TYPES.ADJUSTMENT,
        payload: { prop, params }
      };

      if (state.handler) {
        state.handler.triggerChange(data);
      }

      let safeParams = params;

      if (typeof params === 'object' && params !== null) {
        const { onCloseClick, ...rest } = params;
        safeParams = rest;
      }

      const shouldRemove
        = params === undefined
        || params === false
        || params === 0
        || params === 'white'
        || ((prop === 'CONTENT_COLOR' || prop === 'HEADINGS_COLOR') && params === 'black')
        || (typeof params === 'object' && Object.keys(safeParams).length === 0);

      if (shouldRemove) {
        await window.api.accessibilitySettings.update({
          actionType: ACTION_TYPES.ADJUSTMENT,
          payload: { prop, params: undefined }
        });
      } else {
        await window.api.accessibilitySettings.update({
          actionType: ACTION_TYPES.ADJUSTMENT,
          payload: { prop, params: safeParams }
        });
      }

      const newAdjustments = { ...state.adjustments };
      if (shouldRemove) {
        delete newAdjustments[prop];
      } else {
        newAdjustments[prop] = params;
      }

      return {
        adjustments: newAdjustments
      };
    }),

  setProfile: async (value) => {
    const data = {
      actionType: ACTION_TYPES.PROFILE,
      payload: { profile: value }
    };

    const { handler, profile } = get();
    if (handler) {
      handler.triggerChange(data);
    }

    await window.api.accessibilitySettings.update(data);
    const newProfile = profile === value ? '' : value;
    set({ profile: newProfile });
  },

  bulkResetAdjustments: async adjArr =>
    set(async (state) => {
      if (state.handler) {
        for (const key of adjArr) {
          const data = {
            actionType: ACTION_TYPES.ADJUSTMENT,
            payload: { prop: key, params: undefined }
          };
          state.handler.triggerChange(data);
        }
      }
      await window.api.accessibilitySettings.reset({ actionType: ACTION_TYPES.ADJUSTMENT, items: adjArr });
      return {};
    })
}));
