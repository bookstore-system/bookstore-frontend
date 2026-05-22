/**
 * Reviews Service
 * Handles all book review-related API calls
 */

import { apiClient, PaginatedResponse } from "../api-client"

export interface Review {
  reviewID: string
  userId: string
  bookId?: string
  orderId?: string
  userName?: string | null
  userAvatar?: string | null
  rating: number
  comment: string
  isVerifiedPurchase: boolean
  createdAt: string
}

type ReviewRaw = Review & {
  userID?: string
  bookID?: string
  orderID?: string
}

/** Backend có thể trả userName null nếu review không lưu tên khi tạo. */
export function getReviewDisplayName(review: Pick<Review, "userName" | "userId">): string {
  const name = review.userName?.trim()
  if (name) return name
  return "Người dùng"
}

export function getReviewInitial(review: Pick<Review, "userName" | "userId">): string {
  const name = review.userName?.trim()
  if (name) return name.charAt(0).toUpperCase()
  const id = review.userId?.trim()
  if (id) return id.charAt(0).toUpperCase()
  return "?"
}

export function normalizeReview(raw: ReviewRaw): Review {
  return {
    ...raw,
    reviewID: raw.reviewID ?? "",
    userId: raw.userId ?? raw.userID ?? "",
    bookId: raw.bookId ?? raw.bookID ?? "",
    orderId: raw.orderId ?? raw.orderID ?? "",
    userName: raw.userName ?? null,
    userAvatar: raw.userAvatar ?? null,
    isVerifiedPurchase: raw.isVerifiedPurchase ?? false,
  }
}

export interface CreateReviewRequest {
  bookId: string
  orderId: string
  rating: number
  comment: string
}

export interface ReviewFilters {
  page?: number
  pageSize?: number
  bookId?: string
  userId?: string
  rating?: number
  sortBy?: "createdAt" | "helpful" | "rating"
  sortOrder?: "asc" | "desc"
}

export const reviewsService = {
  /**
   * Get paginated list of reviews
   */
  async getReviews(filters?: ReviewFilters): Promise<PaginatedResponse<Review>> {
    return apiClient.get<PaginatedResponse<Review>>("/reviews", filters)
  },

  /**
   * Get reviews for a specific book
   */
  async getBookReviews(bookId: string, filters?: Omit<ReviewFilters, "bookId">): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<{
      content: Review[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }>(`/reviews/book/${bookId}`, filters)

    // apiClient already unwraps the result
    return {
      content: (response.content || []).map(normalizeReview),
      currentPage: response.number || 0,
      totalPages: response.totalPages || 0,
      totalElements: response.totalElements || 0,
    }
  },

  /**
   * Get current user's reviews
   */
  async getMyReviews(filters?: Omit<ReviewFilters, "userId">): Promise<PaginatedResponse<Review>> {
    return apiClient.get<PaginatedResponse<Review>>("/reviews/my-reviews", filters)
  },

  /**
   * Create a new review (mỗi đơn hàng × mỗi sách tối đa một lần).
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const created = await apiClient.post<ReviewRaw>("/reviews/book/add", data)
    return normalizeReview(created)
  },

  /** Toàn bộ đánh giá đã gửi trong đơn (trang chi tiết đơn hàng). */
  async getReviewsByOrder(orderId: string): Promise<Review[]> {
    const list = await apiClient.get<ReviewRaw[]>(`/reviews/order/${orderId}`)
    return Array.isArray(list) ? list.map(normalizeReview) : []
  },

  /**
   * Update a review
   */
  async updateReview(id: string, data: Partial<Omit<CreateReviewRequest, "bookId">>): Promise<Review> {
    return apiClient.put<Review>(`/reviews/${id}`, data)
  },

  /**
   * Delete a review
   */
  async deleteReview(id: string): Promise<void> {
    return apiClient.delete<void>(`/reviews/${id}`)
  },

  /**
   * Mark a review as helpful
   */
  async markHelpful(id: string): Promise<Review> {
    return apiClient.post<Review>(`/reviews/${id}/helpful`, {})
  },

  /**
   * Get book rating summary
   */
  async getBookRatingSummary(bookId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }> {
    return apiClient.get(`/reviews/book/${bookId}/summary`)
  },
}
