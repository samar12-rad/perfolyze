/**
 * Events captured from React Profiler
 * These are raw facts observed at runtime
 */

export interface RenderEvent {
  // Component identifier from React Profiler
  componentId: string;

  // "mount" | "update"
  phase: "mount" | "update";

  // Duration in milliseconds
  actualDuration: number;

  // Timestamp when event occurred (milliseconds since epoch)
  timestamp: number;
}
