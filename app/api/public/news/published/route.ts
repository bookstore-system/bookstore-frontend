import { NextRequest, NextResponse } from "next/server"

function newsServerBase(): string {
  const raw =
    process.env.NEWS_SERVER_URL ||
    process.env.NEXT_PUBLIC_NEWS_DIRECT_URL ||
    "http://localhost:8089/api/v1"
  const url = raw.trim().replace(/\/$/, "")
  return /\/api(\/v\d+)?$/i.test(url) ? url : `${url}/api/v1`
}

/** Proxy GET /news/published — tránh CORS & gateway 401 cho guest. */
export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString()
  const target = `${newsServerBase()}/news/published${qs ? `?${qs}` : ""}`

  try {
    const upstream = await fetch(target, { cache: "no-store" })
    const body = await upstream.text()
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("public news published proxy error:", e)
    return NextResponse.json(
      { code: 502, message: "Không kết nối được news-service" },
      { status: 502 }
    )
  }
}
