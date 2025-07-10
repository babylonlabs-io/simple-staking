import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router";

import GlobalError from "@/ui/common/global-error";
import { Router } from "@/ui/router";

import "@/ui/globals.css";
import "../sentry.client.config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={GlobalError}>
        <Router />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
