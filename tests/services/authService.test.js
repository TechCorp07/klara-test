// __tests__/services/authService.test.js
import { useAuth, AuthProvider } from "../../contexts/AuthContext";
import { renderHook, act } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Create a wrapper with the necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe("Authentication Service", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("login calls the correct endpoint and handles successful response", async () => {
    // Mock successful login response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access: "test-access-token",
        refresh: "test-refresh-token",
        user: { id: 1, name: "Test User" },
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.login({ email: "test@example.com", password: "password" });
    });

    // Verify the correct endpoint was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "password" }),
      })
    );

    // Verify tokens were stored
    expect(localStorage.getItem("access_token")).toBe("test-access-token");
    expect(localStorage.getItem("refresh_token")).toBe("test-refresh-token");

    // Verify user state was updated
    expect(result.current.user).toEqual({ id: 1, name: "Test User" });
    expect(result.current.isAuthenticated).toBe(true);
  });

  test("login handles 2FA requirement", async () => {
    // Mock 2FA required response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        requires2FA: true,
        token: "2fa-verification-token",
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login({ email: "test@example.com", password: "password" });
    });

    // Verify the correct endpoint was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/login"),
      expect.any(Object)
    );

    // Verify 2FA state
    expect(loginResult.requires2FA).toBe(true);
    expect(loginResult.success).toBe(false);
    expect(result.current.requiresTwoFactor).toBe(true);
    expect(result.current.user).toBeNull();
  });

  test("verify2FA calls the correct endpoint and handles successful response", async () => {
    // Setup 2FA state
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    
    // Mock 2FA required response for login
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        requires2FA: true,
        token: "2fa-verification-token",
      }),
    });
    
    await act(async () => {
      await result.current.login({ email: "test@example.com", password: "password" });
    });
    
    // Reset mock for verify2FA
    fetch.mockReset();
    
    // Mock successful 2FA verification
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access: "2fa-access-token",
        refresh: "2fa-refresh-token",
        user: { id: 1, name: "Test User", two_factor_enabled: true },
      }),
    });
    
    await act(async () => {
      await result.current.verify2FA("123456");
    });
    
    // Verify the correct endpoint was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/verify-2fa"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("123456"),
      })
    );
    
    // Verify tokens were stored
    expect(localStorage.getItem("access_token")).toBe("2fa-access-token");
    expect(localStorage.getItem("refresh_token")).toBe("2fa-refresh-token");
    
    // Verify user state was updated
    expect(result.current.user).toEqual({ id: 1, name: "Test User", two_factor_enabled: true });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.requiresTwoFactor).toBe(false);
  });

  test("logout calls the correct endpoint and clears state", async () => {
    // Setup authenticated state
    localStorage.setItem("access_token", "test-access-token");
    localStorage.setItem("refresh_token", "test-refresh-token");
    
    // Mock successful logout
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    
    // Set user manually since we're not mocking the full login flow
    act(() => {
      result.current.user = { id: 1, name: "Test User" };
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    // Verify the correct endpoint was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/logout"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      })
    );
    
    // Verify tokens were cleared
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    
    // Verify user state was cleared
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  // Additional tests would cover:
  // - updateProfile
  // - setup2FA, confirm2FA, disable2FA
  // - forgotPassword, resetPassword
  // - requestEmailVerification, verifyEmail
  // - updateConsent
  // - Error handling for all operations
});
