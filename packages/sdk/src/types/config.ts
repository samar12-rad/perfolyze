// Config interface
interface PerfProviderConfig {
  samplingRate?: number;
}

// Session context interface
interface SessionContextType {
  sessionId: string;
  isSampled: boolean;
  isCleanedUp: boolean;
}
