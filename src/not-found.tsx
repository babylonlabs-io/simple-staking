import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/globals.css";

import Layout from "@/app/layout";
import NotFound from "@/app/not-found";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <NotFound />
    </Layout>
  </StrictMode>,
);
