import { apiWrapper } from "@/ui/common/api/apiWrapper";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";

const mockFetch = jest.fn();
global.fetch = mockFetch;

process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

// Helper to create mock responses with the right structure
function createMockResponse(options: {
  ok: boolean;
  status: number;
  body?: any;
  statusText?: string;
}) {
  const { ok, status, body, statusText = "OK" } = options;

  return {
    ok,
    status,
    statusText,
    headers: {
      entries: jest.fn().mockReturnValue([]),
    },
    json: jest.fn().mockResolvedValue(body),
    text: jest
      .fn()
      .mockResolvedValue(
        typeof body === "string" ? body : JSON.stringify(body),
      ),
  };
}

describe("apiWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make a successful GET request", async () => {
    const responseBody = { data: "test data" };
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      body: responseBody,
    });
    mockFetch.mockResolvedValue(mockResponse);

    const result = await apiWrapper("GET", "/test", "Failed to fetch data");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(result).toEqual({
      data: responseBody,
      status: 200,
    });
  });

  it("should make a successful POST request with body", async () => {
    const responseBody = { data: "created" };
    const mockResponse = createMockResponse({
      ok: true,
      status: 201,
      body: responseBody,
    });
    mockFetch.mockResolvedValue(mockResponse);

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
      data: responseBody,
      status: 201,
    });
  });

  it("should handle query parameters correctly", async () => {
    const responseBody = { data: "test data" };
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      body: responseBody,
    });
    mockFetch.mockResolvedValue(mockResponse);

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
    const responseBody = { data: "test data" };
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      body: responseBody,
    });
    mockFetch.mockResolvedValue(mockResponse);

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
    const mockTimeoutSignal = "test-timeout-signal";
    global.AbortSignal = {
      ...global.AbortSignal,
      timeout: jest.fn().mockReturnValue(mockTimeoutSignal),
    } as any;

    const responseBody = { data: "test data" };
    const mockResponse = createMockResponse({
      ok: true,
      status: 200,
      body: responseBody,
    });
    mockFetch.mockResolvedValue(mockResponse);

    const promise = apiWrapper(
      "GET",
      "/test",
      "Failed to fetch data",
      undefined,
      5000,
    );

    expect(global.AbortSignal.timeout).toHaveBeenCalledWith(5000);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/test",
      expect.objectContaining({
        signal: mockTimeoutSignal,
      }),
    );

    await promise;
  });

  it("should throw ClientError when response is not ok", async () => {
    const errorText = "Resource not found";
    const mockResponse = createMockResponse({
      ok: false,
      status: 404,
      body: errorText,
      statusText: "Not Found",
    });

    // Override text method to return the specific error string
    mockResponse.text = jest.fn().mockResolvedValue(errorText);

    mockFetch.mockResolvedValue(mockResponse);

    await expect(
      apiWrapper("GET", "/test", "Failed to fetch data"),
    ).rejects.toThrow(ClientError);

    try {
      await apiWrapper("GET", "/test", "Failed to fetch data");
    } catch (error) {
      expect(error).toBeInstanceOf(ClientError);
      if (error instanceof ClientError) {
        expect(error.errorCode).toBe(ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE);
        expect(error.message).toBe("Error fetching data from the API");
        expect((error.cause as Error).message).toBe(errorText);
      }
    }
  });

  it("should use general error message when response.text() fails", async () => {
    const mockResponse = createMockResponse({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    // Override text method to throw an error
    mockResponse.text = jest
      .fn()
      .mockRejectedValue(new Error("Failed to read response"));

    mockFetch.mockResolvedValue(mockResponse);

    await expect(
      apiWrapper("GET", "/test", "General error message"),
    ).rejects.toThrow(ClientError);

    try {
      await apiWrapper("GET", "/test", "General error message");
    } catch (error) {
      expect(error).toBeInstanceOf(ClientError);
      if (error instanceof ClientError) {
        expect(error.errorCode).toBe(ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE);
        expect(error.message).toBe("Error fetching data from the API");
        expect((error.cause as Error).message).toBe("General error message");
      }
    }
  });

  it("should handle network errors", async () => {
    const networkError = new TypeError(
      "NetworkError when attempting to fetch resource",
    );
    mockFetch.mockRejectedValue(networkError);

    await expect(
      apiWrapper("GET", "/test", "Failed to fetch data"),
    ).rejects.toThrow(ClientError);

    try {
      await apiWrapper("GET", "/test", "Failed to fetch data");
    } catch (error) {
      expect(error).toBeInstanceOf(ClientError);
      if (error instanceof ClientError) {
        expect(error.errorCode).toBe(ERROR_CODES.CONNECTION_ERROR);
        expect(error.message).toBe("Network error occurred");
      }
    }
  });

  it("should handle other errors", async () => {
    const otherError = new Error("Some other error");
    mockFetch.mockRejectedValue(otherError);

    await expect(
      apiWrapper("GET", "/test", "General error message"),
    ).rejects.toThrow(ClientError);

    try {
      await apiWrapper("GET", "/test", "General error message");
    } catch (error) {
      expect(error).toBeInstanceOf(ClientError);
      if (error instanceof ClientError) {
        expect(error.errorCode).toBe(ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE);
        expect(error.message).toBe("Some other error");
      }
    }
  });
});
