/**
 * Custom Hook: use-news-management
 * Quản lý state và logic cho News Management
 */

import { useState, useEffect, useCallback } from 'react'
import { newsService, NewsStatsResponse } from '@/lib/services/news.service'

export function useNewsManagement() {
  const [stats, setStats] = useState<NewsStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Fetch statistics (retry khi news-service đang khởi động — mvn ~20–90s)
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const maxAttempts = 6
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await newsService.getStatistics()
        setStats(response)
        setIsLoading(false)
        return
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Không thể tải thống kê tin tức"
        const retryable =
          message.includes("500") ||
          message.includes("News-service") ||
          message.includes("Internal Server Error") ||
          message.includes("kết nối")

        if (attempt < maxAttempts && retryable) {
          await sleep(4000)
          continue
        }

        console.error("Failed to load news statistics:", err)
        setStats(null)
        setError(message)
        setIsLoading(false)
        return
      }
    }
  }, [])

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStatistics,
  }
}
