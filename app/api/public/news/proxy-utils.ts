import type { NextRequest } from "next/server"

export const NEWS_GUEST_SESSION_COOKIE = "news_guest_session_id"

function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "")
  if (/\/api(\/v\d+)?$/i.test(trimmed)) {
    return trimmed
  }
  return `${trimmed}/api/v1`
}

export function newsProxyBase(): string {
  const serverBase = process.env.NEWS_SERVER_URL?.trim()
  if (serverBase) {
    return normalizeApiBase(serverBase)
  }

  return gatewayProxyBase()
}

export function gatewayProxyBase(): string {
  const gatewayBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  return normalizeApiBase(gatewayBase)
}

export function forwardableAuthHeaders(request: NextRequest): Record<string, string> {
  const auth = request.headers.get("authorization")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (auth) {
    headers.Authorization = auth
  }

  return headers
}
