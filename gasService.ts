/**
 * Executes a Google Apps Script function and returns a Promise.
 * This simplifies server-side calls from the client-side React code.
 * @param functionName The name of the function to call in your Apps Script project.
 * @param args The arguments to pass to the function.
 * @returns A Promise that resolves with the return value of the Apps Script function.
 */
export const gasRun = <T,>(functionName: string, ...args: any[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result: T) => resolve(result))
      .withFailureHandler((error: Error) => reject(error))
      [functionName](...args);
  });
};
