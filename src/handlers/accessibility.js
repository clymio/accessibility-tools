import { ACTION_TYPES, ADJUSTMENTS, PROFILES, adjustmentsConfigByProfile } from '@/constants/accessibility';
import { useAccessibilityStore, useUiStore } from '@/stores';

let initialState = {};

const propClassNamesMap = {
  [ADJUSTMENTS.HIGHLIGHT_LINKS]: 'clym-highlight-links',
  [ADJUSTMENTS.HIGHLIGHT_TITLES]: 'clym-highlight-titles',
  [ADJUSTMENTS.HEADINGS_COLOR]: 'clym-headings-color',
  [ADJUSTMENTS.BACKGROUND_COLOR]: 'clym-background-color',
  [ADJUSTMENTS.CONTENT_COLOR]: 'clym-content-color',
  [ADJUSTMENTS.HIDE_IMAGES]: 'clym-hide-images',
  [ADJUSTMENTS.STOP_ANIMATIONS]: 'clym-stop-animations',
  [ADJUSTMENTS.CURSOR]: 'clym-custom-cursor',
  [ADJUSTMENTS.FONT_CHANGE]: 'clym-font-change',
  [ADJUSTMENTS.LINE_SPACING]: 'clym-line-spacing',
  [ADJUSTMENTS.LETTER_SPACING]: 'clym-letter-spacing',
  [ADJUSTMENTS.FONT_SIZE]: 'clym-font-size-increase',
  [ADJUSTMENTS.SATURATION]: 'clym-contrast',
  [ADJUSTMENTS.CONTENT_SCALING]: 'clym-content-scaling',
  [ADJUSTMENTS.READING_MODE]: 'clym-reading-mode',
  [ADJUSTMENTS.TEXT_ALIGNMENT]: 'clym-text-alignment',
  [ADJUSTMENTS.BRIGHTNESS]: 'clym-brightness'
};

