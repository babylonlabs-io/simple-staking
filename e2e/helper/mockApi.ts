import { Page } from "@playwright/test";

/**
 * Sets up a direct mock for the verifyBTCAddress function
 * This bypasses the normal API call and forces the function to return true
 */
export const mockVerifyBTCAddress = async (page: Page) => {
  console.log("Setting up verifyBTCAddress mock...");

  await page.addInitScript(() => {
    // Create a function that will be called during initialization
    const patchVerifyBTCAddress = () => {
      try {
        // First approach: Try to patch the imported module directly
        if (window.require && typeof window.require === "function") {
          const originalRequire = window.require;
          window.require = function (path) {
            const result = originalRequire(path);

            // If we're importing the verifyBTCAddress module, patch it
            if (path.includes("verifyBTCAddress")) {
              console.log("Intercepted verifyBTCAddress module import");
              return async () => {
                console.log("Mock verifyBTCAddress called, returning true");
                return true;
              };
            }

            return result;
          };
        }

        // Second approach: Add a global testing flag that our test can check
        window.__e2eTestMode = true;
        window.__mockVerifyBTCAddress = async () => {
          console.log("Global mock verifyBTCAddress called, returning true");
          return true;
        };

        // Third approach: Override the fetch API for the screening endpoint
        const originalFetch = window.fetch;
        window.fetch = function (input, init) {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.toString()
                : (input as Request).url;

          if (url.includes("/address/screening")) {
            console.log("Intercepting /address/screening fetch request");
            return Promise.resolve(
              new Response(
                JSON.stringify({
                  data: {
                    btc_address: {
                      risk: "low",
                    },
                  },
                }),
                {
                  status: 200,
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              ),
            );
          }

          return originalFetch(input, init);
        };

        console.log("Successfully set up verifyBTCAddress mocks");
      } catch (error) {
        console.error("Error setting up verifyBTCAddress mock:", error);
      }
    };

    // Run immediately
    patchVerifyBTCAddress();

    // Also run when DOM is fully loaded in case of timing issues
    if (document.readyState === "complete") {
      patchVerifyBTCAddress();
    } else {
      window.addEventListener("DOMContentLoaded", patchVerifyBTCAddress);
    }
  });

  // Also set up a direct route intercept for the API call
  await page.route("**/address/screening*", async (route) => {
    console.log("Intercepting address screening API request");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          btc_address: {
            risk: "low",
          },
        },
      }),
    });
  });

  console.log("verifyBTCAddress mock setup complete");
};
