import { NextRequest, NextResponse } from "next/server"
import { forwardableAuthHeaders, newsProxyBase } from "../proxy-utils"

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString()
  const target = `${newsProxyBase()}/news/published${qs ? `?${qs}` : ""}`

  try {
    const upstream = await fetch(target, {
      headers: forwardableAuthHeaders(request),
      cache: "no-store",
    })
    const body = await upstream.text()
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("public news published proxy error:", target, e)
    return NextResponse.json(
      { code: 502, message: "Khong ket noi duoc news-service" },
      { status: 502 }
    )
  }
}
