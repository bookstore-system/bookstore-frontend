/**
 * Đọc tin công khai qua Next.js proxy (same-origin) — tránh CORS và gateway 401 cho guest.
 */

import { newsService, type NewsItem, type Page } from "./services/news.service"

const PUBLIC_PROXY = "/api/public/news"

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string" && data.message.trim()) {
        return data.message
      }
      if ("error" in data && typeof data.error === "string" && data.error.trim()) {
        return data.error
      }
    }
  } catch {
    // Ignore JSON parsing failures and fall back to status-based messages.
  }

  if (response.status === 401) {
    return "Không thể tải tin tức công khai do lỗi xác thực ở proxy."
  }
  if (response.status === 404) {
    return "Không tìm thấy tin tức."
  }
  if (response.status >= 500) {
    return "Không thể tải tin tức do máy chủ tạm thời không phản hồi."
  }

  return `Không thể tải tin tức (HTTP ${response.status}).`
}

async function parseApiResult<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const data = await response.json()
  if (data && typeof data === "object" && "result" in data) {
    return data.result as T
  }
  if (data && typeof data === "object" && "data" in data && "code" in data) {
    return data.data as T
  }
  return data as T
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken")
    if (token) headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/** Chi tiết tin — guest/admin qua proxy; admin có token gửi kèm Bearer. */
export async function fetchPublicNewsById(id: string): Promise<NewsItem | null> {
  if (typeof window !== "undefined" && localStorage.getItem("authToken")) {
    try {
      return await newsService.getById(id)
    } catch (e) {
      console.warn("getById via gateway failed, using public proxy:", e)
    }
  }

  const response = await fetch(`${PUBLIC_PROXY}/${id}`, {
    headers: authHeaders(),
  })
  return parseApiResult<NewsItem>(response)
}

export interface PublishedNewsParams {
  page: number
  size: number
  keyword?: string
  category?: string
  tag?: string
  sortBy?: string
  sortOrder?: string
}

export interface PopularNewsTag {
  tag: string
  searchCount: number
}

/** Danh sách tin PUBLISHED cho trang /news (lọc + sort phía server). */
export async function fetchPublishedNewsPage(
  params: PublishedNewsParams
): Promise<Page<NewsItem> | null> {
  const qs = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sortBy: params.sortBy || "createdAt",
    sortOrder: params.sortOrder || "desc",
  })
  if (params.keyword?.trim()) qs.set("keyword", params.keyword.trim())
  if (params.category?.trim()) qs.set("category", params.category.trim())
  if (params.tag?.trim()) qs.set("tag", params.tag.trim())

  const response = await fetch(`${PUBLIC_PROXY}/published?${qs.toString()}`, {
    headers: authHeaders(),
  })
  return parseApiResult<Page<NewsItem>>(response)
}

export async function fetchPopularNewsTags(limit = 6): Promise<PopularNewsTag[]> {
  const qs = new URLSearchParams({
    limit: String(limit),
  })

  const response = await fetch(`${PUBLIC_PROXY}/popular-tags?${qs.toString()}`, {
    headers: authHeaders(),
  })
  const result = await parseApiResult<PopularNewsTag[] | null>(response)
  return result ?? []
}

export async function trackNewsTagSearch(tag: string): Promise<void> {
  const response = await fetch(`${PUBLIC_PROXY}/tag-searches`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ tag }),
  })

  await parseApiResult<null>(response)
}
