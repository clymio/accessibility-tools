import { format } from 'date-fns';

/**
 * Validate a domain name
 * @param {string} domain - the domain name to validate
 * @returns - true if the domain name is valid, false otherwise
 */
export const isDomainValid = (domain) => {
  const domainPattern = /^(https?:\/\/)?(localhost|(([\w-]+\.)+[\w-]+)|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/\S*)?$/i;
  return domainPattern.test(domain.trim());
};

/**
 * Format a domain name
 * If strip is true, the domain is returned without any protocol or www prefix.
 * Otherwise, if the domain doesn't have protocol, a protocol is added.
 * @param {string} domain - the domain name to format
 * @param {boolean} [strip=false] - whether to strip the protocol and www prefix
 * @returns - the formatted domain name
 */
export const formatDomain = (domain, strip = false) => {
  if (strip) {
    return domain.replace(/^(https?:\/\/)?(www\.)?/, '');
  }
  if (!domain.startsWith('http')) {
    return domain.startsWith('localhost') ? `http://${domain}` : `https://${domain}`;
  }
  return domain;
};

/**
 * Generates a string id with a given number and prefix.
 * The id will be padded with zeros to the given length.
 * @param {number} number - the number to generate the id with
 * @param {string} [prefix] - the prefix to add to the number
 * @param {number} [zeros] - the number of zeros to pad the id with
 * @return {string} the generated id
 */
export const generateId = (number, prefix = '0', zeros = 4) => {
  return `${prefix}${number.toString().padStart(zeros, '0')}`;
};

/**
 * Generates a string label for the given array by displaying the first x items and adding a label with the remaining count.
 * @param {array} items - the items to generate the label for
 * @param {number} [count] - the number of items to display
 * @param {string} [separator] - the separator to use between the displayed items
 * @return {string} the generated label
 */
export const getArrayTruncatedLabel = (items, count = 2, separator = ', ') => {
  if (!Array.isArray(items) || items.length === 0) return '';
  if (items.length <= count) return items.join(separator);
  const visibleItems = items.slice(0, count).join(separator);
  const remainingCount = items.length - count;
  return `${visibleItems}${separator} +${remainingCount}`;
};

/**
 * Formats the given date into a string with the format MMM d, yyyy (e.g. May 1, 2020).
 * @param {Date} date - the date to format
 * @return {string} the formatted date string
 */
export const formatDate = (date, dateFormat = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(date, dateFormat);
};

/**
 * Fixes the targets of a test case
 * @param {Object} tc - the test case
 * @return the updated test case
 */
export const fixTcTargets = (tc) => {
  const targetMap = {};

  for (const item of tc.targets) {
    const targetId = item.target.id;
    if (!targetMap[targetId]) {
      targetMap[targetId] = { name: item.target.name, formats: new Map() };
    }
    if (item.format && item.format.id) {
      targetMap[targetId].formats.set(item.format.id, item.format.name);
    }
  }

  const system_targets = [];
  for (const targetId in targetMap) {
    system_targets.push({
      id: targetId,
      name: targetMap[targetId].name,
      formats: Array.from(targetMap[targetId].formats, ([id, name]) => ({ id, name }))
    });
  }

  tc.system_targets = system_targets;
  delete tc.targets;

  return tc;
};

/**
 * Returns a promise that resolves or rejects when the given promise resolves or rejects,
 * or rejects when the given timeout is reached (whichever happens first).
 * @param {Promise} promise - the promise to monitor
 * @param {number} [timeout] - the timeout in milliseconds (default: 5000)
 */
export const timeoutFn = async (promise, timeout = 5000) => {
  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), timeout));
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Converts a string into an ID format by trimming whitespace,
 * converting to uppercase, and replacing spaces with underscores.
 * @param {string} str - The string to convert into an ID.
 * @return {string} The converted string in ID format.
 */
export const convertToId = (str) => {
  return str.trim().toUpperCase().replace(/\s+/g, '_');
};

/**
 * Chunks an array into smaller arrays of a given size.
 * @param {array} [array] - The array to chunk.
 * @param {number} [size] - The size of each chunk. Defaults to 10.
 * @return - A new array of arrays, each containing a chunk of the given size.
 */
export const chunkArray = (array = [], size = 10) => {
  if (!Array.isArray(array) || array.length === 0 || size <= 0) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Converts a given string into a case format.
 * @param {string} str - The string
 * @param {'camel'|'kebab'} [format] - The case format to use
 * @return - The converted string in the given case format.
 */
export const strToCase = (str, format) => {
  if (!str) return '';
  if (format === 'camel') {
    return str
      .toLowerCase()
      .split(/[\s_-]+/)
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('');
  }
  if (format === 'kebab') {
    return str.toLowerCase().replace(/[ :]/g, '-').replace(/[()]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  return str;
};
