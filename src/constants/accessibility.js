import {
  blackAndWhite,
  brightness,
  contrastMode,
  darkMode,
  dyslexiaFriendly,
  hidePhotos,
  highlightLinks,
  highlightTitles,
  highSaturation,
  lightHighContrast,
  lowSaturation,
  mute,
  readableFont, readingGuide,
  readingMark,
  readingMode, stopVideos,
  textMagnifier
} from '@/assets/icons';

export const ADJUSTMENTS = {
  CURSOR: 'CURSOR',
  READING_MASK: 'READING_MASK',
  READING_GUIDE: 'READING_GUIDE',
  READING_MODE: 'READING_MODE',
  CONTENT_SCALING: 'CONTENT_SCALING',
  FONT_SIZE: 'FONT_SIZE',
  LETTER_SPACING: 'LETTER_SPACING',
  LINE_SPACING: 'LINE_SPACING',
  TEXT_ALIGNMENT: 'TEXT_ALIGNMENT',
  HIGHLIGHT_LINKS: 'HIGHLIGHT_LINKS',
  FONT_CHANGE: 'FONT_CHANGE',
  HIGHLIGHT_TITLES: 'HIGHLIGHT_TITLES',
  STOP_ANIMATIONS: 'STOP_ANIMATIONS',
  HIDE_IMAGES: 'HIDE_IMAGES',
  MUTE_SOUNDS: 'MUTE_SOUNDS',
  TEXT_MAGNIFIER: 'TEXT_MAGNIFIER',
  SATURATION: 'SATURATION',
  CONTRAST: 'CONTRAST',
  BACKGROUND_COLOR: 'BACKGROUND_COLOR',
  HEADINGS_COLOR: 'HEADINGS_COLOR',
  CONTENT_COLOR: 'CONTENT_COLOR',
  BRIGHTNESS: 'BRIGHTNESS',
  KEYBOARD_NAVIGATION: 'KEYBOARD_NAVIGATION'
};

export const PROFILES = {
  SEIZURE_SAFE: 'SEIZURE_SAFE',
  COLOR_BLIND: 'COLOR_BLIND',
  VISION_IMPAIRED: 'VISION_IMPAIRED',
  ADHD: 'ADHD',
  DYSLEXIA: 'DYSLEXIA',
  COGNITIVE: 'COGNITIVE',
  KEYBOARD_NAVIGATION: 'KEYBOARD_NAVIGATION'
};

export const LS_KEYS = {
  STATE: 'state'
};

export const ACTION_TYPES = {
  ADJUSTMENT: 'ADJUSTMENT',
  PROFILE: 'PROFILE'
};

export const adjustmentsConfigByProfile = {
  [PROFILES.SEIZURE_SAFE]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: true
      },
      {
        prop: ADJUSTMENTS.SATURATION,
        params: 'low'
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: false
      },
      { prop: ADJUSTMENTS.SATURATION }
    ]
  },
  [PROFILES.COLOR_BLIND]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 1
      },
      {
        prop: ADJUSTMENTS.SATURATION,
        params: 'high'
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 0
      },
      { prop: ADJUSTMENTS.SATURATION }
    ]
  },
  [PROFILES.VISION_IMPAIRED]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 3
      },
      {
        prop: ADJUSTMENTS.SATURATION,
        params: 'high'
      },
      {
        prop: ADJUSTMENTS.FONT_CHANGE,
        params: 'readable'
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 0
      },
      { prop: ADJUSTMENTS.SATURATION },
      {
        prop: ADJUSTMENTS.FONT_CHANGE,
        params: false
      }
    ]
  },
  [PROFILES.ADHD]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 1
      },
      {
        prop: ADJUSTMENTS.SATURATION,
        params: 'high'
      },
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: true
      },
      {
        prop: ADJUSTMENTS.READING_MASK,
        params: true
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 0
      },
      { prop: ADJUSTMENTS.SATURATION },
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: false
      },
      {
        prop: ADJUSTMENTS.READING_MASK,
        params: false
      }
    ]
  },
  [PROFILES.DYSLEXIA]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 1
      },
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: true
      },
      {
        prop: ADJUSTMENTS.FONT_CHANGE,
        params: 'dyslexic'
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 0
      },
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: false
      },
      {
        prop: ADJUSTMENTS.FONT_CHANGE,
        params: false
      }
    ]
  },
  [PROFILES.COGNITIVE]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 1
      },
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: true
      },
      {
        prop: ADJUSTMENTS.HIGHLIGHT_TITLES,
        params: true
      },
      {
        prop: ADJUSTMENTS.READING_MASK,
        params: true
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.CONTENT_SCALING,
        params: 0
      },
      {
        prop: ADJUSTMENTS.STOP_ANIMATIONS,
        params: false
      },
      {
        prop: ADJUSTMENTS.HIGHLIGHT_TITLES,
        params: false
      },
      {
        prop: ADJUSTMENTS.READING_MASK,
        params: false
      }
    ]
  },
  [PROFILES.KEYBOARD_NAVIGATION]: {
    setConfig: [
      {
        prop: ADJUSTMENTS.KEYBOARD_NAVIGATION,
        params: true
      }
    ],
    resetConfig: [
      {
        prop: ADJUSTMENTS.KEYBOARD_NAVIGATION,
        params: false
      }
    ]
  }
};

