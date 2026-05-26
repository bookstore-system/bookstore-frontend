import { NextRequest, NextResponse } from "next/server"
import { forwardableAuthHeaders, newsProxyBase } from "../proxy-utils"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const target = `${newsProxyBase()}/news/${id}`

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
    console.warn("public news detail proxy failed:", target, e)
    return NextResponse.json(
      { code: 502, message: "Khong ket noi duoc news-service" },
      { status: 502 }
    )
  }
}
