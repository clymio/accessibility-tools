import { CRAWL_DEPTH, MAX_TIME_TO_CRAWL } from '@/constants/app';
import axios from 'axios';
import { BrowserWindow, session } from 'electron';
import { parseString } from 'xml2js';

const ASSET_TYPES = ['image', 'font', 'video', 'media', 'stylesheet', 'websocket'];
const BLOCKED_URLS = ['doubleclick.net', 'facebook.net', 'js.hs-scripts.com'];

const filter = {
  urls: ['*://*/*'] // Matches all URLs
};

class Spider {
  /**
   *
   * @param {String} initURL the initial URL to start crawling
   * @param {Number} depth the maximum depth of the crawl
   */
  constructor(initURL, depth = CRAWL_DEPTH) {
    this.initURL = initURL;
    this.depth = depth;
    this.urlObj = null;
    this.isCompleted = false;
    this.window = null;
    try {
      this.urlObj = new URL(initURL);
    } catch {
      console.error('Invalid URL:', initURL);
      throw new Error('Invalid URL');
    }
  }

  /**
   *
   * @returns the urls
   */
  async start() {
    let links = [];
    const sitemapUrl = await this.#getSitemapUrl(this.initURL);
    if (sitemapUrl) {
      links = await this.#getUrlsFromSitemapUrl(sitemapUrl);
    }
    if (links.length > 0) {
      links = this.#sortUrlsByDepth(links);
    } else {
      links = await this.#crawl(this.initURL, this.depth);
    }
    this.isCompleted = true;
    if (links.length === 0) {
      return [this.initURL];
    }
    return links;
  }

