import { PDF_RESOURCE_LOADING_WAIT, PDF_TIMEOUT, REPORT_FORMATS, REPORT_TYPES } from '@/constants/report';
import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { join } from 'path';
import { getAssignedPort } from '../main';
import { timeoutFn } from './utils';

class ReportLib {
  constructor(type, searchParams, format = REPORT_FORMATS.PDF, headerFooterOpts = null) {
    if (!Object.values(REPORT_TYPES).includes(type)) {
      throw new Error('Invalid PDF type');
    }
    this.type = type;
    this.format = format;
    this.port = getAssignedPort() || 3000;
    this.searchParams = searchParams;
    this.window = null;
    this.headerFooterOpts = headerFooterOpts;
  }

  /**
   * Initializes the window
   */
  async #initWindow() {
    const window = new BrowserWindow({
      width: 794,
      height: 1134,
      show: false,
      webPreferences: { offscreen: true, webSecurity: false, preload: join(__dirname, '../preload/index.js'), nodeIntegration: true }
    });
    const searchParams = new URLSearchParams({
      type: this.type,
      format: this.format,
      ...this.searchParams
    });
    const url = `http://localhost:${this.port}/export-report?${searchParams.toString()}`;
    window.loadURL(url);
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
   * generates the pdf buffer, and passes it to the callback fn
   * @param {() => {}} cb
   */
  async #getPdfBuffer(cb = () => {}) {
    const buffer = await this.window.webContents.printToPDF({
      landscape: false,
      printBackground: true,
      margins: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
      },
      pageSize: 'A4',
      preferCSSPageSize: true,
      ...(this.headerFooterOpts
        ? {
            displayHeaderFooter: true,
            footerTemplate:
              this.headerFooterOpts?.footer?.template
              || `<div style="font-size: 10px; width:100%; margin:0 64px; font-family:Arial, sans-serif; box-sizing:border-box; color:#666; position:relative; display:flex; align-items:center; justify-content:space-between; gap:5px;">
                    <div style="display:flex; align-items:center; gap:1ch">
                      <img style="height:14px;" src="data:image/png;base64,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" />
                      <p style="line-height: 1; font-weight: 500; color: #000;">powered by</p>
                      <img style="height:12px;" src="data:image/png;base64,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" />
                    </div>
                    <p>Page <span class="pageNumber"></span> of <span class="totalPages"></span></p>
                  </div>`,
            headerTemplate:
              this.headerFooterOpts?.header?.template
              || `<div style="font-size:10px; width:100%; margin:0 64px; font-family:Arial, sans-serif; box-sizing:border-box; color:#666; position:relative; display:flex; align-items:center; justify-content:space-between; gap:5px; border-bottom: 1px solid #e4e7ec;">
                    <p style="font-size:12px;">${this.headerFooterOpts?.header.title}</p>
                    <p><span class="date"></span></p>
                  </div>`
          }
        : {})
    });
    cb(buffer);
  }

  async #getHtmlBuffer(cb = () => {}) {
    const string = await this.window.webContents.executeJavaScript('document.documentElement.outerHTML');
    const buffer = Buffer.from(string, 'utf-8');
    cb(buffer);
  }

  /**
   * starts the pdf generation process
   * open and initializes a new window, and attaches a listener to it
   * when the listener is fired, the buffer is generated
   * the whole function has a timeout as well
   * cleans up the window resources at the end
   */
  async start() {
    let bufferFn, wait;
    if (this.format === REPORT_FORMATS.PDF) {
      bufferFn = this.#getPdfBuffer.bind(this);
      wait = PDF_RESOURCE_LOADING_WAIT;
    } else if (this.format === REPORT_FORMATS.HTML) {
      bufferFn = this.#getHtmlBuffer.bind(this);
    }
    const attachListener = async (listener, wait = PDF_RESOURCE_LOADING_WAIT) => {
      return new Promise((resolve, reject) => {
        try {
          this.window.webContents.on(listener, async () => {
            if (wait > 0) {
              setTimeout(async () => {
                await bufferFn(resolve);
              }, wait);
            } else {
              await bufferFn(resolve);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    };
    await this.#initWindow();
    const promise = attachListener('did-finish-load');
    try {
      const res = await timeoutFn(promise, PDF_TIMEOUT);
      return res;
    } catch (e) {
      log.error('export failed');
      log.debug(e);
    } finally {
      await this.#cleanup();
    }
  }
}

export default ReportLib;
