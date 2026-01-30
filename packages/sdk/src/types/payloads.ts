/**
 * Payloads describe what leaves the system.
 * These are shaped for backend consumption.
 * Transport concerns live here.
 */

import { SessionMetrics } from "./metrics";

/**
 * What the SDK sends to the backend
 * Extends SessionMetrics with transport metadata
 */
export interface SessionMetricsPayload extends SessionMetrics {
  // Project identifier (set by SDK config)
  projectId: string;

  // Release/version identifier (set by SDK config)
  release: string;

  // Timestamp when payload is being sent
  sentAt: number;

  // User agent for context
  userAgent: string;

  // Sampled flag for reference
  isSampled: boolean;
}

/**
 * Batch of session payloads ready for transport
 */
export interface MetricsBatch {
  // All session payloads in this batch
  sessions: SessionMetricsPayload[];

  // Timestamp when batch was created
  createdAt: number;

  // Reason for flush: "session-end" | "size" | "time" | "manual"
  flushReason: "session-end" | "size" | "time" | "manual";
}
