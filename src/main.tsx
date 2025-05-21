import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/globals.css";

import Layout from "@/app/layout";
import HomePage from "@/app/page";

//TODO: fix eslint
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <HomePage />
    </Layout>
  </StrictMode>,
);
