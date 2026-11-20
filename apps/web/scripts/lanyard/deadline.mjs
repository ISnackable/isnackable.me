/**
 * Bound promises such as page.evaluate(), which Playwright's action timeout
 * does not cover. The owner must close the browser in finally on timeout.
 * @template T
 * @param {Promise<T>} operation
 * @param {string} label
 * @param {number} [milliseconds]
 * @returns {Promise<T>}
 */
export async function withDeadline(operation, label, milliseconds = 30_000) {
  let timer;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} exceeded ${milliseconds}ms`)),
          milliseconds
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
