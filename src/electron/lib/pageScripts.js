class PageScriptsLib {
  /**
   * Returns a script that focuses and scrolls the element
   * @param {string} selector The CSS selector of the element to be focused.
   * @returns The script
   */
  static focusScript(selector) {
    selector = selector.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `(() => {
      try {
        const element = document.querySelector('${selector}');
        if (!element) return;
        element.style.outline = '2px solid #ff0000';
        element.focus();
        try {
          const elTop = Math.round(element.getBoundingClientRect().top);
          const elLeft = Math.round(element.getBoundingClientRect().left);
          const targetY = elTop + window.scrollY - 150;
          const targetX = elLeft + window.scrollX;
          if (elTop === 0 && elLeft === 0) {
            window.scrollTo({ top: 0, left: 0 });
          } else {
            window.scrollTo({ top: targetY, left: targetX });
          }
        } catch (e) {
          element.scrollIntoView(true);
        }
      } catch (e) {}
    })()`;
  }

  /**
   * Returns a script that removes focus from the element
   * @param {string} selector The CSS selector of the element to remove focus from.
   * @returns The script
   */
  static async removeFocusScript(selector) {
    selector = selector.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `(() => {
      try {
        const element = document.querySelector('${selector}');
        if (!element) return;
        element.style.outline = 'none';
      } catch {
      }
    })()`;
  }
}

export default PageScriptsLib;
