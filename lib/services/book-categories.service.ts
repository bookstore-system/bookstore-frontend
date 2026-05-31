/**
 * Categories từ bookstore-book-service.
 * - GET /api/v1/categories — danh sách (public)
 * - POST /api/v1/admin/categories — tạo thể loại (admin)
 */

import { apiClient } from "../api-client"

export interface BookCategoryOption {
  id: string
  name: string
  parentCategoryId?: string | null
}

/** Khớp AdminCreateCategoryRequest (book-service) */
export interface AdminCreateCategoryBody {
  name: string
  description?: string
  parentCategoryId?: string
}

export const bookCategoriesService = {
  async list(): Promise<BookCategoryOption[]> {
    return apiClient.get<BookCategoryOption[]>("/categories")
  },

  async create(body: AdminCreateCategoryBody): Promise<BookCategoryOption> {
    return apiClient.post<BookCategoryOption>("/admin/categories", body)
  },
}
