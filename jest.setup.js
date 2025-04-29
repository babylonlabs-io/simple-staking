const { TextEncoder, TextDecoder } = require("util");

// Mock TextEncoder/TextDecoder which are available in browsers but not in Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// For handling issues with libraries that check for existence of crypto.subtle
if (typeof global.crypto !== "object") {
  global.crypto = {
    subtle: {},
    getRandomValues: (arr) => {
      return require("crypto").randomFillSync(arr);
    },
  };
}

// Mock fetch API if needed but without requiring node-fetch
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
