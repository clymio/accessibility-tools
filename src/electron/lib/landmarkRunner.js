import { BrowserWindow } from 'electron';
import { bulkUpdateColumn, getModel } from './db';

class LandmarkRunner {
  static landmarks = [];
  static landmarkSelectorMap = new Map();
  static tagMatchRegex = /^<\s*([a-zA-Z][a-zA-Z0-9-]*)\b/i;
  static roleMatchRegex = /\brole\s*=\s*(['"])(.*?)\1/i;

  /**
   * Creates a new LandmarkRunner instance
   * @param {BrowserWindow} window - The window
   * @param {string} page_id - The page id
   * @param {string} test_id - The test id
   * @returns {LandmarkRunner} - The new LandmarkRunner instance
   */
  constructor(window, page_id, test_id) {
    this.window = window;
    this.page_id = page_id;
    this.test_id = test_id;
  }

  /**
   * Initializes the landmark runner, fetching landmarks from the database, if not already initialized
   */
  async init() {
    if (LandmarkRunner.landmarks.length > 0) return;
    const SystemLandmark = getModel('systemLandmark');
    const landmarkData = await SystemLandmark.findAll({
      attributes: ['id', 'selectors']
    });
    if (landmarkData.length === 0) return;
    LandmarkRunner.landmarks = landmarkData.map(l => l.toJSON());
    for (const landmark of LandmarkRunner.landmarks) {
      for (const selector of landmark.selectors) {
        if (selector.startsWith('[role=')) {
          // extract role and prefix with ROLE_
          const closingBracketIndex = selector.indexOf(']');
          if (closingBracketIndex === -1) continue;
          const role = selector.substring(7, closingBracketIndex - 1);
          LandmarkRunner.landmarkSelectorMap.set(`ROLE_${role}`, landmark.id);
        } else {
          LandmarkRunner.landmarkSelectorMap.set(selector, landmark.id);
        }
      }
    }
  }

  /**
   * gets the test page targets, and associates landmarks to them.
   * The target unique selectors are like html > body > header > div:nth-child(1) > nav > ul > li > a
   * We primarily use this comparison to figure out if the target is a landmark, or a child of a landmark
   * As a backup, we also read the target html string (e.g. <div ... role="banner" ... >), extract the role attribute, and check if it is acting as a landmark
   * This function can only run if the targets data for the test page is already populated in the db
   */
  async run() {
    await this.init();
    const TestCaseEnvironmentTestPageTarget = getModel('testCaseEnvironmentTestPageTarget');
    const targets = await TestCaseEnvironmentTestPageTarget.findAll({
      include: [
        {
          model: getModel('testCaseEnvironmentTestPage'),
          as: 'test',
          where: {
            environment_page_id: this.page_id,
            environment_test_id: this.test_id
          },
          required: true
        }
      ]
    });
    if (targets.length === 0) {
      return;
    }
    const targetSelectorMap = new Map();
    const targetsWithLandmarkParents = [];
    const landmarkDataToUpdate = [];
    const childDataToUpdate = [];

    for (let target of targets) {
      target = target.toJSON();
      // generate unique selector for axe-core tests
      if (target.rule) {
        try {
          target.selector = await this.#generateUniqueClass(target.selector);
        } catch (e) {}
      }
      if (!target.selector) continue;
      let landmarkId = await this.#getLandmarkBySelector(target.selector);
      if (!landmarkId) {
        landmarkId = this.#getLandmarkByHtml(target.html);
      }
      // we found a landmark
      if (landmarkId) {
        targetSelectorMap.set(target.selector, target.id);
        landmarkDataToUpdate.push({
          id: target.id,
          value: landmarkId
        });
        continue;
      }
      // we check if the target has a parent landmark
      const parentSelector = this.#getParentLandmark(target.selector);
      if (parentSelector) {
        targetsWithLandmarkParents.push({ ...target, parentSelector });
      }
    }

    for (const target of targetsWithLandmarkParents) {
      // the element is not a landmark. We check if it is a child of a landmark
      const parentSelector = target.parentSelector;
      if (targetSelectorMap.has(parentSelector)) {
        childDataToUpdate.push({
          id: target.id,
          value: targetSelectorMap.get(parentSelector)
        });
      }
    }

    const promises = [];

    if (landmarkDataToUpdate.length > 0) {
      promises.push(bulkUpdateColumn(landmarkDataToUpdate, TestCaseEnvironmentTestPageTarget.tableName, 'system_landmark_id'));
    }

    if (childDataToUpdate.length > 0) {
      promises.push(bulkUpdateColumn(childDataToUpdate, TestCaseEnvironmentTestPageTarget.tableName, 'parent_landmark_id'));
    }

    await Promise.all(promises);
  }

  /**
   * Used to generate unique selectors for axe-core targets for comparisons
   * @param {string} selector the css selector
   * @returns a unique selector
   */
  async #generateUniqueClass(selector) {
    if (selector === 'html') return selector;
    let uniqueSelector = selector;
    try {
      uniqueSelector = await this.window.webContents.executeJavaScript(
        `(async () => {
            try {
              let selector = "${selector}";
              const element = document.querySelector(selector);
              return window.getUniqueSelector(element);
            } catch {
              return null;
            }
          })()`
      );
    } catch {}
    return uniqueSelector;
  }

  /**
   * uses the target's css selector to find a landmark in our map
   * @param {string} selector the css selector
   * @returns the landmark, if any
   */
  async #getLandmarkBySelector(selector) {
    if (!selector) return null;
    // if class ends with a landmark selector, we add it to the map
    const t = selector.split('>').map(t => t.trim()).filter(Boolean) || [];
    if (t.length === 0) return null;
    const elementTag = t[t.length - 1];
    if (LandmarkRunner.landmarkSelectorMap.has(elementTag)) {
      const landmarkId = LandmarkRunner.landmarkSelectorMap.get(elementTag);
      return landmarkId;
    }
    return null;
  }

