import { ServerError } from "@/app/context/Error/errors";
import { validateUrlPath } from "@/utils/fetch";

describe("validateUrlPath", () => {
  describe("Valid inputs", () => {
    it("should accept regular alphanumeric strings", () => {
      expect(() => validateUrlPath("abc123")).not.toThrow();
    });

    it("should accept Bitcoin addresses", () => {
      expect(() =>
        validateUrlPath("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"),
      ).not.toThrow();
    });

    it("should accept transaction IDs", () => {
      expect(() =>
        validateUrlPath(
          "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
        ),
      ).not.toThrow();
    });

    it("should accept strings with single dots", () => {
      expect(() => validateUrlPath("abc.def")).not.toThrow();
    });

    it("should accept strings with hyphens and underscores", () => {
      expect(() => validateUrlPath("abc-def_ghi")).not.toThrow();
    });
  });

  describe("Path traversal attacks", () => {
    it("should reject double dots", () => {
      expect(() => validateUrlPath("..")).toThrow(ServerError);
      expect(() => validateUrlPath("abc..def")).toThrow(ServerError);
    });

    it("should reject forward slashes", () => {
      expect(() => validateUrlPath("abc/def")).toThrow(ServerError);
    });

    it("should reject backslashes", () => {
      expect(() => validateUrlPath("abc\\def")).toThrow(ServerError);
    });

    it("should reject current directory references", () => {
      expect(() => validateUrlPath("./abc")).toThrow(ServerError);
      expect(() => validateUrlPath("abc/.")).toThrow(ServerError);
    });

    it("should reject parent directory traversal", () => {
      expect(() => validateUrlPath("../abc")).toThrow(ServerError);
      expect(() => validateUrlPath("abc/..")).toThrow(ServerError);
      expect(() => validateUrlPath("abc/../def")).toThrow(ServerError);
    });

    it("should reject URL encoded path traversal attempts", () => {
      // URL encoded '..'
      expect(() => validateUrlPath("%2e%2e")).toThrow(ServerError);
      expect(() => validateUrlPath("%2E%2E")).toThrow(ServerError);

      // URL encoded '/'
      expect(() => validateUrlPath("abc%2fdef")).toThrow(ServerError);
      expect(() => validateUrlPath("abc%2Fdef")).toThrow(ServerError);

      // URL encoded '\'
      expect(() => validateUrlPath("abc%5cdef")).toThrow(ServerError);
      expect(() => validateUrlPath("abc%5Cdef")).toThrow(ServerError);

      // URL encoded './'
      expect(() => validateUrlPath("%2e%2f")).toThrow(ServerError);
      expect(() => validateUrlPath("%2E%2F")).toThrow(ServerError);
    });

    it("should reject mixed encoded/non-encoded path traversal attempts", () => {
      expect(() => validateUrlPath("..%2fdef")).toThrow(ServerError);
      expect(() => validateUrlPath("%2e./def")).toThrow(ServerError);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty strings", () => {
      expect(() => validateUrlPath("")).not.toThrow();
    });

    it("should accept strings with special characters that aren't path traversal related", () => {
      expect(() => validateUrlPath("abc!@#$%^&*()def")).not.toThrow();
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      expect(() => validateUrlPath(longString)).not.toThrow();
    });
  });
});
