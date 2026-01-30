/**
 * Transport interface and types
 * Dumb pluggable adapter that owns auth/headers/retry logic.
 * BatchQueue hands batches to transport; transport decides delivery.
 */

import { MetricsBatch } from "../types/payloads";

/**
 * Transport adapter interface
 * Implementations handle authentication, headers, retries, error handling
 */
export interface Transport {
  /**
   * Send a batch of session metrics
   * Implementations decide: retry logic, timeout, auth headers, etc.
   * Throw on failure; BatchQueue will log and retry later
   */
  send(batch: MetricsBatch): Promise<void>;
}
