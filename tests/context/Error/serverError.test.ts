import { HttpStatusCode } from "axios";

import { ServerError } from "@/app/context/Error/errors/serverError";
import { ErrorType } from "@/app/types/errors";

describe("ServerError", () => {
  const mockEndpoint = "/api/test";
  const mockMessage = "Test server error";

  it("should create a server error with default status code", () => {
    const error = new ServerError({
      message: mockMessage,
      endpoint: mockEndpoint,
    });

    expect(error.message).toBe(mockMessage);
    expect(error.status).toBe(HttpStatusCode.InternalServerError);
    expect(error.endpoint).toBe(mockEndpoint);
    expect(error.type).toBe(ErrorType.SERVER);
    expect(error.getDisplayMessage()).toBe(mockMessage);
    expect(error.getStatusCode()).toBe(HttpStatusCode.InternalServerError);
  });

  it("should create a server error with custom status code", () => {
    const status = HttpStatusCode.NotFound;
    const error = new ServerError({
      message: mockMessage,
      status,
      endpoint: mockEndpoint,
    });

    expect(error.status).toBe(status);
    expect(error.getStatusCode()).toBe(status);
    expect(error.endpoint).toBe(mockEndpoint);
    expect(error.type).toBe(ErrorType.SERVER);
    expect(error.getDisplayMessage()).toBe(mockMessage);
  });

  it("should handle errors without endpoint", () => {
    const error = new ServerError({ message: mockMessage });

    expect(error.endpoint).toBeUndefined();
    expect(error.getDisplayMessage()).toBe(mockMessage);
  });
});
