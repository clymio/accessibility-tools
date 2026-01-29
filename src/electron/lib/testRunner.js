import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { getMainWindow } from '../main';
import AxeCoreLib from './axecore';
import { getModel } from './db';
import EnvironmentTestLib from './environmentTest';
import LandmarkRunner from './landmarkRunner';
import { timeoutFn } from './utils';

class TestRunner {
  /**
   * Construct a new TestRunner instance.
   * @param {string} testId - ID of the environment test
   */
  constructor(testId) {
    this.testId = testId;
    this.window = null;
    this.currentPage = null;
    this.mainWindow = getMainWindow();
  }

  /**
   * Cleans up any resources used by the TestRunner instance.
   */
  #cleanup() {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }

  /**
   * brings in the axe scripts and initializes the window
   * the window is also subscribe to the did-finish-load event, where the axe scripts are executed
   * on success, the resolve passed to the currentPage variable is called
   * on failure, the reject passed to the currentPage variable is called
   * at the end, the currentPage variable is set to null for the next run
   * the results are then forwarded to the axe-core lib
   */
  async #init() {
    const axeScript = await AxeCoreLib.getAxeScript();
    const window = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { offscreen: true, sandbox: true, webSecurity: false }
    });
    log.info('testing window created');
    window.webContents.on('did-finish-load', async () => {
      if (this.currentPage) {
        try {
          await window.webContents.executeJavaScript(this.#injectRemoveInnerHTMLFn());
          await window.webContents.executeJavaScript(this.#injectUniqueSelectorFn());
          await window.webContents.executeJavaScript(axeScript);

          await Promise.all([this.#handleManualTests(), this.#handleAutomatedTests()]);

          const landmarkRunner = new LandmarkRunner(this.window, this.currentPage.id, this.testId);
          await landmarkRunner.run();

          this.currentPage.resolve();
        } catch (error) {
          this.currentPage.reject(error);
        } finally {
          this.currentPage = null;
        }
      }
    });
    this.window = window;
  }

  /**
   * runs the test on a specific page.
   * the currentPage variable is provided an id, along with resolve and reject to be handled in the listener
   * @param {String} pageId the environment page object id
   */
  async #runTestOnPage(pageId) {
    log.info('running test on page:', pageId);
    const EnvironmentPage = getModel('environmentPage'),
      EnvironmentTestPage = getModel('environmentTestPage');
    try {
      const page = await EnvironmentPage.findByPk(pageId, {
        attributes: ['id', 'path'],
        include: [
          {
            model: getModel('environment'),
            as: 'environment',
            attributes: ['id', 'url']
          },
          {
            model: getModel('testCaseEnvironmentTestPage'),
            as: 'test_cases',
            where: { environment_test_id: this.testId },
            attributes: ['id', 'status'],
            include: [
              {
                model: getModel('testCase'),
                as: 'test_case',
                attributes: ['id', 'selectors']
              }
            ]
          }
        ]
      });
      if (!page) {
        throw new Error('Page not found');
      }
      const manualTestCases = page.test_cases?.filter(testCase => testCase.status === 'MANUAL') || [];
      await EnvironmentTestPage.update(
        { start_date: new Date() },
        {
          where: {
            environment_page_id: pageId,
            environment_test_id: this.testId
          }
        }
      );

      return await new Promise((resolve, reject) => {
        this.currentPage = { id: page.id, tests: manualTestCases, resolve, reject };
        const url = `${page.environment.url}/${page.path}`;
        this.window.webContents.loadURL(url);
      });
    } catch (e) {
      log.error('Error running test on page', pageId);
      log.debug(e);
      const TestCaseEnvironmentTestPage = getModel('testCaseEnvironmentTestPage');
      await EnvironmentTestPage.update(
        { end_date: new Date() },
        {
          where: {
            environment_page_id: pageId,
            environment_test_id: this.testId
          }
        }
      );
      await TestCaseEnvironmentTestPage.update(
        { status: 'ERROR', end_date: new Date() },
        {
          where: {
            environment_page_id: pageId,
            environment_test_id: this.testId,
            status: 'IN_PROGRESS'
          }
        }
      );
      throw e;
    }
  }

  /**
   * runs the manual tests
   * @param {[]} tests the manual tests
   * @param {BrowserWindow} window the testing window
   */
  async #runManualTests(tests, window) {
    const result = {};
    const selectorTargetMap = new Map();
    const getRoot = async () => {
      if (selectorTargetMap.has('root')) {
        return selectorTargetMap.get('root');
      }
      const root = await window.webContents.executeJavaScript(
        `(async () => {
          try {
            return window.cleanElement(document.documentElement);
          } catch (e) {
            return null;
          }
        })()`
      );
      const rootItem = { html: root, selector: 'html', selectorUsed: 'html' };
      selectorTargetMap.set('root', rootItem);
      return rootItem;
    };
    for (const test of tests) {
      const { selectors } = test.test_case;
      const testSelectorSet = new Set();
      result[test.id] = [];
      // push the root if there are no selectors
      if (!selectors || selectors.length === 0) {
        if (testSelectorSet.has('root')) continue;
        const root = await getRoot();
        result[test.id].push(root);
        testSelectorSet.add('root');
        continue;
      }
      for (let selector of selectors) {
        // get the same targets for the same selector if they exist in the map
        selector = selector.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        if (selectorTargetMap.has(selector)) {
          selectorTargetMap.get(selector).forEach((t) => {
            if (!testSelectorSet.has(t.html)) {
              result[test.id].push(t);
              testSelectorSet.add(t.html);
            }
          });
          continue;
        }
        // find the elements using the selector
        let targets = [];
        if (selector !== 'body') {
          let foundTargets = [];
          try {
            foundTargets = await window.webContents.executeJavaScript(
              `(async () => {
                try {
                  const elements = Array.from(document.querySelectorAll("${selector}"));
                  return elements.map(e => ({ html: window.cleanElement(e), selector: window.getUniqueSelector(e), selectorUsed: "${selector}" }));
                } catch (e) {
                  return [];
                }
              })()`
            );
          } catch (e) {
            log.error('Error running selector', selector);
          }
          if (foundTargets && foundTargets.length > 0) {
            targets.push(...foundTargets);
          }
        }
        // add the root element to the list of targets if no targets were found
        if (targets.length === 0) {
          const root = await getRoot();
          targets.push(root);
        }
        selectorTargetMap.set(selector, targets);
        targets.forEach((t) => {
          if (!testSelectorSet.has(t.html)) {
            result[test.id].push(t);
            testSelectorSet.add(t.html);
          }
        });
      }
    }

    Object.keys(result).forEach((key) => {
      result[key] = Array.from(result[key]);
    });

    return result;
  }

  /**
   * runs and processes the manual tests
   */
  async #handleManualTests() {
    if (!this.currentPage.tests || this.currentPage.tests.length === 0) {
      return;
    }
    const result = await this.#runManualTests(this.currentPage.tests, this.window);
    const TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget');
    const dataToCreate = [];
    for (const [testId, targets] of Object.entries(result)) {
      for (const target of targets) {
        dataToCreate.push({ test_case_page_id: testId, html: target.html, selector: target.selector, status: 'MANUAL', selector_used: target.selectorUsed });
      }
    }
    await TestCaseEnvironmentTestPageTarget.bulkCreate(dataToCreate);
  }

  /**
   * runs and processes the automated tests
   */
  async #handleAutomatedTests() {
    const runScript = await AxeCoreLib.getRunScript();
    const res = await this.window.webContents.executeJavaScript(runScript);
    return await AxeCoreLib.handleResult({
      results: res,
      environment_page_id: this.currentPage.id,
      environment_test_id: this.testId
    });
  }

  /**
   * Executes the test run for the current TestRunner instance.
   * Initializes the testing environment, retrieves the associated environment test, and runs tests on each page associated with the test.
   * Each page test has a timeout of 30 seconds.
   * Updates the test status to 'TEST_COMPLETED' if successful, or 'TEST_FAILED' if any error occurs.
   * Logs any errors encountered during the test execution. Cleans up resources upon completion.
   * @throws Will throw an error if the environment test is not found or if all page tests fail.
   */
  async run() {
    await this.#init();
    const EnvironmentTest = getModel('environmentTest');

    try {
      const environmentTest = await EnvironmentTest.findByPk(this.testId, {
        include: [
          {
            model: getModel('environment'),
            as: 'environment',
            attributes: ['id', 'name', 'url']
          },
          {
            model: getModel('environmentPage'),
            as: 'structured_pages',
            attributes: ['id', 'path'],
            through: {
              attributes: []
            }
          },
          {
            model: getModel('environmentPage'),
            as: 'random_pages',
            attributes: ['id', 'path'],
            through: {
              attributes: []
            }
          }
        ]
      });
      if (!environmentTest) {
        throw new Error('environment test not found');
      }
      const pages = [...environmentTest.structured_pages, ...environmentTest.random_pages];
      let errorCount = 0;
      for (const page of pages) {
        try {
          const promise = this.#runTestOnPage(page.id);
          await timeoutFn(promise, 30000); // 30 second timeout
          this.mainWindow.send('environmentPage:onTestCompleted', { status: 'success', data: { test_id: this.testId, page_id: page.id } });
        } catch {
          log.error('test timed out on page:', page.id);
          errorCount++;
          this.mainWindow.send('environmentPage:onTestCompleted', { status: 'error', data: { test_id: this.testId, page_id: page.id } });
        }
      }
      if (errorCount === pages.length) {
        throw new Error('All tests failed!');
      }

      await EnvironmentTestLib.generateTestOccurrenceData({ id: this.testId });

      const needsManualCheck = await EnvironmentTestLib.doesTestNeedManualCheck({ id: this.testId });
      await EnvironmentTest.update(
        { end_date: new Date(), status: needsManualCheck ? 'TEST_COMPLETED' : 'COMPLETED' },
        {
          where: {
            id: this.testId
          }
        }
      );
      this.mainWindow.send('environmentTest:onTestCompleted', { status: 'success', data: { test_id: this.testId } });
    } catch (e) {
      log.error('Error running test: ', this.testId);
      log.debug(e);
      const needsManualCheck = await EnvironmentTestLib.doesTestNeedManualCheck({ id: this.testId });
      await EnvironmentTest.update(
        { end_date: new Date(), status: needsManualCheck ? 'TEST_FAILED' : 'FAILED' },
        {
          where: {
            id: this.testId
          }
        }
      );
      this.mainWindow.send('environmentTest:onTestCompleted', { status: 'error', data: { test_id: this.testId } });
    } finally {
      this.#cleanup();
      log.info('test finished');
    }
  }

  /**
   * used to inject the cleanElement function to the current window
   */
  #injectRemoveInnerHTMLFn() {
    return `(async () => {
      window.cleanElement = ${cleanElement.toString()};
    })()`;
  }

  /**
   * used to inject the getUniqueSelector function to the current window
   */
  #injectUniqueSelectorFn() {
    return `(async () => {
      window.getUniqueSelector = ${getUniqueSelector.toString()};
    })()`;
  }
}

