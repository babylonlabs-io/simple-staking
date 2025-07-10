import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router";

import GlobalError from "@/ui/legacy/global-error";
import Providers from "@/ui/legacy/providers";
import { Router } from "@/ui/router";

import "@/ui/globals.css";
import "../sentry.client.config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <ErrorBoundary FallbackComponent={GlobalError}>
          <Router />
        </ErrorBoundary>
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
