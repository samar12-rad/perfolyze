import ReactDOM from "react-dom/client";
import App from "./App";
import { PerfProvider } from "@perfolyze/sdk";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PerfProvider>
    <App />
  </PerfProvider>
);