/**
 * cleans the element
 * @param {Element} el the element
 * @returns the cleaned element
 */
function cleanElement(el) {
  const closingTagRegex = new RegExp(/<\/[^>]+>$/, 'gi');
  const cloneEl = el.cloneNode(false);
  if (cloneEl.tagName.toLowerCase() === 'html') {
    const attrs = Array.from(cloneEl.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');
    return `<html${attrs ? ' ' + attrs : ''}>`;
  }
  const text = el.textContent.trim() || '';
  if (text) {
    cloneEl.appendChild(document.createTextNode(text));
    return cloneEl.outerHTML;
  }
  return cloneEl.outerHTML.replace(closingTagRegex, '').trim();
}

/**
 * takes an element, and generates a unique selector for it
 * @param {Element} el the element
 * @returns the unique selector for the element
 */
function getUniqueSelector(el) {
  if (!(el instanceof Element)) return null;

  let path = [];

  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();

    const parent = el.parentNode;
    if (parent) {
      const siblings = Array.from(parent.children).filter(e => e.nodeName === el.nodeName);
      if (siblings.length > 1) {
        const index = Array.prototype.indexOf.call(parent.children, el) + 1;
        selector += ':nth-child(' + index + ')';
      }
    }

    path.unshift(selector);
    el = el.parentElement;
  }

  return path.join(' > ');
}

export default TestRunner;
