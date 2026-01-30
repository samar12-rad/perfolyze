/**
 * CollectorContext
 * Exposes pipeline entry point to components.
 * Does NOT expose internal aggregator; exposes only what components need.
 * Allows swapping implementations, disabling collection, mocking in tests.
 */

import { createContext, useContext, useCallback } from "react";
import { RenderEvent } from "../types/events";

/**
 * Pipeline entry point interface
 * Components interact with this, not internal implementation
 */
export interface CollectorPipeline {
  /**
   * Record a render event from React Profiler
   */
  recordRenderEvent(event: RenderEvent): void;

  /**
   * Add tags to a component for grouping
   */
  tagComponent(componentId: string, tags: Record<string, string>): void;
}

const CollectorContext = createContext<CollectorPipeline | null>(null);

interface CollectorProviderProps {
  children: React.ReactNode;
  pipeline: CollectorPipeline;
}

/**
 * Provider for collector pipeline
 */
export function CollectorProvider({
  children,
  pipeline,
}: CollectorProviderProps) {
  return (
    <CollectorContext.Provider value={pipeline}>
      {children}
    </CollectorContext.Provider>
  );
}

/**
 * Hook to access collector pipeline
 * Throws if used outside CollectorProvider
 */
export function useCollector(): CollectorPipeline {
  const context = useContext(CollectorContext);

  if (!context) {
    throw new Error("useCollector must be used within CollectorProvider");
  }

  return context;
}

/**
 * Hook to record render events (for component use)
 */
export function useRecordRender(): (event: RenderEvent) => void {
  const collector = useCollector();
  return useCallback(
    (event: RenderEvent) => {
      collector.recordRenderEvent(event);
    },
    [collector],
  );
}

/**
 * Hook to tag a component (for component use)
 */
export function useTagComponent(): (
  componentId: string,
  tags: Record<string, string>,
) => void {
  const collector = useCollector();
  return useCallback(
    (componentId: string, tags: Record<string, string>) => {
      collector.tagComponent(componentId, tags);
    },
    [collector],
  );
}
