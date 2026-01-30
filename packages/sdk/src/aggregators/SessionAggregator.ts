/**
 * SessionAggregator
 * Collects individual render events and aggregates them per-component.
 * Stores metrics in-memory during session lifetime.
 * Produces SessionMetrics for batching.
 */

import { RenderEvent } from "../types/events";
import { ComponentMetric, SessionMetrics } from "../types/metrics";

export class SessionAggregator {
  private sessionId: string;
  private metrics: Map<string, ComponentMetric> = new Map();
  private createdAt: number;
  private lastUpdatedAt: number;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.createdAt = Date.now();
    this.lastUpdatedAt = Date.now();
  }

  /**
   * Add a render event and aggregate it
   */
  addRenderEvent(event: RenderEvent): void {
    const { componentId, phase, actualDuration } = event;

    let metric = this.metrics.get(componentId);

    if (!metric) {
      metric = {
        componentName: componentId,
        renderCount: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: -Infinity,
        mountCount: 0,
        updateCount: 0,
      };
      this.metrics.set(componentId, metric);
    }

    // Update aggregates
    metric.renderCount++;
    metric.totalDuration += actualDuration;
    metric.minDuration = Math.min(metric.minDuration, actualDuration);
    metric.maxDuration = Math.max(metric.maxDuration, actualDuration);

    if (phase === "mount") {
      metric.mountCount++;
    } else if (phase === "update") {
      metric.updateCount++;
    }

    this.lastUpdatedAt = Date.now();
  }

  /**
   * Add tags to a component metric
   * Tags are shallow and limited to 3 per component
   */
  addComponentTags(componentId: string, tags: Record<string, string>): void {
    let metric = this.metrics.get(componentId);

    if (!metric) {
      metric = {
        componentName: componentId,
        renderCount: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: -Infinity,
        mountCount: 0,
        updateCount: 0,
      };
      this.metrics.set(componentId, metric);
    }

    // Shallow copy and limit to 3 tags
    const existingTags = metric.tags || {};
    const newTags = { ...existingTags, ...tags };
    const tagEntries = Object.entries(newTags).slice(0, 3);
    metric.tags = Object.fromEntries(tagEntries);

    this.lastUpdatedAt = Date.now();
  }

  /**
   * Get aggregated metrics for this session
   */
  getMetrics(): SessionMetrics {
    return {
      sessionId: this.sessionId,
      components: Array.from(this.metrics.values()),
      createdAt: this.createdAt,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /**
   * Get component count (useful for size-based flush triggers)
   */
  getComponentCount(): number {
    return this.metrics.size;
  }

  /**
   * Get total event count (useful for size-based flush triggers)
   */
  getTotalRenderCount(): number {
    let total = 0;
    for (const metric of this.metrics.values()) {
      total += metric.renderCount;
    }
    return total;
  }

  /**
   * Clear all aggregated metrics
   */
  reset(): void {
    this.metrics.clear();
    this.lastUpdatedAt = Date.now();
  }
}
