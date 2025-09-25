import { ACTION_TYPES, ADJUSTMENTS, CONTENT_SCALING_ZOOM_FACTOR_INCREASE } from '@/constants/accessibility';
import Joi from 'joi';
import { setWindowZoom } from '../main';
import { getModel } from './db';
import joiLib from './joi';

class AccessibilitySettingsLib {
  /**
   * reads the accessibility settings from the database
   * @returns the accessibility settings object
   */
  static async read() {
    const AccessibilitySettings = getModel('accessibilitySettings');
    const accessibilitySettings = await AccessibilitySettings.findByPk(1);
    return accessibilitySettings.toJSON();
  }

  /**
   * updates the accessibility settings in the database
   * @param {Object} input
   * @param {String} input.actionType - the type of action to update
   * @param {Object} input.payload - the payload
   * @param {{}} opt
   * @returns the updated settings object
   */
  static async update(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        actionType: Joi.enum(Object.values(ACTION_TYPES)).required(),
        payload: Joi.object().required()
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const AccessibilitySettings = getModel('accessibilitySettings');
      const accessibilitySettingsObj = await AccessibilitySettings.findByPk(1);
      const accessibilitySettings = accessibilitySettingsObj.toJSON();
      if (data.actionType === ACTION_TYPES.PROFILE) {
        if (accessibilitySettings.profile === data.payload.profile) { // unset profile
          accessibilitySettingsObj.profile = null;
        } else {
          accessibilitySettingsObj.profile = data.payload.profile;
        }
      }
      if (data.actionType === ACTION_TYPES.ADJUSTMENT) {
        let adjustments = accessibilitySettings.adjustments;
        const foundProp = adjustments.find(a => a.prop === data.payload.prop);
        if (foundProp) {
          if (data.payload.params) {
            foundProp.params = data.payload.params;
          } else {
            adjustments = adjustments.filter(a => a.prop !== data.payload.prop);
          }
        } else {
          adjustments.push(data.payload);
        }
        if (data.payload.prop === ADJUSTMENTS.CONTENT_SCALING) {
          const zoomFactor = data.payload.params ? 1 + (data.payload.params) * CONTENT_SCALING_ZOOM_FACTOR_INCREASE : 1;
          setWindowZoom(zoomFactor);
        }
        accessibilitySettingsObj.adjustments = adjustments;
      }
      await accessibilitySettingsObj.save();
      return accessibilitySettings;
    } catch (error) {
      console.log('Error updating accessibility settings:', error.message);
    }
  }

  /**
   * resets the accessibility settings in the database
   * @param {Object} input
   * @param {String} input.actionType - the type to reset
   * @param {Array} input.items - the items to reset
   * @param {{}} opt
   */
  static async reset(input = {}, opt = {}) {
    const schema = joiLib.schema(() =>
      Joi.object({
        actionType: Joi.enum(Object.values(ACTION_TYPES)).required(),
        items: Joi.array().items().optional().default([])
      })
    );
    const data = await joiLib.validate(schema, input);
    try {
      const AccessibilitySettings = getModel('accessibilitySettings');
      const accessibilitySettingsObj = await AccessibilitySettings.findByPk(1);
      if (data.actionType === ACTION_TYPES.PROFILE) {
        accessibilitySettingsObj.profile = null;
      }
      if (data.actionType === ACTION_TYPES.ADJUSTMENT) {
        if (data.items && data.items.length > 0) {
          const adjustments = accessibilitySettingsObj.adjustments;
          const newAdjustments = adjustments.filter(a => !data.items.includes(a.prop));
          accessibilitySettingsObj.adjustments = newAdjustments;
        } else {
          accessibilitySettingsObj.adjustments = [];
        }
      }
      await accessibilitySettingsObj.save();
    } catch (error) {
      console.log('Error resetting accessibility settings:', error.message);
    }
  }
}

export default AccessibilitySettingsLib;
