import type { Page } from "@playwright/test";
import { setupServer } from "msw/node";

import { handlers } from "./handlers/index";

const server = setupServer(...handlers);

export const mockVerifyBTCAddress = async (page: Page) => {
  server.listen({ onUnhandledRequest: "bypass" });

  await page.addInitScript(() => {
    window.__e2eTestMode = true;
    window.__mockVerifyBTCAddress = async () => {
      return true;
    };
  });

  return () => {
    server.close();
  };
};

export { handlers };
