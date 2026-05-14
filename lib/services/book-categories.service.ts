/**
 * Categories từ bookstore-book-service (/api/v1/categories).
 * Tách khỏi categories.service (BFF/monolith giả định nhiều endpoint hơn).
 */

import { apiClient } from "../api-client"

export interface BookCategoryOption {
  id: string
  name: string
}

export interface CreateBookCategoryBody {
  name: string
  description?: string
  /** UUID thể loại cha; bỏ qua nếu là thể loại gốc */
  parentCategoryId?: string
}

export const bookCategoriesService = {
  async list(): Promise<BookCategoryOption[]> {
    return apiClient.get<BookCategoryOption[]>("/categories")
  },

  async create(body: CreateBookCategoryBody): Promise<BookCategoryOption> {
    return apiClient.post<BookCategoryOption>("/categories", body)
  },
}
