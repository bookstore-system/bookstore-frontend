/**
 * News Service
 * Handles all news-related API calls
 */

import { apiClient } from "../api-client"

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface NewsItem {
  newsID: string
  title: string
  summary?: string | null
  content: string
  category: string
  tags: string[]
  views: number
  featured: boolean
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | string
  createdAt: string
  updatedAt?: string
  publishedAt?: string | null
  authorName?: string
  authorId?: string
  coverImage?: string | null
  metadata?: unknown
  images?: Array<{ id: number; url: string; priority: number }>
}

export interface UpdateNewsRequest {
  title: string
  summary?: string | null
  content: string
  category: string
  tags: string[]
  featured: boolean
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | string
  coverImage?: string | null
}

// News Category Stats
export interface NewsByCategoryStats {
  category: string
  count: number
  percentage: number
}

// Top Viewed News
export interface TopViewedNews {
  id: string
  title: string
  views: number
  category: string
  publishedAt: string
}

// Views Trend Data
export interface ViewsTrendData {
  date: string
  views: number
  newsCount: number
}

// News Statistics Response (phù hợp với Backend NewsStatsResponse.java)
export interface NewsStatsResponse {
  totalNews: number
  publishedNews: number
  draftNews: number
  archivedNews: number
  featuredNews: number
  newNewsThisMonth: number
  newNewsThisWeek: number
  newNewsToday: number
  totalViews: number
  avgViewsPerNews: number
  totalComments: number
  newsByCategory: NewsByCategoryStats[]
  topViewedNews: TopViewedNews[]
  viewsTrend: ViewsTrendData[]
  newsGrowthPercentage: number
  viewsGrowthPercentage: number
}

export interface NewsListParams {
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: string
  sort?: string
  order?: string
  keyword?: string
  category?: string
  status?: string
  tag?: string
  featured?: boolean
}

export const newsService = {
  async getStatistics(): Promise<NewsStatsResponse> {
    return apiClient.get<NewsStatsResponse>("/news/statistics")
  },

  /** Admin: tìm kiếm nâng cao (mọi trạng thái). */
  async list(params: NewsListParams): Promise<Page<NewsItem>> {
    return apiClient.get<Page<NewsItem>>("/news/advanced-search", params)
  },

  /** Admin: danh sách có lọc featured/status (GET /news). */
  async listAdmin(params: NewsListParams): Promise<Page<NewsItem>> {
    return apiClient.get<Page<NewsItem>>("/news", params)
  },

  /** Guest: chỉ tin PUBLISHED. */
  async listPublished(params?: { page?: number; size?: number }): Promise<Page<NewsItem>> {
    return apiClient.get<Page<NewsItem>>("/news/published", params)
  },

  /** Admin: mọi trạng thái. Guest không gọi qua apiClient (không token). */
  async getById(id: string): Promise<NewsItem> {
    return apiClient.get<NewsItem>(`/news/${id}`)
  },

  async update(id: string, body: UpdateNewsRequest): Promise<NewsItem> {
    return apiClient.put<NewsItem>(`/news/${id}`, body)
  },

  async archive(id: string): Promise<NewsItem> {
    return apiClient.put<NewsItem>(`/news/${id}/archive`)
  },

  async publish(id: string): Promise<NewsItem> {
    return apiClient.put<NewsItem>(`/news/${id}/publish`)
  },

  async restore(id: string): Promise<NewsItem> {
    return apiClient.put<NewsItem>(`/news/${id}/restore`)
  },

  async remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/news/${id}`)
  },
}