  #createWindow() {
    const window = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { offscreen: true, sandbox: true, webSecurity: false, session: session.fromPartition(this.urlObj.hostname) }
    });
    window.loadURL(this.initURL);
    window.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
      const type = details.resourceType,
        url = details.url;
      if (ASSET_TYPES.indexOf(type) === 1) {
        return callback({ cancel: true }); // Block resource requests
      }
      for (let i = 0; i < BLOCKED_URLS.length; i++) {
        const r = BLOCKED_URLS[i];
        if (url.indexOf(r) !== -1) return callback({ cancel: true }); // block urls
      }
      callback({});
    });
    return window;
  }

  /**
   * gets the urls from the sitemap url
   * @param {String} sitemapUrl - the sitemap url
   * @returns {Promise<Array<String>>} - the urls
   */
  async #getUrlsFromSitemapUrl(sitemapUrl) {
    if (!sitemapUrl) return [];
    try {
      // Fetch the sitemap.xml file
      const response = await axios.get(sitemapUrl);
      const xmlData = response.data;

      // Parse the XML content
      let urls = [];
      parseString(xmlData, (err, result) => {
        if (err) {
          throw err;
        }

        // Extract URLs from the sitemap
        if (result.urlset && result.urlset.url) {
          urls = result.urlset.url.map(url => this.#removeEscapedCharacters(url.loc[0]).trim());
        }
      });

      return urls;
    } catch (error) {
      return [];
    }
  }

  /**
   * gets the sitemap url from robots.txt if it exists
   * @param {String} url - the base url
   * @returns {Promise<String>} - the sitemap url
   */
  async #getSitemapUrlFromRobotsTxt(url) {
    try {
      const response = await axios.get(`${url}/robots.txt`);
      const matches = response.data.match(/Sitemap:\s*(.*)/i);
      if (matches && matches[1]) {
        return matches[1];
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * gets the sitemap url from the meta tags
   * @returns {Promise<String>} - the sitemap url
   */
  async #getSitemapUrlFromMetaTags() {
    try {
      const sitemapUrl = await this.window.webContents.executeJavaScript(`
        (function () {
          return document.querySelector('link[rel="sitemap"]')?.href
        })()
      `);
      return sitemapUrl || null;
    } catch {
      return null;
    }
  }

  /**
   * gets the sitemap url using the 2 strategies defined above
   * @param {String} url - the base url
   * @returns {Promise<String>} - the sitemap url
   */
  async #getSitemapUrl(url) {
    const domain = this.urlObj.href;
    let result = await this.#getSitemapUrlFromRobotsTxt(url);
    if (!result) {
      result = await this.#getSitemapUrlFromMetaTags(url);
    }
    if (!result) {
      return `${domain}/sitemap.xml`;
    }
    try {
      await axios.get(result);
      return result;
    } catch {
      return `${domain}/sitemap.xml`;
    }
  }

  /**
   * removes any escaped characters like \n or \r etc
   * @param {String} string
   * @returns the string
   */
  #removeEscapedCharacters(string) {
    return string.replace(/\\[a-z]/g, '');
  }

  /**
   * uses the startUrl and the depth to find the links on the website
   * @param {String} startUrl the base url
   * @param {Number} depth the depth to go to
   * @returns {Promise<Array<String>>} - the urls
   */
  async #crawl(startUrl, depth) {
    const links = new Set();
    const visitedUrls = [];
    const domain = this.#stripUrl(this.initURL);
    let window = this.#createWindow();
    /**
     * A recursive function to get urls from different pages according to the depth
     * @param {String} url the url to process
     * @param {Number} depth the remaining depth
     * @returns null or the processPages function with updated values
     */
    const processPages = async (url, depth) => {
      if (!url || this.isCompleted) return;
      console.log(`crawling ${url}...`);
      try {
        visitedUrls.push(url);
        await window.loadURL(url);
        const pageUrlsUnsorted = await window.webContents.executeJavaScript(
          `(function() {
            const domain = '${domain}';
            const stripUrlFn = (url) => url.replace(/^(https?:\\/\\/)?(www\\.)?/, '');
            const checkAgainstDomain = (anchor) => {
              try {
                const anchorDomain = stripUrlFn(anchor.href);
                return anchorDomain.includes(domain);
              } catch {
                return false
              }
            }
            const anchors = Array.from(document.querySelectorAll('a'));
            const returningAnchors = anchors
              .filter(anchor => anchor.href.length > 0 && anchor.href.startsWith('http') && checkAgainstDomain(anchor))
              .map(anchor => anchor.href
                .replace(/www\./, '')         // Remove "www."
                .replace(/\\?.*/, '')          // Remove query strings
                .replace(/#.*/, '')           // Remove fragments
                .replace(/\\/$/, '')          // Remove trailing slash
              );
            return returningAnchors;
          })();
          `
        );
        const pageUrls = this.#sortUrlsByDepth(pageUrlsUnsorted);
        pageUrls.forEach(url => links.add(url));
      } catch (e) {
        if (window.isDestroyed() && !this.isCompleted) {
          window = this.#createWindow();
          console.log('created new window');
        }
      }
      if (depth <= 1) {
        return;
      }
      const urls = Array.from(links);
      const unvisitedUrls = urls.filter(url => !visitedUrls.includes(url)).filter(u => !u.match(/\?.*/) && !u.match(/#.*/) && !u.match(/%.*/));
      const unvisitedUrlsSet = new Set(unvisitedUrls);
      const unvisitedUrlsSetIterator = unvisitedUrlsSet.values();
      const urlToVisit = unvisitedUrlsSetIterator.next().value;
      return await processPages(urlToVisit, depth - 1);
    };
    try {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), MAX_TIME_TO_CRAWL);
        processPages(startUrl, depth).then(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    } catch (e) {
      /* empty */
    }
    console.log('crawling completed');
    window.destroy();
    return Array.from(links);
  }

  /**
   * sorts the urls by hierarchy
   * @param {Array<String>} urls an array of urls
   * @returns urls sorted by depth
   */
  #sortUrlsByDepth(urls) {
    /**
     * gets the depth of the url
     * @param {String} url the url
     * @returns {Number} - the url depth
     */
    const getUrlDepth = (url) => {
      if (!url.startsWith('http')) url = `http://${url}`;
      try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment !== '');
        return pathSegments.length;
      } catch {
        return 999;
      }
    };
    const sortedUrls = urls.slice().sort((url1, url2) => {
      return getUrlDepth(url1) - getUrlDepth(url2);
    });

    return sortedUrls;
  }

  /**
   * remove the protocol and www. from the url
   * @param {String} url - the url to strip
   */
  #stripUrl(url) {
    return url.replace(/^(https?:\/\/)/, '').replace(/^www\./, '');
  }
}

export default Spider;
