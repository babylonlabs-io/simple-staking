const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for JSDOM environment
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {},
    getRandomValues: (arr) => {
      return require("crypto").randomFillSync(arr);
    },
  },
});

// Mock fetch API without requiring node-fetch
if (typeof global.fetch !== "function") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    }),
  );

  global.Headers = jest.fn().mockImplementation(() => ({}));
  global.Request = jest.fn().mockImplementation(() => ({}));
  global.Response = jest.fn().mockImplementation(() => ({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  }));
}

global.Headers = global.fetch.Headers;
global.Request = global.fetch.Request;
global.Response = global.fetch.Response;
