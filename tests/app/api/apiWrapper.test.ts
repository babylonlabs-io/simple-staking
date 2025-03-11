import { apiWrapper } from "@/app/api/apiWrapper";
import { HttpStatusCode } from "@/app/api/httpStatusCodes";
import { ServerError } from "@/app/context/Error/errors/serverError";

global.fetch = jest.fn();

process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

describe("apiWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make a successful GET request", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await apiWrapper("GET", "/test", "Failed to fetch data");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    expect(result).toEqual({
      data: { data: "test data" },
      status: 200,
    });
  });

  it("should make a successful POST request with body", async () => {
    const mockResponse = {
      ok: true,
      status: 201,
      json: jest.fn().mockResolvedValue({ data: "created" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await apiWrapper("POST", "/test", "Failed to create data", {
      body: { name: "test" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "test" }),
      }),
    );
    expect(result).toEqual({
      data: { data: "created" },
      status: 201,
    });
  });

  it("should handle query parameters correctly", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await apiWrapper("GET", "/test", "Failed to fetch data", {
      query: {
        page: 1,
        limit: 10,
        filter: "active",
        tags: ["tag1", "tag2"],
      },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test?page=1&limit=10&filter=active&tags=tag1&tags=tag2",
      expect.any(Object),
    );
  });

  it("should handle undefined query parameters", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await apiWrapper("GET", "/test", "Failed to fetch data", {
      query: {
        page: 1,
        limit: undefined,
        filter: "active",
      },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test?page=1&filter=active",
      expect.any(Object),
    );
  });

  it("should handle request timeout", async () => {
    const mockAbortController = {
      signal: "test-signal",
      abort: jest.fn(),
    };
    global.AbortController = jest.fn(() => mockAbortController) as any;

    jest.useFakeTimers();

    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: "test data" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const promise = apiWrapper(
      "GET",
      "/test",
      "Failed to fetch data",
      undefined,
      5000,
    );

    expect(global.AbortController).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        signal: "test-signal",
      }),
    );

    jest.advanceTimersByTime(5000);

    expect(mockAbortController.abort).toHaveBeenCalled();

    jest.useRealTimers();

    await promise;
  });

  it("should throw ServerError when response is not ok", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue("Resource not found"),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(
      apiWrapper("GET", "/test", "Failed to fetch data"),
    ).rejects.toThrow(ServerError);

    try {
      await apiWrapper("GET", "/test", "Failed to fetch data");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
      expect((error as ServerError).status).toBe(404);
      expect((error as ServerError).message).toBe("Resource not found");
      expect((error as ServerError).endpoint).toBe("/test");
    }
  });

  it("should use general error message when response.text() fails", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockRejectedValue(new Error("Failed to read response")),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(
      apiWrapper("GET", "/test", "General error message"),
    ).rejects.toThrow(ServerError);

    try {
      await apiWrapper("GET", "/test", "General error message");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
      expect((error as ServerError).status).toBe(500);
      expect((error as ServerError).message).toBe("General error message");
    }
  });

  it("should handle network errors", async () => {
    const networkError = new TypeError(
      "NetworkError when attempting to fetch resource",
    );
    (global.fetch as jest.Mock).mockRejectedValue(networkError);

    await expect(
      apiWrapper("GET", "/test", "Failed to fetch data"),
    ).rejects.toThrow(ServerError);

    try {
      await apiWrapper("GET", "/test", "Failed to fetch data");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
      expect((error as ServerError).status).toBe(
        HttpStatusCode.ServiceUnavailable,
      );
      expect((error as ServerError).message).toBe("Network error occurred");
    }
  });

  it("should handle other errors", async () => {
    const otherError = new Error("Some other error");
    (global.fetch as jest.Mock).mockRejectedValue(otherError);

    await expect(
      apiWrapper("GET", "/test", "General error message"),
    ).rejects.toThrow(ServerError);

    try {
      await apiWrapper("GET", "/test", "General error message");
    } catch (error) {
      expect(error).toBeInstanceOf(ServerError);
      expect((error as ServerError).status).toBe(
        HttpStatusCode.InternalServerError,
      );
      expect((error as ServerError).message).toBe("General error message");
    }
  });
});
