import React, { Profiler, useState, useMemo, useEffect } from "react";
import { shouldTrackSession } from "./utils/sampling";
import { SessionProvider } from "./context/SessionContext";
import {
  CollectorProvider,
  CollectorPipeline,
} from "./context/CollectorContext";
import { SessionAggregator } from "./aggregators/SessionAggregator";
import { RenderEvent } from "./types/events";
import { BatchQueue, BatchQueueConfig } from "./queue/BatchQueue";
import { Transport } from "./queue/types";
import { SessionMetricsPayload } from "./types/payloads";

interface PerfProviderConfig {
  samplingRate?: number; // 0.1 = 10%, 0.5 = 50%, 1 = 100%
  projectId?: string;
  release?: string;
  transport?: Transport;
  batchQueueConfig?: BatchQueueConfig;
}

/**
 * PerfProvider
 * Owns React Profiler callback.
 * Translates Profiler events into render events.
 * Delegates aggregation and batching to SessionAggregator and BatchQueue.
 */
export function PerfProvider({
  children,
  config = { samplingRate: 1 }, // default to 100% sampling
}: {
  children: React.ReactNode;
  config?: PerfProviderConfig;
}) {
  const [sessionId] = useState(() => {
    return crypto.randomUUID();
  });

  const isSampled = shouldTrackSession(
    sessionId,
    (config.samplingRate ?? 1) * 100,
  );

  // Create aggregator for this session
  const aggregator = useMemo(() => {
    return new SessionAggregator(sessionId);
  }, [sessionId]);

  // Create batch queue with transport (if provided)
  const batchQueue = useMemo(() => {
    if (!config.transport) {
      return null;
    }
    return new BatchQueue(config.transport, config.batchQueueConfig);
  }, [config.transport, config.batchQueueConfig]);

  // Create pipeline entry point for components
  const pipeline = useMemo<CollectorPipeline>(() => {
    return {
      recordRenderEvent: (event: RenderEvent) => {
        aggregator.addRenderEvent(event);

        // If we have a batch queue and enough data, flush to it
        if (batchQueue && shouldFlushToQueue(aggregator)) {
          const metrics = aggregator.getMetrics();
          const payload: SessionMetricsPayload = {
            ...metrics,
            projectId: config.projectId ?? "unknown",
            release: config.release ?? "unknown",
            sentAt: Date.now(),
            userAgent: navigator.userAgent,
            isSampled,
          };
          batchQueue.enqueue(payload);
          aggregator.reset();
        }
      },
      tagComponent: (componentId: string, tags: Record<string, string>) => {
        aggregator.addComponentTags(componentId, tags);
      },
    };
  }, [aggregator, batchQueue, config.projectId, config.release, isSampled]);

  // Flush on unload
  useEffect(() => {
    const handleUnload = async () => {
      if (batchQueue) {
        await batchQueue.close();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [batchQueue]);

  // Flush on visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && batchQueue) {
        // Tab became invisible; flush remaining metrics
        const metrics = aggregator.getMetrics();
        if (metrics.components.length > 0) {
          const payload: SessionMetricsPayload = {
            ...metrics,
            projectId: config.projectId ?? "unknown",
            release: config.release ?? "unknown",
            sentAt: Date.now(),
            userAgent: navigator.userAgent,
            isSampled,
          };
          batchQueue.enqueue(payload);
          aggregator.reset();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [aggregator, batchQueue, config.projectId, config.release, isSampled]);

  if (!isSampled) {
    return <>{children}</>;
  }

  return (
    <SessionProvider sessionId={sessionId} isSampled={isSampled}>
      <CollectorProvider pipeline={pipeline}>
        <Profiler
          id="root"
          onRender={(id, phase, actualDuration) => {
            // Translate React Profiler event to RenderEvent
            const event: RenderEvent = {
              componentId: id,
              phase: phase as "mount" | "update",
              actualDuration,
              timestamp: Date.now(),
            };
            pipeline.recordRenderEvent(event);
          }}
        >
          {children}
        </Profiler>
      </CollectorProvider>
    </SessionProvider>
  );
}

/**
 * Decide whether to flush aggregated metrics to the queue
 * Triggers on: size threshold or time elapsed
 */
function shouldFlushToQueue(aggregator: SessionAggregator): boolean {
  // Flush if we have 50+ component metrics or 1000+ renders
  const componentCount = aggregator.getComponentCount();
  const renderCount = aggregator.getTotalRenderCount();

  return componentCount >= 50 || renderCount >= 1000;
}