export const COLOR_SLIDER_ITEMS = [
  {
    id: 'background',
    adjustment: ADJUSTMENTS.BACKGROUND_COLOR,
    title: 'Background'
  },
  {
    id: 'headings',
    adjustment: ADJUSTMENTS.HEADINGS_COLOR,
    title: 'Headings'
  },
  {
    id: 'content',
    adjustment: ADJUSTMENTS.CONTENT_COLOR,
    title: 'Content'
  },
  {
    id: 'brightness',
    adjustment: ADJUSTMENTS.BRIGHTNESS,
    title: 'Brightness',
    value: 1
  }
];

export const COLOR_CARD_ITEMS = [
  {
    id: 'mono',
    adjustment: ADJUSTMENTS.SATURATION,
    icon: blackAndWhite,
    description: 'Black and<br/> white'
  },
  {
    id: 'high',
    adjustment: ADJUSTMENTS.SATURATION,
    icon: highSaturation,
    description: 'High<br/> saturation'
  },
  {
    id: 'low',
    adjustment: ADJUSTMENTS.SATURATION,
    icon: lowSaturation,
    description: 'Low<br/> saturation'
  },
  {
    id: 'light-contrast',
    adjustment: ADJUSTMENTS.SATURATION,
    icon: contrastMode,
    description: 'Contrast<br/> mode'
  },
  {
    id: 'dark-contrast',
    adjustment: ADJUSTMENTS.SATURATION,
    icon: darkMode,
    description: 'Dark<br/> high-<br/> contrast'
  },
  {
    id: 'high-contrast',
    adjustment: ADJUSTMENTS.SATURATION,
    icon: lightHighContrast,
    description: 'Light<br/> high-<br/> contrast'
  }

];

export const CONTENT_SLIDER_ITEMS = [
  {
    id: 'contentScaling',
    adjustment: ADJUSTMENTS.CONTENT_SCALING,
    title: 'Content scaling',
    value: 1
  },
  {
    id: 'textSpacing',
    adjustment: ADJUSTMENTS.LETTER_SPACING,
    title: 'Text spacing',
    value: 1
  },
  {
    id: 'fontSize',
    adjustment: ADJUSTMENTS.FONT_SIZE,
    title: 'Font size',
    value: 1
  },
  {
    id: 'lineSpacing',
    adjustment: ADJUSTMENTS.LINE_SPACING,
    title: 'Line spacing',
    value: 1
  }
];

export const CONTENT_CARD_ITEMS = [

  {
    id: 'readable',
    adjustment: ADJUSTMENTS.FONT_CHANGE,
    icon: readableFont,
    description: 'Readable<br/> font'
  },
  {
    id: 'dyslexic',
    adjustment: ADJUSTMENTS.FONT_CHANGE,
    icon: dyslexiaFriendly,
    description: 'Dyslexia<br/> friendly'
  },
  {
    id: 'magnifier',
    adjustment: ADJUSTMENTS.TEXT_MAGNIFIER,
    icon: textMagnifier,
    description: 'Text<br/> Magnifier'
  },
  {
    id: 'reading',
    adjustment: ADJUSTMENTS.READING_MODE,
    icon: readingMode,
    description: 'Reading<br/> mode'
  },
  {
    id: 'highlightTitle',
    adjustment: ADJUSTMENTS.HIGHLIGHT_TITLES,
    icon: highlightTitles,
    description: 'Highlight<br/> titles'
  },
  {
    id: 'highlightLink',
    adjustment: ADJUSTMENTS.HIGHLIGHT_LINKS,
    icon: highlightLinks,
    description: 'Highlight<br/> links'
  },
  {
    id: 'highlightImage',
    adjustment: ADJUSTMENTS.HIDE_IMAGES,
    icon: hidePhotos,
    description: 'Hide<br/> images'
  },
  {
    id: 'stopAnimations',
    adjustment: ADJUSTMENTS.STOP_ANIMATIONS,
    icon: stopVideos,
    description: 'Stop<br/> animations'
  },
  {
    id: 'mute',
    adjustment: ADJUSTMENTS.MUTE_SOUNDS,
    icon: mute,
    description: 'Mute<br/> sounds'
  }
];

export const NAVIGATION_CARD_ITEMS = [
  {
    id: 'readingMask',
    adjustment: ADJUSTMENTS.READING_MASK,
    icon: readingMark,
    description: 'Reading<br/> mask'
  },
  {
    id: 'readingGuide',
    adjustment: ADJUSTMENTS.READING_GUIDE,
    icon: readingGuide,
    description: ' Reading<br/> guide'
  }
];

export const CONTENT_SCALING_ZOOM_FACTOR_INCREASE = 0.1;