  /**
   * uses the html string to find a landmark by element tag or role
   * @param {string} html the target html
   * @returns the landmark, if any
   */
  #getLandmarkByHtml(html) {
    if (!html) return null;
    let tag, role;
    const tagMatch = html.match(LandmarkRunner.tagMatchRegex);
    if (tagMatch) {
      tag = tagMatch[1];
    }
    if (tag) {
      if (LandmarkRunner.landmarkSelectorMap.has(tag)) {
        const landmarkId = LandmarkRunner.landmarkSelectorMap.get(tag);
        return landmarkId;
      }
    }
    const roleMatch = html.match(LandmarkRunner.roleMatchRegex);
    if (roleMatch) {
      role = roleMatch[2];
    }
    if (role) {
      const roleSelector = `ROLE_${role}`;
      if (LandmarkRunner.landmarkSelectorMap.has(roleSelector)) {
        const landmarkId = LandmarkRunner.landmarkSelectorMap.get(roleSelector);
        return landmarkId;
      }
    }
    return null;
  }

  /**
   * uses the target's selector the find the parent landmark at the closest level
   * @param {string} selector the css selector
   * @returns the parent landmark, if any
   */
  #getParentLandmark(selector) {
    if (!selector) return null;
    const parts = selector
      .split('>')
      .map(p => p.trim())
      .filter(Boolean);

    let lastMatchIndex = -1;

    parts.forEach((part, index) => {
      // Extract tag name (before any class, pseudo, or attribute)
      const tag = part.match(/^[a-zA-Z]+/)?.[0];

      if (LandmarkRunner.landmarkSelectorMap.has(tag)) {
        lastMatchIndex = index;
      }
    });

    if (lastMatchIndex === -1) return null;

    return parts.slice(0, lastMatchIndex + 1).join(' > ');
  }
}

export default LandmarkRunner;