const propCssMap = {
  [ADJUSTMENTS.HEADINGS_COLOR]: color =>
    `.${propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]} h1, .${
      propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]
    } h2, .${propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]} h3, .${
      propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]
    } h4, .${propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]} h5, .${
      propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]
    } h6, .${propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]} h5, .${
      propClassNamesMap[ADJUSTMENTS.HEADINGS_COLOR]
    } [role=heading] { color: ${color} !important;}`,
  [ADJUSTMENTS.CONTENT_COLOR]: value =>
    `.${propClassNamesMap[ADJUSTMENTS.CONTENT_COLOR]} div, .${propClassNamesMap[ADJUSTMENTS.CONTENT_COLOR]} p, .${
      propClassNamesMap[ADJUSTMENTS.CONTENT_COLOR]
    } li { color: ${value} !important; } .${propClassNamesMap[ADJUSTMENTS.CONTENT_COLOR]} { color: ${value} !important; }`,
  [ADJUSTMENTS.BACKGROUND_COLOR]: value =>
    `.${propClassNamesMap[ADJUSTMENTS.BACKGROUND_COLOR]} {
      background-color: ${value} !important;
      background: ${value} !important;
    }`,
  [ADJUSTMENTS.HIGHLIGHT_TITLES]: () =>
    `.${propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]} h1, .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]
    } h2, .${propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]} h3:not(.MuiAccordion-heading), .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]
    } h4, .${propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]} h5, .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]
    } h6, .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_TITLES]
    } .MuiAccordion h3 h6 { outline: 2px solid #639af9 !important; outline-offset: 2px !important; margin: 4px !important; }`,
  [ADJUSTMENTS.HIGHLIGHT_LINKS]: () =>
    `.${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_LINKS]
    } a, .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_LINKS]
    } button, .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_LINKS]
    } li[role='menuitem'], .${
      propClassNamesMap[ADJUSTMENTS.HIGHLIGHT_LINKS]
    } div[role='button'] { outline: 2px solid rgba(255,114,22,.5) !important; outline-offset: 2px !important; margin: 4px !important; }`,
  [ADJUSTMENTS.HIDE_IMAGES]: () =>
    `.${propClassNamesMap[ADJUSTMENTS.HIDE_IMAGES]} img, .${
      propClassNamesMap[ADJUSTMENTS.HIDE_IMAGES]
    } video { opacity:0 !important; visibility:hidden !important }, .${propClassNamesMap[ADJUSTMENTS.HIDE_IMAGES]} * {background-image:none !important; }`,
  [ADJUSTMENTS.STOP_ANIMATIONS]: () =>
    `.${propClassNamesMap[ADJUSTMENTS.STOP_ANIMATIONS]} * {
      transition: none !important;
      animation-play-state: paused;
    }`,
  [ADJUSTMENTS.CURSOR]: (value) => {
    const imgUrl
      = value === 'black' ? 'https://widget-next.clym-sdk.net/latest/images/bigblackcursor.svg' : 'https://widget-next.clym-sdk.net/latest/images/bigwhitecursor.svg';

    return `.${propClassNamesMap[ADJUSTMENTS.CURSOR]} * {
        cursor: url(${imgUrl}),auto!important;
      }`;
  },
  [ADJUSTMENTS.FONT_CHANGE]: (value) => {
    if (!value) return;
    const fontsMap = {
      readable: 'Arial,Helvetica,sans-serif',
      dyslexic: 'OpenDyslexic'
    };
    return `.${propClassNamesMap[ADJUSTMENTS.FONT_CHANGE]} * {
        font-family: ${fontsMap[value]},Arial,Helvetica,sans-serif !important;
      }`;
  },
  [ADJUSTMENTS.SATURATION]: (value) => {
    const uiStore = useUiStore.getState();
    let css = '';

    if (value === 'dark-contrast') {
      uiStore.setColorMode('dark');
    } else {
      uiStore.setColorMode('light');
    }
  },
  [ADJUSTMENTS.READING_MODE]: () => {
    return `
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} {
      overflow: hidden;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper #clym-readingmode-container {
      max-width: 600px;
      padding: 0 10px;
      margin: auto;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper {
      all: initial; /* This resets most of the inherited properties */
      box-sizing: border-box !important;
      display: block !important;
      height: auto !important;
      padding: 50px;
      background: #fafbff;
      font-size: 15px;
      color: #222;
      line-height: 1.5;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: 9999999;
      overflow: scroll;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper * {
      font-family: Arial,Helvetica,sans-serif;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]}.${propClassNamesMap[ADJUSTMENTS.BACKGROUND_COLOR]} #clym-readingmode-wrapper  {
      background: inherit;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]}.${propClassNamesMap[ADJUSTMENTS.TEXT_ALIGNMENT]} #clym-readingmode-wrapper {
      text-align: inherit;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]}.${propClassNamesMap[ADJUSTMENTS.FONT_CHANGE]} #clym-readingmode-wrapper * {
      font-family: inherit !important;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper a {
      color: #146ff8;
      text-decoration: none;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper img {
      display: block;
      background: rgba(0,0,0,.3) !important;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper-close {
      position: fixed;
      top: 10px;
      right: 20px;
      cursor: pointer;
      font-size: 42px;
      padding: 5px 10px;
      line-height: 1;
    }
    body.${propClassNamesMap[ADJUSTMENTS.READING_MODE]} #clym-readingmode-wrapper-close:focus-visible {
      outline: 2px solid #146ff8;
    }
    `;
  },
  [ADJUSTMENTS.TEXT_ALIGNMENT]: (value) => {
    return `body.${propClassNamesMap[ADJUSTMENTS.TEXT_ALIGNMENT]} {
      text-align: ${value ?? 'initial'};
    }`;
  },
  [ADJUSTMENTS.BRIGHTNESS]: (value) => {
    let brightnessLevels = {
      1: 0.9,
      2: 0.8,
      3: 0.7,
      4: 0.6,
      5: 0.4
    };
    return `html:has(> body.${
      propClassNamesMap[ADJUSTMENTS.BRIGHTNESS]
    }) {
      filter: brightness(${brightnessLevels[value] ?? 1});
    }`;
  }
};

