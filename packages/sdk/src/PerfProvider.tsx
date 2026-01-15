import React, { Profiler } from "react";

export function PerfProvider({ children }: { children: React.ReactNode }) {
  return (
    <Profiler
      id="root"
      onRender={(id, phase, actualDuration) => {
        console.log({ id, phase, actualDuration });
      }}
    >
      {children}
    </Profiler>
  );
}
