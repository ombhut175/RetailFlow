import { Logger } from '@nestjs/common';

export class TimeoutUtil {
  private static readonly logger = new Logger(TimeoutUtil.name);

  /**
   * Wraps a promise with a timeout
   * @param promise The promise to wrap
   * @param timeoutMs Timeout in milliseconds
   * @param errorMessage Custom error message for timeout
   * @returns Promise that rejects if timeout is reached
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 15000,
    errorMessage: string = 'Operation timed out',
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          this.logger.error(`${errorMessage} after ${timeoutMs}ms`);
          reject(new Error(`${errorMessage} (timeout: ${timeoutMs}ms)`));
        }, timeoutMs);

        // Clear timeout if original promise resolves/rejects first
        promise.finally(() => clearTimeout(timeoutId));
      }),
    ]);
  }

  /**
   * Wraps a promise with retry logic and timeout
   * @param promiseFactory Function that returns a promise
   * @param maxRetries Maximum number of retries
   * @param timeoutMs Timeout for each attempt
   * @param retryDelay Delay between retries in milliseconds
   * @returns Promise that retries on failure
   */
  static async withRetry<T>(
    promiseFactory: () => Promise<T>,
    maxRetries: number = 3,
    timeoutMs: number = 15000,
    retryDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempt ${attempt}/${maxRetries}`);
        return await this.withTimeout(promiseFactory(), timeoutMs);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < maxRetries) {
          this.logger.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError!;
  }
}