const propGlobalStyleMap = {
  [ADJUSTMENTS.CONTENT_SCALING]: (value) => {
    // TODO update logic
  },
  [ADJUSTMENTS.TEXT_ALIGNMENT]: (value) => {
    if (!value) {
      window.document.body.style.textAlign = 'initial';
    }
    window.document.body.style.textAlign = value;
  },
  [ADJUSTMENTS.READING_GUIDE]: (needToShow) => {
    const id = 'clym-reading-guide';
    var guideEl = document.getElementById(id);

    const mouseCallback = (event) => {
      guideEl.style.left = event.clientX - 250 + 'px';
      guideEl.style.top = event.clientY + 'px';
      guideEl.zoom = '1 !important';
    };

    if (guideEl === null) {
      guideEl = document.createElement('div');
      guideEl.setAttribute('id', id);
      document.body.appendChild(guideEl);
      document.addEventListener('mousemove', mouseCallback);
    } else {
      if (needToShow) {
        guideEl.style.visibility = 'visible';
        document.addEventListener('mousemove', mouseCallback);
      } else {
        guideEl.style.visibility = 'hidden';
        document.removeEventListener('mousemove', mouseCallback);
      }
    }
  },
  [ADJUSTMENTS.READING_MASK]: (needToShow) => {
    const elemClass = 'clym-reading-mask';

    let elems = [...document.getElementsByClassName(elemClass)];

    if (!elems.length) {
      const topElemClass = elemClass + '-top';
      const bottomElemClass = elemClass + '-bottom';
      const elTop = document.createElement('div');
      elTop.classList.add(elemClass, topElemClass);
      document.body.appendChild(elTop);

      const elBottom = document.createElement('div');
      elBottom.classList.add(elemClass, bottomElemClass);
      document.body.appendChild(elBottom);
      elems = [elTop, elBottom];
    }
    const [elTop, elBottom] = elems;

    const mouseCallback = (event) => {
      elTop.style.height = Math.max(event.clientY - 75, 0) + 'px';
      elBottom.style.height = Math.max(window.innerHeight - event.clientY - 75, 0) + 'px';
    };

    if (needToShow) {
      elTop.style.visibility = 'visible';
      elBottom.style.visibility = 'visible';

      document.addEventListener('mousemove', mouseCallback);
    } else {
      elTop.style.visibility = 'hidden';
      elBottom.style.visibility = 'hidden';
      document.removeEventListener('mousemove', mouseCallback);
    }
  },
  [ADJUSTMENTS.SATURATION]: (type) => {
    if (!type || ['dark-contrast', 'light-contrast'].includes(type)) {
      document.getElementsByTagName('html')[0].style.filter = `unset`;
      return;
    }
    if (type === 'high-contrast') {
      const contrastValue = 135;

      document.getElementsByTagName('html')[0].style.filter = `contrast(${contrastValue}%)`;

      return;
    }

    let saturationValue;
    if (type === 'low') {
      saturationValue = 0.5;
    }
    if (type === 'high') {
      saturationValue = '200%';
    }
    if (type === 'mono') {
      saturationValue = 0;
    }

    document.getElementsByTagName('html')[0].style.filter = `saturate(${saturationValue})`;
  },
  [ADJUSTMENTS.MUTE_SOUNDS]: (isMuted = false) => {
    function toggleMute(elem) {
      if (isMuted) {
        elem.muted = true;
        elem.pause();
      } else {
        elem.muted = false;
        // elem.play();
      }
    }

    [...document.querySelectorAll('audio, video')].forEach(elem => toggleMute(elem));
  },
  [ADJUSTMENTS.FONT_SIZE]: value => applyTextChange(ADJUSTMENTS.FONT_SIZE, value),
  [ADJUSTMENTS.LETTER_SPACING]: value => applyTextChange(ADJUSTMENTS.LETTER_SPACING, value),
  [ADJUSTMENTS.LINE_SPACING]: value => applyTextChange(ADJUSTMENTS.LINE_SPACING, value),
  [ADJUSTMENTS.TEXT_MAGNIFIER]: (isActive) => {
    if (isActive) {
      startMagnifierObserver();
    } else {
      stopMagnifierObserver();
      const DOMTextNodes = getTextContainingElements(document.body);
      DOMTextNodes.forEach((node) => {
        node.removeEventListener('mouseenter', textMagnifierEventHandler);
        node.removeEventListener('mouseleave', textMagnifierEventHandler);
      });
      const tooltip = document.getElementsByClassName('clym-tooltip')[0];
      if (tooltip) {
        tooltip.remove();
      }
    }
  },
  [ADJUSTMENTS.READING_MODE]: ({ isActive, onCloseClick }) => {
    const wrapperId = 'clym-readingmode-wrapper';
    const closeId = 'clym-readingmode-wrapper-close';

    const existingWrapper = document.getElementById(wrapperId);
    if (existingWrapper) {
      existingWrapper.remove();
    }

    if (isActive) {
      const textElementsTree = cloneSubtreeWithTextElements(document.body);
      let wrapperDiv = document.createElement('div');
      wrapperDiv.id = wrapperId;
      wrapperDiv.appendChild(textElementsTree);

      document.body.appendChild(wrapperDiv);

      let closeElement = document.createElement('div');
      closeElement.id = closeId;
      closeElement.textContent = '✕';
      closeElement.setAttribute('title', 'Exit reading mode');
      closeElement.setAttribute('tabIndex', 0);
      closeElement.onclick = () => {
        useAccessibilityStore.getState().setAdjustment(ADJUSTMENTS.READING_MODE, undefined);
      };
      closeElement.onkeyup = (e) => {
        if (e.key === 'Enter') {
          useAccessibilityStore.getState().setAdjustment(ADJUSTMENTS.READING_MODE, undefined);
        }
      };

      const container = document.getElementById('clym-readingmode-container');
      container.prepend(closeElement);
    } else {
      const wrapperDiv = document.getElementById('clym-readingmode-wrapper');
      if (wrapperDiv) {
        wrapperDiv.remove();
      }
    }
  },
  [ADJUSTMENTS.KEYBOARD_NAVIGATION]: (isActive) => {
    if (isActive) {
      KeybindingManager.addBinding('m', keyBindingsActions['m']);
      KeybindingManager.addBinding('h', keyBindingsActions['h']);
      KeybindingManager.addBinding('f', keyBindingsActions['f']);
      KeybindingManager.addBinding('b', keyBindingsActions['b']);
      KeybindingManager.addBinding('g', keyBindingsActions['g']);

      categorizeNavigableElements(document.body);
    } else {
      KeybindingManager.removeBinding('m', keyBindingsActions['m']);
      KeybindingManager.removeBinding('h', keyBindingsActions['h']);
      KeybindingManager.removeBinding('f', keyBindingsActions['f']);
      KeybindingManager.removeBinding('b', keyBindingsActions['b']);
      KeybindingManager.removeBinding('g', keyBindingsActions['g']);
    }
  }
};

