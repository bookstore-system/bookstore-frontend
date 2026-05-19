/**
 * Custom Hook: use-news-management
 * Quản lý state và logic cho News Management
 */

import { useState, useEffect, useCallback } from 'react'
import { newsService, NewsStatsResponse } from '@/lib/services/news.service'

const EMPTY_NEWS_STATS: NewsStatsResponse = {
  totalNews: 0,
  publishedNews: 0,
  draftNews: 0,
  archivedNews: 0,
  featuredNews: 0,
  newNewsThisMonth: 0,
  newNewsThisWeek: 0,
  newNewsToday: 0,
  totalViews: 0,
  avgViewsPerNews: 0,
  totalComments: 0,
  newsByCategory: [],
  topViewedNews: [],
  viewsTrend: [],
  newsGrowthPercentage: 0,
  viewsGrowthPercentage: 0,
}

export function useNewsManagement() {
  const [stats, setStats] = useState<NewsStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true)

      const response = await newsService.getStatistics()

      // Backend trả về: { code: 200, message: "...", result: NewsStatsResponse }
      const apiResponse = response as any

      if (apiResponse?.result) {
        setStats(apiResponse.result)
      } else if (apiResponse?.data) {
        setStats(apiResponse.data)
      } else {
        setStats(response)
      }
    } catch (err) {
      console.error('Failed to load news statistics:', err)
      setStats(EMPTY_NEWS_STATS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return {
    // State
    stats,
    isLoading,

    // Actions
    refreshStats: fetchStatistics,
  }
}
