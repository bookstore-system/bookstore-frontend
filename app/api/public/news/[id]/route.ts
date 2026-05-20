import { NextRequest, NextResponse } from "next/server"

function newsServerBase(): string {
  const raw =
    process.env.NEWS_SERVER_URL ||
    process.env.NEXT_PUBLIC_NEWS_DIRECT_URL ||
    "http://localhost:8089/api/v1"
  const url = raw.trim().replace(/\/$/, "")
  return /\/api(\/v\d+)?$/i.test(url) ? url : `${url}/api/v1`
}

function gatewayBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  const url = raw.trim().replace(/\/$/, "")
  return /\/api(\/v\d+)?$/i.test(url) ? url : `${url}/api/v1`
}

/** Proxy GET /news/{id} — có Bearer thì thử gateway trước (admin xem draft). */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const auth = request.headers.get("authorization")

  const targets: string[] = []
  if (auth?.startsWith("Bearer ")) {
    targets.push(`${gatewayBase()}/news/${id}`)
  }
  targets.push(`${newsServerBase()}/news/${id}`)

  for (const target of targets) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (auth) headers.Authorization = auth

      const upstream = await fetch(target, { headers, cache: "no-store" })
      if (upstream.ok) {
        const body = await upstream.text()
        return new NextResponse(body, {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (e) {
      console.warn("public news detail proxy attempt failed:", target, e)
    }
  }

  return NextResponse.json(
    { code: 404, message: "Không tìm thấy tin tức" },
    { status: 404 }
  )
}