export class A11yHandler {
  constructor(config) {
    const defaultState = {
      profile: '',
      adjustments: {}
    };

    this.state = initialState ? initialState : defaultState;
    this.bodyClassName = '';
    this.appliedBodyProps = [];
    this.head = window.document.head || document.getElementsByTagName('head');

    this.setAdjustmentsByConfig(convertStateToAdjConfig(this.state));
    this.addHeadStyleTagWithCss(
      `
    @font-face {
      font-family: 'OpenDyslexic';
      font-weight: 400;
      font-style: normal;
      src: url("https://widget-next.clym-sdk.net/latest/fonts/opendyslexic/OpenDyslexic-Regular.woff2") format('woff2');
    }
    @font-face {
      font-family: 'OpenDyslexic';
      font-weight: 700;
      font-style: normal;
      src: url("https://widget-next.clym-sdk.net/latest/fonts/opendyslexic/OpenDyslexic-Bold.woff2") format('woff2');
    }

    #clym-reading-guide {
      display:block !important;
      position:fixed;
      top:0;
      left:auto;
      right:auto;
      width:90%;
      max-width:500px;
      height:12px;
      margin:auto;
      z-index:10000000000000000000000;
      background: ${config.brandColor};
      border:solid 3px #1f2533;
      pointer-events:none;
      border-radius:2px;
      zoom: 1 !important;
    }

    .clym-reading-mask {
      display: block !important;
      position: fixed;
      left:0;
      right:0;
      top:0;
      margin:auto;
      width:100%;
      pointer-events:none;
      z-index:10000000000000000000000;
      background-color: rgba(0,0,0,.5);
      zoom: 1 !important;
    }
    .clym-reading-mask-top {
      top:0;
      bottom:auto;
    }
    .clym-reading-mask-bottom {
      top:auto;
      bottom:0;
    }

    body span.clym-tooltip {
      position: absolute;
      line-height: 1.2;
      padding: 8px 17px;
      max-width: 500px;
      font-family: Arial,Helvetica,sans-serif !important;
      font-size: 13px;
      border-radius: 5px;
      color: #fff;
      pointer-events: none;
      user-select: none;
      background-color: rgba(0,0,0,.8);
      z-index: 10000000000000000000000;
    }

    body *.clym-focus-visible {
      outline: 3px solid #146ff8 !important;
      outline-offset: 3px !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    body *.clym-inner-focus {
      outline-offset: -3px !important;
      border: solid 3px #146ff8 !important;
    }

    @media only screen and (max-width: 600px) {
      body span.clym-tooltip {
        display: none !important;
      }
      body .clym-reading-mask {
        display: none !important;
      }

      body #clym-reading-guide {
        display: none !important;
      }
    }
    `,
      'clym-initial-styles'
    );
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = {
      ...newState
    };
    useAccessibilityStore.setState(newState);
    return this.getState();
  }

