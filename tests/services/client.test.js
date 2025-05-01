// __tests__/services/client.test.js
import { apiRequest, getApiBaseUrl } from "../../api/client";

// Mock the global fetch function
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window location
Object.defineProperty(window, "location", {
  value: {
    hostname: "klararety.com", // Simulate production environment
    origin: "https://klararety.com",
  },
  writable: true,
});

describe("API Client", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test("getApiBaseUrl returns correct production URL", () => {
    window.location.hostname = "klararety.com";
    expect(getApiBaseUrl()).toBe("https://api.klararety.com/api");
  });

  test("getApiBaseUrl returns correct local URL", () => {
    window.location.hostname = "localhost";
    // Assuming NEXT_PUBLIC_API_URL is not set, it defaults to localhost:8000
    // Note: The client.js default was NOT updated to include /api for local
    // This test reflects the *current* state after updates, which might need fixing
    expect(getApiBaseUrl()).toBe("http://localhost:8000"); 
    // TODO: Verify if local URL should also include /api/
  });

  test("apiRequest makes a GET request correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "success" }),
    });

    const response = await apiRequest("GET", "/test-endpoint");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.klararety.com/api/test-endpoint",
      expect.objectContaining({ method: "GET" })
    );
    expect(response).toEqual({ data: "success" });
  });

  test("apiRequest makes a POST request with data correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 123 }),
    });
    const postData = { name: "Test Item" };

    const response = await apiRequest("POST", "/items", postData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.klararety.com/api/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(postData),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
    expect(response).toEqual({ id: 123 });
  });

  test("apiRequest includes Authorization header when token exists", async () => {
    localStorage.setItem("access_token", "test-token");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "protected" }),
    });

    await apiRequest("GET", "/protected-resource");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  test("apiRequest handles fetch error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(apiRequest("GET", "/error-endpoint")).rejects.toThrow(
      "Network error"
    );
  });

  test("apiRequest handles non-ok response", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not Found" }),
    });

    await expect(apiRequest("GET", "/not-found")).rejects.toThrow("Not Found");
  });

  test("apiRequest handles non-ok response with custom error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}), // Simulate empty error body
    });

    await expect(
      apiRequest("GET", "/server-error", null, {
        errorMessage: "Custom server error message",
      })
    ).rejects.toThrow("Custom server error message");
  });
});

