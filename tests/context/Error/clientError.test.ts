import {
  ClientErrorCategory,
  getClientErrorMessage,
} from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { ErrorType } from "@/app/types/errors";

describe("ClientError", () => {
  const mockMessage = "Test client error";
  const mockCategory = ClientErrorCategory.CLIENT_VALIDATION;

  it("should create a client error with default values", () => {
    const error = new ClientError({ message: mockMessage });

    expect(error.message).toBe(mockMessage);
    expect(error.category).toBe(ClientErrorCategory.CLIENT_UNKNOWN);
    expect(error.type).toBe(ErrorType.UNKNOWN);
    expect(error.displayMessage).toContain("unexpected client error");
  });

  it("should create a client error with custom category and type", () => {
    const error = new ClientError({
      message: mockMessage,
      category: mockCategory,
      type: ErrorType.WALLET,
    });

    expect(error.category).toBe(mockCategory);
    expect(error.type).toBe(ErrorType.WALLET);
    expect(error.displayMessage).toContain(getClientErrorMessage(mockCategory));
  });

  it("should include details in display message when provided", () => {
    const details = "Field validation failed";
    const error = new ClientError({
      message: details,
      category: mockCategory,
    });

    expect(error.displayMessage).toContain(details);
    expect(error.displayMessage).toContain("check your input");
  });

  it("should return correct error code", () => {
    const error = new ClientError({
      message: mockMessage,
      category: mockCategory,
    });

    expect(error.category).toBe(mockCategory);
  });
});
