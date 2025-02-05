import { NextRequest } from "next/server";

import { middleware } from "../src/middleware";

jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  NextResponse: {
    next: () => ({
      headers: new Headers({
        RSC: "1",
        "X-Middleware-Prefetch": "1",
        "X-Invoke-Status": "200",
        "Next-Router-State-Tree": "test",
        "Next-Router-Prefetch": "1",
        "Valid-Header": "keep",
      }),
    }),
  },
}));

describe("Security Headers Middleware", () => {
  const mockNextRequest = new NextRequest(new URL("http://localhost"), {
    headers: new Headers(),
  });

  it("should remove all unsafe headers case-insensitively", () => {
    const response = middleware(mockNextRequest);

    expect(response.headers.get("rsc")).toBeNull();
    expect(response.headers.get("x-middleware-prefetch")).toBeNull();
    expect(response.headers.get("x-invoke-status")).toBeNull();
    expect(response.headers.get("next-router-state-tree")).toBeNull();
    expect(response.headers.get("next-router-prefetch")).toBeNull();
    expect(response.headers.get("valid-header")).toBe("keep");
  });
});
