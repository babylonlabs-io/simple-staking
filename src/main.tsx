import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import GlobalError from "@/ui/global-error";
import Layout from "@/ui/layout";
import HomePage from "@/ui/page";

import "@/ui/globals.css";
import "../sentry.client.config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <ErrorBoundary FallbackComponent={GlobalError}>
        <HomePage />
      </ErrorBoundary>
    </Layout>
  </StrictMode>,
);
