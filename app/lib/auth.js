import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

const ACCESS_TOKEN_DURATION = Number.parseInt(process.env.ACCESS_TOKEN_MAX_AGE || "900") // 15 minutes in seconds
const REFRESH_TOKEN_DURATION = Number.parseInt(process.env.REFRESH_TOKEN_MAX_AGE || "604800") // 7 days in seconds

// Store authentication tokens and user data
export const setAuthData = (accessToken, refreshToken, user) => {
  // Set secure based on environment variable or default to false for development
  const secure = process.env.SECURE_COOKIES === "true"

  // Store access token
  Cookies.set("access_token", accessToken, {
    expires: new Date(new Date().getTime() + ACCESS_TOKEN_DURATION * 1000),
    secure: secure,
    sameSite: "lax",
  })

  // Store refresh token
  Cookies.set("refresh_token", refreshToken, {
    expires: new Date(new Date().getTime() + REFRESH_TOKEN_DURATION * 1000),
    secure: secure,
    sameSite: "lax",
  })

  // Store user data
  Cookies.set("user", JSON.stringify(user), {
    expires: new Date(new Date().getTime() + REFRESH_TOKEN_DURATION * 1000),
    secure: secure,
    sameSite: "lax",
  })

  if (typeof window !== "undefined") {
    window.authTimeout = setTimeout(
      () => {
        refreshAccessToken()
      },
      ACCESS_TOKEN_DURATION * 1000 - 60000,
    ) // Refresh 1 minute before expiration
  }
}

// Refresh the access token using the refresh token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get("refresh_token")

    if (!refreshToken) {
      logout()
      return
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      throw new Error("Token refresh failed")
    }

    const data = await response.json()
    const { access } = data

    // Update access token
    const secure = process.env.SECURE_COOKIES === "true"
    Cookies.set("access_token", access, {
      expires: new Date(new Date().getTime() + ACCESS_TOKEN_DURATION * 1000),
      secure: secure,
      sameSite: "lax",
    })

    // Reset timeout for next refresh
    if (typeof window !== "undefined") {
      if (window.authTimeout) {
        clearTimeout(window.authTimeout)
      }

      window.authTimeout = setTimeout(
        () => {
          refreshAccessToken()
        },
        ACCESS_TOKEN_DURATION * 1000 - 60000,
      ) // Refresh 1 minute before expiration
    }

    return access
  } catch (error) {
    console.error("Error refreshing token:", error)
    logout()
    return null
  }
}

// Refresh the auto-logout timer on user activity
export const refreshAuthTimeout = () => {
  if (typeof window !== "undefined") {
    // Clear existing timeout
    if (window.authTimeout) {
      clearTimeout(window.authTimeout)
    }

    // Set new timeout for token refresh
    window.authTimeout = setTimeout(
      () => {
        refreshAccessToken()
      },
      ACCESS_TOKEN_DURATION * 1000 - 60000,
    ) // Refresh 1 minute before expiration
  }
}

// Clear auth data and redirect to login
export const logout = async () => {
  try {
    // Call logout API endpoint
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error during logout:", error)
  } finally {
    // Remove cookies regardless of API call success
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    Cookies.remove("user")

    if (typeof window !== "undefined") {
      // Clear timeout
      if (window.authTimeout) {
        clearTimeout(window.authTimeout)
      }

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
  }
}

// Get current user from cookie
export const getCurrentUser = () => {
  const userCookie = Cookies.get("user")
  if (!userCookie) return null

  try {
    return JSON.parse(userCookie)
  } catch (e) {
    console.error("Error parsing user data:", e)
    return null
  }
}

// Get access token
export const getAccessToken = () => {
  return Cookies.get("access_token")
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const accessToken = Cookies.get("access_token")
  const refreshToken = Cookies.get("refresh_token")
  const user = Cookies.get("user")

  return !!accessToken && !!refreshToken && !!user
}

// Check if access token is expired
export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    return decoded.exp < currentTime
  } catch (error) {
    console.error("Error decoding token:", error)
    return true
  }
}

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getCurrentUser()
  return user && user.role === requiredRole
}

// Check if user has any of the specified roles
export const hasAnyRole = (allowedRoles) => {
  const user = getCurrentUser()
  return user && allowedRoles.includes(user.role)
}

// Initialize idle timer to track user inactivity
export const initIdleTimer = () => {
  if (typeof window !== "undefined") {
    // Define events to reset the idle timer
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, refreshAuthTimeout)
    })

    // Initial setup of timeout
    refreshAuthTimeout()

    // Return cleanup function
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, refreshAuthTimeout)
      })

      if (window.authTimeout) {
        clearTimeout(window.authTimeout)
      }
    }
  }

  return () => {}
}