  setAdjustment(prop, params) {
    if (!prop) return;
    if (prop === ADJUSTMENTS.TEXT_ALIGNMENT) {
      this.applyBodyClassName(ADJUSTMENTS.TEXT_ALIGNMENT, params);
    }
    if (prop === ADJUSTMENTS.SATURATION) {
      this.applyGlobalStyle(ADJUSTMENTS.SATURATION, params);
      this.applyBodyClassName(ADJUSTMENTS.SATURATION, params);
    }
    if (prop === ADJUSTMENTS.CURSOR) {
      this.applyBodyClassName(ADJUSTMENTS.CURSOR, params);
    }
    if (prop === ADJUSTMENTS.HEADINGS_COLOR) {
      this.applyBodyClassName(ADJUSTMENTS.HEADINGS_COLOR, params);
    }
    if (prop === ADJUSTMENTS.BACKGROUND_COLOR) {
      this.applyBodyClassName(ADJUSTMENTS.BACKGROUND_COLOR, params);
    }
    if (prop === ADJUSTMENTS.CONTENT_COLOR) {
      this.applyBodyClassName(ADJUSTMENTS.CONTENT_COLOR, params);
    }
    if (prop === ADJUSTMENTS.READING_MODE) {
      this.applyBodyClassName(ADJUSTMENTS.READING_MODE, params);
      this.applyGlobalStyle(ADJUSTMENTS.READING_MODE, {
        isActive: params,
        onCloseClick: () => {
          this.setAdjustment(ADJUSTMENTS.READING_MODE, false);
        }
      });
    }
    if (prop === ADJUSTMENTS.HIGHLIGHT_TITLES) {
      this.applyBodyClassName(ADJUSTMENTS.HIGHLIGHT_TITLES);
    }
    if (prop === ADJUSTMENTS.HIGHLIGHT_LINKS) {
      this.applyBodyClassName(ADJUSTMENTS.HIGHLIGHT_LINKS);
    }
    if (prop === ADJUSTMENTS.HIDE_IMAGES) {
      this.applyBodyClassName(ADJUSTMENTS.HIDE_IMAGES);
    }
    if (prop === ADJUSTMENTS.MUTE_SOUNDS) {
      this.applyGlobalStyle(ADJUSTMENTS.MUTE_SOUNDS, params);
    }
    if (prop === ADJUSTMENTS.STOP_ANIMATIONS) {
      this.applyBodyClassName(ADJUSTMENTS.STOP_ANIMATIONS);
    }
    if (prop === ADJUSTMENTS.READING_GUIDE) {
      this.applyGlobalStyle(ADJUSTMENTS.READING_GUIDE, params);
    }
    if (prop === ADJUSTMENTS.READING_MASK) {
      this.applyGlobalStyle(ADJUSTMENTS.READING_MASK, params);
    }
    if (prop === ADJUSTMENTS.FONT_CHANGE) {
      this.applyBodyClassName(ADJUSTMENTS.FONT_CHANGE, params);
    }
    if (prop === ADJUSTMENTS.FONT_SIZE) {
      this.applyGlobalStyle(ADJUSTMENTS.FONT_SIZE, params);
    }
    if (prop === ADJUSTMENTS.LETTER_SPACING) {
      this.applyGlobalStyle(ADJUSTMENTS.LETTER_SPACING, params);
    }
    if (prop === ADJUSTMENTS.LINE_SPACING) {
      this.applyGlobalStyle(ADJUSTMENTS.LINE_SPACING, params);
    }
    if (prop === ADJUSTMENTS.TEXT_MAGNIFIER) {
      this.applyGlobalStyle(ADJUSTMENTS.TEXT_MAGNIFIER, params);
    }
    if (prop === ADJUSTMENTS.KEYBOARD_NAVIGATION) {
      this.applyGlobalStyle(ADJUSTMENTS.KEYBOARD_NAVIGATION, params);
    }
    if (prop === ADJUSTMENTS.BRIGHTNESS) {
      this.applyBodyClassName(ADJUSTMENTS.BRIGHTNESS, params);
    }

    const newState = {
      ...this.state,
      adjustments: {
        ...this.state.adjustments
      }
    };

    if (params) {
      newState.adjustments[prop] = params;
    } else {
      delete newState.adjustments[prop];
    }

    this.setState(newState);
  }

  setAdjustmentsByConfig(config) {
    config.map((adjustments) => {
      const { prop, params } = adjustments;
      this.setAdjustment(prop, params);
    });
  }

  setProfile(nextProfile) {
    if (!nextProfile || !PROFILES.hasOwnProperty(nextProfile) || !adjustmentsConfigByProfile.hasOwnProperty(nextProfile)) {
      return;
    }

    let config = [];
    const prevProfile = this.state.profile;

    if (prevProfile) {
      config = adjustmentsConfigByProfile[prevProfile].resetConfig;
    }

    const setConfig = getUniqueListBy([...config, ...adjustmentsConfigByProfile[nextProfile].setConfig], 'prop');

    this.setAdjustmentsByConfig(setConfig);

    this.setState({
      ...this.state,
      profile: nextProfile
    });
  }

