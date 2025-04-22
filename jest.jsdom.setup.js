// Required for msw
import { rest } from "msw";
import { setupServer } from "msw/node";
import { TextDecoder, TextEncoder } from "util";

// Define missing Jest lifecycle functions if not available
const beforeAll = global.beforeAll || ((fn) => fn());
const afterEach = global.afterEach || ((fn) => fn());
const afterAll = global.afterAll || ((fn) => fn());

// Set up TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock BroadcastChannel for JSDOM environment
global.BroadcastChannel = class BroadcastChannel {
  constructor() {
    this.onmessage = null;
  }
  postMessage() {}
  close() {}
};

// Mock crypto for JSDOM environment
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {},
    getRandomValues: (arr) => {
      return require("crypto").randomFillSync(arr);
    },
  },
});

// Define handlers
const handlers = [
  rest.get("*", (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post("*", (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.put("*", (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.delete("*", (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.patch("*", (req, res, ctx) => {
    return res(ctx.json({}));
  }),
];

// Create MSW server
const server = setupServer(...handlers);

// Export server to allow adding specific handlers in tests
global.mswServer = server;

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
