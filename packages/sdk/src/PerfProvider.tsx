import React, { Profiler, useState } from "react";
import { shouldTrackSession } from "./utils/sampling";
import { SessionProvider } from "./context/SessionContext";


interface PerfProviderConfig {
  samplingRate?: number; // 0.1 = 10%, 0.5 = 50%, 1 = 100%
}

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
        (config.samplingRate ?? 1) * 100
    );

    if (!isSampled) {
        return <>{children}</>;
    }




  return (
    <SessionProvider sessionId={sessionId} isSampled={isSampled}>
    <Profiler
      id="root"
      onRender={(id, phase, actualDuration) => {
        if (isSampled) {
            console.log({ id, phase, actualDuration, sessionId });
        }
    }}
    >
      {children}
    </Profiler>
    </SessionProvider>
  );
}
