/**
 * Metrics describe facts observed in runtime.
 * These are aggregated and batched before transport.
 * No timestamps, auth hints, or backend assumptions.
 */

export interface ComponentMetric {
  // Component name from React Profiler
  componentName: string;

  // Number of times this component rendered
  renderCount: number;

  // Total duration across all renders (ms)
  totalDuration: number;

  // Minimum render duration (ms)
  minDuration: number;

  // Maximum render duration (ms)
  maxDuration: number;

  // Number of mount phase renders
  mountCount: number;

  // Number of update phase renders
  updateCount: number;

  // Optional shallow tags for grouping (max 3)
  tags?: Record<string, string>;
}

/**
 * Aggregated metrics for a single session
 */
export interface SessionMetrics {
  // Session ID (UUID)
  sessionId: string;

  // All component metrics for this session
  components: ComponentMetric[];

  // Timestamp when aggregation started (for reference, not transport)
  createdAt: number;

  // Timestamp of last update
  lastUpdatedAt: number;
}