  unsetProfile(profile, resetConfig) {
    const config = resetConfig || adjustmentsConfigByProfile[profile].resetConfig;

    this.setAdjustmentsByConfig(config);

    this.setState({
      adjustments: {
        ...this.state.adjustments
      }
    });
  }

  addHeadStyleTagWithCss(css, id) {
    if (!css) return;

    this.head.insertAdjacentHTML('beforeend', `<style id='${id || ''}'>${css}</style>`);
  }

  triggerChange(data) {
    const { actionType, payload } = data;

    if (!actionType || !payload) return;

    if (actionType === ACTION_TYPES.PROFILE) {
      const { profile } = payload;
      if (this.state.profile === profile) {
        this.unsetProfile(profile);
      } else {
        this.setProfile(profile);
      }
    } else if (actionType === ACTION_TYPES.ADJUSTMENT) {
      const { prop, params } = payload;
      this.setAdjustment(prop, params);

      this.getState();
    }
  }

  applyGlobalStyle(prop, value) {
    if (!prop && !propGlobalStyleMap.hasOwnProperty(prop)) return;

    const applyPropGlobalStyle = propGlobalStyleMap[prop];

    applyPropGlobalStyle(value);
  }

  applyBodyClassName(prop, value) {
    if (!prop && !propClassNamesMap.hasOwnProperty(prop)) return;

    const getPropCss = propCssMap[prop];
    const propCss = getPropCss(value);
    const styleTagId = 'style' + '--' + prop + (value ? '--' + value : '');
    const styleTags = document.getElementsByTagName('style');
    const existedStyleTag = [...styleTags].find(tag => tag.id.includes(prop));

    if (!existedStyleTag) {
      this.addHeadStyleTagWithCss(propCss, styleTagId);
    } else if (value) {
      existedStyleTag.remove();
      this.addHeadStyleTagWithCss(propCss, styleTagId);
    }

    const toggleClass = condition => window.document.body.classList.toggle(`${propClassNamesMap[prop]}`, condition);

    const shouldToggle = [
      ADJUSTMENTS.HIDE_IMAGES,
      ADJUSTMENTS.MUTE_SOUNDS,
      ADJUSTMENTS.HIGHLIGHT_TITLES,
      ADJUSTMENTS.HIGHLIGHT_LINKS,
      ADJUSTMENTS.STOP_ANIMATIONS
    ].includes(prop);

    if (shouldToggle) {
      toggleClass();
    } else {
      toggleClass(!!value);
    }
  }
}

function applyTextChange(type, value) {
  const DOMTextNodes = getTextContainingElements(document.body);

  DOMTextNodes.forEach((el, index) => {
    if (type === ADJUSTMENTS.FONT_SIZE) {
      if (!el.getAttribute('data-initial-font-size')) {
        el.setAttribute('data-initial-font-size', window.getComputedStyle(el, null).getPropertyValue('font-size'));
      }

      const initialFontSize = el.getAttribute('data-initial-font-size');

      if (value) {
        var newFontSize = parseFloat(initialFontSize) * ((10 + value) / 10 || 1);

        el.style.fontSize = newFontSize + 'px';
      } else {
        el.style.fontSize = parseFloat(initialFontSize) + 'px';
        el.removeAttribute('data-initial-font-size');
      }
    }
    if (type === ADJUSTMENTS.LETTER_SPACING) {
      if (!el.getAttribute('data-initial-letter-spacing')) {
        el.setAttribute('data-initial-letter-spacing', window.getComputedStyle(el, null).getPropertyValue('letter-spacing'));
      }
      const initialSpacingValue = el.getAttribute('data-initial-letter-spacing');

      const initialSpacingNumberValue = isNaN(initialSpacingValue) ? 1 : parseFloat(initialSpacingValue);

      if (value) {
        var newSpacing = parseFloat(initialSpacingNumberValue) * ((10 + value) / 10 || 1);
        el.style.letterSpacing = newSpacing + 'px';
      } else {
        el.style.letterSpacing = initialSpacingValue;
        el.removeAttribute('data-initial-letter-spacing');
      }
    }
    if (type === ADJUSTMENTS.LINE_SPACING) {
      if (!el.getAttribute('data-initial-line-spacing')) {
        el.setAttribute('data-initial-line-spacing', window.getComputedStyle(el, null).getPropertyValue('line-height'));
      }
      const initialHeight = el.getAttribute('data-initial-line-spacing');

      if (value) {
        var newHeight = parseFloat(initialHeight) * ((10 + value) / 10 || 1);
        el.style.lineHeight = newHeight + 'px';
      } else {
        el.style.lineHeight = initialHeight;
        el.removeAttribute('data-initial-line-spacing');
      }
    }
  });
}

