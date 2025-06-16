import type { Page } from "@playwright/test";

// Utility function to intercept requests and fulfill them with mock data
export const interceptRequest = async (
  page: Page,
  urlPattern: string,
  status: number,
  body: Record<string, any> = {},
  contentType: string = "application/json",
): Promise<void> => {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status,
      contentType,
      body: JSON.stringify(body),
    });
  });
};
