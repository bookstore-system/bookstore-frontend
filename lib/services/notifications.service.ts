import { API_BASE_URL } from "../api-client"

export interface NotificationPreferences {
  promotionEmail: boolean
}

export interface UpdateNotificationPreferencesRequest {
  promotionEmail?: boolean
}

function readCurrentUserId(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const storedUser = localStorage.getItem("user") || localStorage.getItem("currentUser")
  if (!storedUser) {
    return null
  }

  try {
    const parsed = JSON.parse(storedUser)
    return typeof parsed?.id === "string" ? parsed.id : null
  } catch {
    return null
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (typeof window === "undefined") {
    return headers
  }

  const token = localStorage.getItem("authToken")
  const userId = readCurrentUserId()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  if (userId) {
    headers["X-User-Id"] = userId
  }

  return headers
}

async function requestPreferences(
  method: "GET" | "PATCH",
  body?: UpdateNotificationPreferencesRequest
): Promise<NotificationPreferences> {
  const response = await fetch(`${API_BASE_URL}/notifications/preferences/me`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || errorData.details || `HTTP Error: ${response.status}`)
  }

  return response.json()
}

export const notificationsService = {
  getMyPreferences(): Promise<NotificationPreferences> {
    return requestPreferences("GET")
  },

  updatePreferences(data: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> {
    return requestPreferences("PATCH", data)
  },
}