var selectorExcludingClymElements = ':not(#clym-reading-guide):not(.clym-reading-mask):not(.clym-tooltip):not(.MuiSlider-root):not(.MuiSlider-rail):not(.MuiSlider-track):not(.MuiPopover-root):not(.MuiBackdrop-root):not(.MuiDialog-container):not(.MuiInputBase-input):not(.MuiInputBase-root):not(.MuiOutlinedInput-notchedOutline):not(.MuiSelect-icon):not(.MuiSelect-select .MuiTypography-root):not(.clym-contrast-exclude):not(.clym-contrast-exclude > *)';

function textMagnifierEventHandler(event) {
  event.preventDefault();

  if (event.type === 'mouseenter') {
    const tooltip = document.createElement('span');
    tooltip.classList.add('clym-tooltip');
    tooltip.innerText = event.target.innerText;
    tooltip.style.top = event.pageY + 'px';
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.fontSize = '30px';
    document.body.appendChild(tooltip);
  }
  if (event.type === 'mouseleave') {
    const tooltip = document.getElementsByClassName('clym-tooltip')[0];
    if (tooltip) {
      tooltip.remove();
    }
  }
}

let observer;

const attachTextMagnifierListeners = () => {
  const DOMTextNodes = getTextContainingElements(document.body);
  DOMTextNodes.forEach((node) => {
    node.removeEventListener('mouseenter', textMagnifierEventHandler);
    node.removeEventListener('mouseleave', textMagnifierEventHandler);
    node.addEventListener('mouseenter', textMagnifierEventHandler);
    node.addEventListener('mouseleave', textMagnifierEventHandler);
  });
};

export const startMagnifierObserver = () => {
  observer?.disconnect();

  observer = new MutationObserver(() => {
    attachTextMagnifierListeners();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  attachTextMagnifierListeners();
};

export const stopMagnifierObserver = () => {
  observer?.disconnect();
  observer = null;
};

function getUniqueListBy(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()];
}

function convertStateToAdjConfig(state) {
  if (!state.adjustments) return [];

  return Object.keys(state.adjustments).map((key) => {
    return {
      prop: key,
      params: state.adjustments[key]
    };
  });
}

function cloneSubtreeWithTextElements(node) {
  if (!node) return null;

  // If the node is a text node and it's not just whitespace, clone it
  if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
    return node.cloneNode();
  }

  // If the node is an element and not a <script> tag, check its children
  if (node.nodeType === Node.ELEMENT_NODE) {
    // List of tags to skip
    const skipTags = ['SCRIPT', 'INPUT', 'TEXTAREA', 'BUTTON', 'FORM'];
    if (skipTags.includes(node.tagName)) {
      return null;
    }

    // If it's an empty <li> tag or has role="tab", skip it
    if (node.tagName === 'LI' && (node.textContent.trim() === '' || node.getAttribute('role') === 'tab')) {
      return null;
    }

    // Check for <a> tags with href attributes pointing to anchors or role="button"
    if (
      node.tagName === 'A'
      && ((node.getAttribute('href') && node.getAttribute('href').startsWith('#'))
      || (node.getAttribute('href') && node.getAttribute('href').trim() === '')
      || node.getAttribute('role') === 'button')
    ) {
      return null;
    }

    // Create a new node. If it's the root and is the body, make it a div. Otherwise, clone the node.
    let clonedNode;
    if (node.tagName === 'BODY') {
      clonedNode = document.createElement('div');
    } else {
      clonedNode = node.cloneNode();
    }
    let hasTextualChildren = false;

    // Recursively process children
    for (let child of node.childNodes) {
      let clonedChild = cloneSubtreeWithTextElements(child);
      if (clonedChild) {
        hasTextualChildren = true;
        clonedNode.appendChild(clonedChild);
      }
    }

    // If this node or any of its descendants have text, return it
    if (hasTextualChildren || (node.textContent.trim() !== '' && clonedNode.childNodes.length > 0)) {
      // Remove class and id attributes
      clonedNode.removeAttribute('class');
      clonedNode.removeAttribute('id');
      clonedNode.removeAttribute('style');

      // If the node is the body, wrap the clonedNode in a new div instead of returning the body itself
      if (node.tagName === 'BODY') {
        let wrapperDiv = document.createElement('div');
        wrapperDiv.id = 'clym-readingmode-container';
        wrapperDiv.appendChild(clonedNode);
        return wrapperDiv;
      }

      return clonedNode;
    } else {
      return null;
    }
  }
  return null;
}

