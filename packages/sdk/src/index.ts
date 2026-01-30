// Main exports
export { PerfProvider } from "./PerfProvider";

// Types: metrics (runtime facts)
export type { ComponentMetric, SessionMetrics } from "./types/metrics";

// Types: payloads (what leaves the system)
export type { SessionMetricsPayload, MetricsBatch } from "./types/payloads";

// Types: events (Profiler events)
export type { RenderEvent } from "./types/events";

// Aggregator (extensibility, custom implementations)
export { SessionAggregator } from "./aggregators/SessionAggregator";

// Batching queue
export { BatchQueue, type BatchQueueConfig } from "./queue/BatchQueue";
export type { Transport } from "./queue/types";

// Context and hooks (component integration)
export type { CollectorPipeline } from "./context/CollectorContext";
export {
  CollectorProvider,
  useCollector,
  useRecordRender,
  useTagComponent,
} from "./context/CollectorContext";

// Session context
export { SessionProvider, useSessionContext } from "./context/SessionContext";
export type { SessionContextType } from "./context/SessionContext";

// Utilities
export { shouldTrackSession } from "./utils/sampling";
