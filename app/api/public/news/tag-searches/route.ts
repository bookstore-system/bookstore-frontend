import { NextRequest, NextResponse } from "next/server"
import {
  gatewayProxyBase,
  NEWS_GUEST_SESSION_COOKIE,
  newsProxyBase,
} from "../proxy-utils"

function resolvedGuestSessionId(request: NextRequest): { id: string; isNew: boolean } {
  const existing = request.cookies.get(NEWS_GUEST_SESSION_COOKIE)?.value?.trim()
  if (existing) {
    return { id: existing, isNew: false }
  }
  return { id: crypto.randomUUID(), isNew: true }
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")
  const guestSession = resolvedGuestSessionId(request)
  const targetBase = auth ? gatewayProxyBase() : newsProxyBase()
  const target = `${targetBase}/news/tag-searches`

  try {
    const payload = await request.text()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Guest-Session-Id": guestSession.id,
    }
    if (auth) {
      headers.Authorization = auth
    }

    const upstream = await fetch(target, {
      method: "POST",
      headers,
      body: payload,
      cache: "no-store",
    })

    const body = await upstream.text()
    const response = new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })

    if (guestSession.isNew) {
      response.cookies.set(NEWS_GUEST_SESSION_COOKIE, guestSession.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  } catch (e) {
    console.error("public news tag-search proxy error:", target, e)
    const response = NextResponse.json(
      { code: 502, message: "Khong ket noi duoc news-service" },
      { status: 502 }
    )

    if (guestSession.isNew) {
      response.cookies.set(NEWS_GUEST_SESSION_COOKIE, guestSession.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      })
    }

    return response
  }
}