function getTextContainingElements(node) {
  let textElements = [];

  // Base condition
  if (!node) {
    return [];
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    // Check if the element has a direct text child node
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent.trim() !== '') {
        textElements.push(node);
        break; // We've found a text node, so no need to continue checking other child nodes
      }
    }
  }

  // Recurse for each child of the current node
  for (let i = 0; i < node.childNodes.length; i++) {
    textElements = textElements.concat(getTextContainingElements(node.childNodes[i]));
  }

  return textElements;
}

function categorizeNavigableElements(element) {
  categorizeElement(element);

  for (const child of element.children) {
    categorizeNavigableElements(child);
  }
}

var elementGroups = {
  menus: [],
  headings: [],
  forms: [],
  buttons: [],
  graphics: []
};

function categorizeElement(element) {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'nav') {
    elementGroups.menus.push(element);
  }
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    elementGroups.headings.push(element);
  }
  if (tagName === 'form') {
    elementGroups.forms.push(element);
  }
  if (tagName === 'button') {
    elementGroups.buttons.push(element);
  }
  if (['img', 'video'].includes(tagName)) {
    elementGroups.graphics.push(element);
  }
}

function navigateGroup(groupName, isDirectionForward) {
  const group = elementGroups[groupName];
  const currentIndex = group.indexOf(document.activeElement);
  let [firstElement] = group;

  if (currentIndex !== -1) {
    let newIndex;
    if (isDirectionForward) {
      newIndex = (currentIndex + 1) % group.length;
    } else {
      newIndex = (currentIndex - 1 + group.length) % group.length;
    }
    setFocusForElement(group[newIndex]);
  } else {
    setFocusForElement(firstElement);
  }
}

function setFocusForElement(element) {
  if (!element) return;

  const dataPrevTabIndexAttr = 'data-prev-tabindex';

  element.classList.add('clym-focus-visible');
  if (element.tagName.toLowerCase() === 'img') {
    element.classList.add('clym-inner-focus');
  }
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex && tabIndex !== '-1') {
    element.setAttribute(dataPrevTabIndexAttr, tabIndex);
  }
  element.setAttribute('tabindex', '-1');
  element.focus();
  element.addEventListener(
    'focusout',
    (event) => {
      if (!element && !element.classList.contains('clym-focus-visible')) return;
      element.classList.remove('clym-focus-visible', 'clym-inner-focus');
      const prevTabIndex = element.getAttribute(dataPrevTabIndexAttr);
      if (prevTabIndex) {
        element.setAttribute('tabindex', prevTabIndex);
        element.removeAttribute(dataPrevTabIndexAttr);
      } else {
        element.removeAttribute('tabindex');
      }
    },
    { once: true }
  );
}

const KeybindingManager = {
  bindings: [],

  // Add a new keybinding
  addBinding(keyCombo, action) {
    const binding = {
      keyCombo,
      action
    };

    this.bindings.push(binding);
    window.addEventListener('keydown', this.handleKeydown);
  },

  removeBinding(keyCombo, action) {
    this.bindings = this.bindings.filter(binding => !(binding.keyCombo === keyCombo && binding.action === action));

    // Remove the event listener if there are no more bindings
    if (this.bindings.length === 0) {
      window.removeEventListener('keydown', this.handleKeydown);
    }
  },

  handleKeydown(event) {
    const key = event.key.toLowerCase();
    const isLowerCaseLetter = /[a-z]/.test(event.key);
    const modifiers = [];

    const keyCombo = [...modifiers, key].join('+');
    // Find and execute the action for the matching key combo
    const binding = KeybindingManager.bindings.find(binding => binding.keyCombo === keyCombo);

    if (binding) {
      binding.action(isLowerCaseLetter);
      event.preventDefault();
    }
  }
};

var keyBindingsActions = {
  m: (isLowerCase) => {
    navigateGroup('menus', isLowerCase);
  },
  h: (isLowerCase) => {
    navigateGroup('headings', isLowerCase);
  },
  f: (isLowerCase) => {
    navigateGroup('forms', isLowerCase);
  },
  b: (isLowerCase) => {
    navigateGroup('buttons', isLowerCase);
  },
  g: (isLowerCase) => {
    navigateGroup('graphics', isLowerCase);
  }
};
