import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import "./app/globals.css";

import "../sentry.client.config";

import GlobalError from "@/app/global-error";
import Layout from "@/app/layout";
import HomePage from "@/app/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <ErrorBoundary FallbackComponent={GlobalError}>
        <HomePage />
      </ErrorBoundary>
    </Layout>
  </StrictMode>,
);
