import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./ui/globals.css";

import Layout from "@/ui/layout";
import NotFound from "@/ui/not-found";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <NotFound />
    </Layout>
  </StrictMode>,
);
