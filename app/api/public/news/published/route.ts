import { NextRequest, NextResponse } from "next/server"

function gatewayBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  const url = raw.trim().replace(/\/$/, "")
  return /\/api(\/v\d+)?$/i.test(url) ? url : `${url}/api/v1`
}

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString()
  const target = `${gatewayBase()}/news/published${qs ? `?${qs}` : ""}`

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
      { code: 502, message: "Khong ket noi duoc api-gateway" },
      { status: 502 }
    )
  }
}
