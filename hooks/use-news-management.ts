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

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await newsService.getStatistics()
      setStats(response)
    } catch (err) {
      console.error("Failed to load news statistics:", err)
      setStats(null)
      setError(
        err instanceof Error ? err.message : "Không thể tải thống kê tin tức"
      )
    } finally {
      setIsLoading(false)
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
