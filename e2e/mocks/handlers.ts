import { Page } from "@playwright/test";
import { setupServer } from "msw/node";

import { handlers } from "./handlers/index";

const server = setupServer(...handlers);

export const mockVerifyBTCAddress = async (page: Page) => {
  console.log("[MSW DEBUG] Setting up mockVerifyBTCAddress");
  server.listen({ onUnhandledRequest: "bypass" });
  console.log("[MSW DEBUG] MSW server started");

  await page.addInitScript(() => {
    console.log("[MSW DEBUG] Adding init script for __mockVerifyBTCAddress");
    window.__e2eTestMode = true;
    window.__mockVerifyBTCAddress = async () => {
      console.log("[MSW DEBUG] __mockVerifyBTCAddress called, returning true");
      return true;
    };
  });

  return () => {
    console.log("[MSW DEBUG] Shutting down MSW server");
    server.close();
  };
};

// Re-export handlers for direct access
export { handlers };
