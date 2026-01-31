import ReactDOM from "react-dom/client";
import App from "./App";
import { PerfProvider, type Transport, type MetricsBatch } from "@perfolyze/sdk";

class ConsoleTransport implements Transport {
  async send(batch: MetricsBatch): Promise<void> {
    console.log("Transport sending batch", batch);
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PerfProvider
    config={{
      samplingRate: 1,
      transport: new ConsoleTransport(),
      batchQueueConfig: {
        maxBufferSize: 1,
      },
    }}
  >
    <App />
  </PerfProvider>,
);
