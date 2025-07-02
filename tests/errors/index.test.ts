import { ClientError, ERROR_CODES } from "@/ui/common/errors";

describe("ClientError", () => {
  it("should correctly instantiate with errorCode and message", () => {
    const errorCode = ERROR_CODES.VALIDATION_ERROR;
    const message = "Test validation error";
    const error = new ClientError(errorCode, message);

    expect(error).toBeInstanceOf(Error); // It's an instance of the base Error
    expect(error).toBeInstanceOf(ClientError);
    expect(error.errorCode).toBe(errorCode);
    expect(error.message).toBe(message);
    expect(error.cause).toBeUndefined();
    expect(error.name).toBe("Error"); // Standard behavior for extended errors
  });

  it("should correctly instantiate with cause", () => {
    const errorCode = ERROR_CODES.INITIALIZATION_ERROR;
    const message = "Test error message";
    const cause = new Error("Original cause");

    const error = new ClientError(errorCode, message, {
      cause,
    });

    expect(error).toBeInstanceOf(ClientError);
    expect(error.errorCode).toBe(errorCode);
    expect(error.message).toBe(message);
    expect(error.cause).toBe(cause);
  });

  it("should correctly instantiate with cause", () => {
    const errorCode = ERROR_CODES.INITIALIZATION_ERROR;
    const message = "Test error message";
    const cause = new Error("Original cause");

    const error = new ClientError(errorCode, message, {
      cause,
    });

    expect(error).toBeInstanceOf(ClientError);
    expect(error.errorCode).toBe(errorCode);
    expect(error.message).toBe(message);
    expect(error.cause).toBe(cause);
  });
});
