import { NextRequest, NextResponse } from "next/server"

function gatewayBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
  const url = raw.trim().replace(/\/$/, "")
  return /\/api(\/v\d+)?$/i.test(url) ? url : `${url}/api/v1`
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const auth = request.headers.get("authorization")
  const target = `${gatewayBase()}/news/${id}`

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (auth) headers.Authorization = auth

    const upstream = await fetch(target, { headers, cache: "no-store" })
    const body = await upstream.text()
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    console.warn("public news detail proxy failed:", target, e)
    return NextResponse.json(
      { code: 502, message: "Khong ket noi duoc api-gateway" },
      { status: 502 }
    )
  }
}
