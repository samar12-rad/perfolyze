/**
 * BatchQueue
 * Plain TypeScript (no React).
 * Buffers SessionMetricsPayload, decides flush timing, hands to transport.
 * Manages memory safety with hard cap and LRU eviction.
 */

import { SessionMetricsPayload, MetricsBatch } from "../types/payloads";
import { Transport } from "./types";

export interface BatchQueueConfig {
  // Max number of payloads to buffer before forcing flush
  maxBufferSize?: number;

  // Flush after this many milliseconds of inactivity
  flushInterval?: number;

  // Flush when buffer reaches this percentage of maxBufferSize
  flushThresholdPercent?: number;
}

export class BatchQueue {
  private buffer: SessionMetricsPayload[] = [];
  private transport: Transport;
  private config: Required<BatchQueueConfig>;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isFlushInProgress: boolean = false;

  constructor(transport: Transport, config: BatchQueueConfig = {}) {
    this.transport = transport;
    this.config = {
      maxBufferSize: config.maxBufferSize ?? 1000,
      flushInterval: config.flushInterval ?? 30000, // 30 seconds
      flushThresholdPercent: config.flushThresholdPercent ?? 80, // 80% full
    };
  }

  /**
   * Add a payload to the buffer
   * Triggers automatic flushes based on size/time
   */
  enqueue(payload: SessionMetricsPayload): void {
    // Memory safety: LRU eviction if at capacity
    if (this.buffer.length >= this.config.maxBufferSize) {
      // Remove oldest (first) payload
      this.buffer.shift();
    }

    this.buffer.push(payload);

    // Reset flush timer
    this.resetFlushTimer();

    // Check if size threshold exceeded
    const thresholdSize =
      (this.config.maxBufferSize * this.config.flushThresholdPercent) / 100;
    if (this.buffer.length >= thresholdSize) {
      this.flush("size");
    }
  }

  /**
   * Manually flush the buffer
   */
  async flush(
    reason: "session-end" | "size" | "time" | "manual" = "manual",
  ): Promise<void> {
    if (this.isFlushInProgress || this.buffer.length === 0) {
      return;
    }

    this.isFlushInProgress = true;

    try {
      const batch: MetricsBatch = {
        sessions: [...this.buffer],
        createdAt: Date.now(),
        flushReason: reason,
      };

      // Hand to transport (which owns auth/headers/retry logic)
      await this.transport.send(batch);

      // Only clear buffer on successful send
      this.buffer = [];
    } catch (error) {
      // Transport handles retries; we log and keep buffer for next attempt
      console.error(
        `[BatchQueue] Failed to send batch with reason "${reason}":`,
        error,
      );
      // Buffer is NOT cleared on failure; transport decides if batch is discarded
    } finally {
      this.isFlushInProgress = false;
      this.resetFlushTimer();
    }
  }

  /**
   * Flush and close queue (e.g., on page unload)
   */
  async close(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush("session-end");
  }

  /**
   * Get current buffer size (for testing/monitoring)
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Reset the flush timer
   */
  private resetFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush("time");
    }, this.config.flushInterval);
  }
}
