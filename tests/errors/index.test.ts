import { ClientError, ERROR_CODES } from "@/errors";

describe("ClientError", () => {
  it("should correctly instantiate with errorCode and message", () => {
    const errorCode = ERROR_CODES.VALIDATION_ERROR;
    const message = "Test validation error";
    const error = new ClientError(errorCode, message);

    expect(error).toBeInstanceOf(Error); // It's an instance of the base Error
    expect(error).toBeInstanceOf(ClientError);
    expect(error.errorCode).toBe(errorCode);
    expect(error.message).toBe(message);
    expect(error.metadata).toBeUndefined();
    expect(error.name).toBe("Error"); // Standard behavior for extended errors
  });

  it("should correctly instantiate with both metadata and cause", () => {
    const errorCode = ERROR_CODES.INITIALIZATION_ERROR;
    const message = "Test error has some errors";
    const metadata = { walletName: "Test Wallet" };
    const cause = new Error("Wallet not found");
    const error = new ClientError(errorCode, message, { metadata, cause });

    expect(error.errorCode).toBe(errorCode);
    expect(error.message).toBe(message);
    expect(error.metadata).toEqual(metadata);
    expect(error.cause).toBe(cause);
  });
});
