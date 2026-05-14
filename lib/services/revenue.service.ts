import { apiClient } from "../api-client";

export interface DailyRevenuePoint {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface PercentageDTO {
    category: string;
    value: number;
}

export interface CategoryPerformanceDTO {
    category: string;
    revenue: number;
    growth: number;
}

export interface RevenueStatisticResponse {
    totalRevenue: number;
    totalOrders: number;
    breakdown: DailyRevenuePoint[];
    revenueByPaymentMethod?: PercentageDTO[];
    categoryPerformance?: CategoryPerformanceDTO[];
}

export const revenueService = {
    /**
     * Get revenue statistics
     * GET /api/admin/statistics/revenue
     */
    async getRevenueStatistics(startDate?: string, endDate?: string): Promise<RevenueStatisticResponse> {
        try {
            return await apiClient.get<RevenueStatisticResponse>("/admin/statistics/revenue", {
                startDate,
                endDate
            });
        } catch (error: any) {
            console.error("Error fetching revenue statistics:", {
                endpoint: "/admin/statistics/revenue",
                startDate,
                endDate,
                error: error.message
            });
            // Return empty data structure to prevent UI errors
            return {
                totalRevenue: 0,
                totalOrders: 0,
                breakdown: [],
                revenueByPaymentMethod: [],
                categoryPerformance: []
            };
        }
    }
};
