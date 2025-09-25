import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { SCREENSHOT_DEFAULT_HEIGHT, SCREENSHOT_DEFAULT_WIDTH } from '../../constants/app';
import { timeoutFn } from './utils';

class Screenshot {
  /**
   * Initializes a new instance of the Screenshot class.
   * @param {String} initURL The URL to take the screenshot of
   */
  constructor(initURL) {
    this.initURL = initURL;
    this.window = null;
  }

  /**
   * Initializes the window
   */
  #initWindow() {
    const window = new BrowserWindow({
      width: SCREENSHOT_DEFAULT_WIDTH,
      height: SCREENSHOT_DEFAULT_HEIGHT,
      show: false,
      webPreferences: { offscreen: true, sandbox: true, webSecurity: false }
    });
    window.loadURL(this.initURL);
    this.window = window;
  }

  /**
   * Closes the window and sets it to null if present
   */
  async #cleanup() {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }

  /**
   * captures a screenshot and sends the result to the callback function
   * @param {() => {}} cb callback function
   */
  async #captureScreenshot(cb) {
    if (!this.window || !this.window.webContents) throw new Error('No webContents found');
    const image = await this.window.webContents.capturePage();
    this.#cleanup();
    cb(image.toDataURL());
  }

  /**
   * Starts the screenshot capture process.
   * It tries to capture a screenshot of the page with dom-ready and a 2 second wait to finish resources loading and a 5 second timeout.
   * If the first attempt fails, it tries again with did-finish-load and no wait and a 10 second timeout.
   * @return {Promise<string>} resolves with the screenshot as a data URL
   */
  async start() {
    const attachListener = async (listener, wait = 2000) => {
      this.#initWindow(); // we need to init a new window for each listener for a fresh run
      return new Promise((resolve, reject) => {
        try {
          this.window.webContents.on(listener, async () => {
            if (wait > 0) {
              setTimeout(async () => {
                await this.#captureScreenshot(resolve);
              }, wait);
            } else {
              await this.#captureScreenshot(resolve);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    };

    const promise = attachListener('dom-ready', 2000); // 2 second wait to finish resources loading
    try {
      const res = await timeoutFn(promise, 5000); // 5 seconds wait
      return res;
    } catch (e) {
      this.#cleanup();
      log.warn('screenshot capture failed with "dom-ready" listener, trying "did-finish-load"...');
      try {
        const promise = attachListener('did-finish-load', 0);
        const res = await timeoutFn(promise, 10000); // 10 seconds wait
        log.info('screenshot captured with "did-finish-load" listener');
        return res;
      } catch (e) {
        log.error('screenshot capture failed');
        log.debug(e);
      }
    }
  }
}

export default Screenshot;
