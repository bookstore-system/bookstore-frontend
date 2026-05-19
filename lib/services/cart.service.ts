/**
 * Cart Service
 * Handles all shopping cart-related API calls
 * Aligned with backend CartController API
 */

import { apiClient } from "../api-client"
import { booksService } from "./books.service"

// Matches CartItemResponse from backend
export interface CartItem {
  itemId: string
  bookId: string
  bookTitle: string
  bookIsbn: string
  bookPrice: number
  bookDiscountPrice: number | null
  bookImageUrl: string
  quantity: number
  subTotal: number
  stockQuantity: number
}

// Matches CartResponse from backend
export interface Cart {
  cartId: string
  userId: string
  items: CartItem[]
  itemCount: number
  totalPrice: number
}

// Request types
export interface AddToCartRequest {
  bookId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

// Response types matching backend DTOs
export interface AddToCartResponse {
  cartItem: CartItem
  cartItemCount: number
}

export interface UpdateCartResponse {
  cartItem: CartItem
  totalPrice: number
}

export interface RemoveCartResponse {
  cartItemCount: number
  totalPrice: number
}

/** Bổ sung ảnh từ book-service khi cart-service chưa trả bookImageUrl (giỏ cũ / image chưa sync). */
export async function enrichCartWithImages(cart: Cart): Promise<Cart> {
  if (!cart.items?.length) {
    return cart
  }

  const items = await Promise.all(
    cart.items.map(async (item) => {
      if (item.bookImageUrl?.trim()) {
        return item
      }
      try {
        const book = await booksService.getBookById(item.bookId)
        const url = book.mainImageUrl || book.imageUrls?.[0]
        return url ? { ...item, bookImageUrl: url } : item
      } catch {
        return item
      }
    })
  )

  return { ...cart, items }
}

export const cartService = {
  /**
   * Get current user's cart
   * GET /api/cart
   */
  async getCart(): Promise<Cart> {
    const cart = await apiClient.get<Cart>("/cart")
    return enrichCartWithImages(cart)
  },

  /**
   * Add item to cart
   * POST /api/cart/add
   */
  async addToCart(data: AddToCartRequest): Promise<AddToCartResponse> {
    const response = await apiClient.post<AddToCartResponse>("/cart/add", data)
    if (!response.cartItem.bookImageUrl?.trim()) {
      try {
        const book = await booksService.getBookById(response.cartItem.bookId)
        const url = book.mainImageUrl || book.imageUrls?.[0]
        if (url) {
          response.cartItem.bookImageUrl = url
        }
      } catch {
        /* ignore */
      }
    }
    return response
  },

  /**
   * Update cart item quantity
   * PUT /api/cart/update/{bookId}
   */
  async updateCartItem(bookId: string, data: UpdateCartItemRequest): Promise<UpdateCartResponse> {
    return apiClient.put<UpdateCartResponse>(`/cart/update/${bookId}`, data)
  },

  /**
   * Remove item from cart
   * DELETE /api/cart/remove/{bookId}
   */
  async removeCartItem(bookId: string): Promise<RemoveCartResponse> {
    return apiClient.delete<RemoveCartResponse>(`/cart/remove/${bookId}`)
  },

  /**
   * Clear all items from cart
   * DELETE /api/cart/clear
   */
  async clearCart(): Promise<void> {
    return apiClient.delete<void>("/cart/clear")
  },

  /**
   * Get cart item count
   * GET /api/cart/count
   */
  async getCartCount(): Promise<number> {
    return apiClient.get<number>("/cart/count")
  },

  /**
   * Check if a book is in cart
   * GET /api/cart/check/{bookId}
   */
  async checkBookInCart(bookId: string): Promise<boolean> {
    return apiClient.get<boolean>(`/cart/check/${bookId}`)
  },
}
