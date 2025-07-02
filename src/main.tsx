import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import GlobalError from "@/ui/common/global-error";
import Layout from "@/ui/common/layout";
import HomePage from "@/ui/common/page";

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
