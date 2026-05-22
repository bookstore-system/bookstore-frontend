/**
 * Orders Service
 * Handles all order-related API calls matching the backend OrderController
 */

import { apiClient } from "../api-client"

// --- DTO Interfaces ---



export interface OrderItemResponse {
  id: string
  bookId: string
  bookTitle: string
  bookIsbn: string
  bookImageUrl: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "COMPLETED"

export interface OrderResponse {
  id: string
  orderCode: string
  orderDate: string // LocalDateTime
  status: OrderStatus
  subtotal: number
  total: number
  paymentMethod: string
  taxAmount: number
  shippingFee: number

  // Promotion info
  promotionCode?: string
  promotionName?: string
  discountPercent?: number
  discountAmount?: number

  // Customer info
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerMembershipTier: string

  // Shipping info (Flattened)
  recipientName?: string
  recipientPhone?: string
  shippingAddress?: string // fullAddress
  shippingProvince?: string
  shippingDistrict?: string
  shippingWard?: string
  shippingNote?: string

  items: OrderItemResponse[]
  note?: string
}

export interface CheckoutRequest {
  addressId: string
  paymentMethod: string // "COD", "VNPay", "ZaloPay", "MoMo"
  note?: string
  discountCode?: string
  bookIds?: string[] // If null/empty -> checkout all cart
  shippingFee?: number
  redirectUrl?: string // URL to redirect back after payment
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

export interface PaymentResponse {
  paymentId: string
  orderId: string
  paymentMethod: string
  amount: number
  paymentDate: string
  status: PaymentStatus
}

export interface CreatePaymentResponse {
  code: string
  message: string
  paymentUrl: string
  payment: PaymentResponse
}

export type CheckoutSagaStatus =
  | "STARTED"
  | "ORDER_CREATED"
  | "STOCK_RESERVED"
  | "PROMOTION_RESERVED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SKIPPED"
  | "PAYMENT_COMPLETED"
  | "SHIPPING_CREATED"
  | "ORDER_CONFIRMED"
  | "STOCK_CONFIRMED"
  | "PROMOTION_CONFIRMED"
  | "CART_CLEARED"
  | "COMPLETED"
  | "COMPENSATING"
  | "FAILED"
  | "EXPIRED"

export interface CheckoutSagaResponse {
  sagaId: string
  orderId?: string
  status: CheckoutSagaStatus
  totalAmount?: number
  paymentUrl?: string
  lastError?: string
  createdAt?: string
  updatedAt?: string
}

// Spring Data Page interface
export interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number // current page index (0-based)
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

const CHECKOUT_POLL_DELAY_MS = 1000
const CHECKOUT_POLL_MAX_ATTEMPTS = 20

function normalizeOrder(order: OrderResponse): OrderResponse {
  const id = order.id ?? (order as any).orderId ?? ""
  const items = (order.items || []).map((item) => {
    const quantity = item.quantity ?? 0
    const unitPrice = item.unitPrice ?? 0
    return {
      ...item,
      quantity,
      unitPrice,
      subtotal: item.subtotal ?? quantity * unitPrice,
    }
  })

  const itemsSubtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const shippingFee = order.shippingFee ?? 0
  const taxAmount = order.taxAmount ?? 0
  const discountAmount = order.discountAmount ?? 0
  const total = order.total ?? (order as any).totalAmount ?? Math.max(0, itemsSubtotal + shippingFee + taxAmount - discountAmount)
  const subtotal = order.subtotal ?? (itemsSubtotal || Math.max(0, total + discountAmount - shippingFee - taxAmount))

  return {
    ...order,
    id,
    orderCode: order.orderCode ?? (id ? id.substring(0, 8) : ""),
    customerId: order.customerId ?? "",
    customerName: order.customerName ?? order.recipientName ?? "Khách hàng",
    customerEmail: order.customerEmail ?? "",
    customerPhone: order.customerPhone ?? order.recipientPhone ?? "",
    customerMembershipTier: order.customerMembershipTier ?? "",
    paymentMethod: order.paymentMethod ?? "",
    items,
    subtotal,
    total,
    shippingFee,
    taxAmount,
    discountAmount,
  }
}

async function waitForCheckoutSaga(
  sagaId: string,
  shouldStop: (saga: CheckoutSagaResponse) => boolean
): Promise<CheckoutSagaResponse> {
  let saga = await apiClient.get<CheckoutSagaResponse>(`/checkout/${sagaId}`)

  for (let attempt = 0; attempt < CHECKOUT_POLL_MAX_ATTEMPTS; attempt++) {
    if (saga.status === "FAILED" || saga.status === "EXPIRED") {
      throw new Error(saga.lastError || "Checkout failed")
    }
    if (shouldStop(saga)) {
      return saga
    }

    await new Promise(resolve => setTimeout(resolve, CHECKOUT_POLL_DELAY_MS))
    saga = await apiClient.get<CheckoutSagaResponse>(`/checkout/${sagaId}`)
  }

  return saga
}

function getCheckoutSagaError(saga: CheckoutSagaResponse, fallback: string): string {
  if (saga.lastError) {
    return saga.lastError
  }
  return `${fallback}. Current status: ${saga.status}`
}

// --- Service Implementation ---

export const ordersService = {
  /**
   * Get list of orders for the current logged-in user
   * GET /api/orders
   */
  async getMyOrders(): Promise<OrderResponse[]> {
    const orders = await apiClient.get<OrderResponse[]>("/orders")
    return orders.map(normalizeOrder)
  },

  /**
   * Get order details by ID
   * GET /api/orders/{orderId}
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const order = await apiClient.get<OrderResponse>(`/orders/${orderId}`)
    return normalizeOrder(order)
  },

  /**
   * Cancel an order
   * POST /api/orders/{orderId}/cancel
   */
  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const order = await apiClient.post<OrderResponse>(`/orders/${orderId}/cancel`)
    return normalizeOrder(order)
  },

  /**
   * ADMIN: Get all orders with pagination
   * GET /api/orders/admin/all?page=0&size=10
   */
  async getAllOrders(page: number = 0, size: number = 10): Promise<Page<OrderResponse>> {
    const pageResponse = await apiClient.get<Page<OrderResponse>>("/orders/admin/all", { page, size })
    return {
      ...pageResponse,
      content: pageResponse.content.map(normalizeOrder),
    }
  },
  /**
   * ADMIN: Update order status
   * PUT /api/orders/admin/{orderId}/status?status=CONFIRMED
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderResponse> {
    const order = await apiClient.put<OrderResponse>(`/orders/admin/${orderId}/status?status=${status}`)
    return normalizeOrder(order)
  },

  /**
   * ADMIN: Get orders by status
   * GET /api/orders/admin/status/{status}?startDate=2024-01-01&endDate=2024-01-31
   */
  async getOrdersByStatus(status: OrderStatus, startDate?: string, endDate?: string): Promise<OrderResponse[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const orders = await apiClient.get<OrderResponse[]>(`/orders/admin/status/${status}${queryString ? `?${queryString}` : ''}`)
    return orders.map(normalizeOrder)
  },

  /**
   * ADMIN: Get total revenue
   * GET /api/orders/admin/revenue?startDate=2024-01-01&endDate=2024-01-31
   */
  async getTotalRevenue(startDate?: string, endDate?: string): Promise<number> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiClient.get<number>(`/orders/admin/revenue${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Count orders of current user
   * GET /api/orders/count
   */
  async countMyOrders(): Promise<number> {
    return apiClient.get<number>("/orders/count")
  },

  /**
   * Start checkout saga
   * POST /api/v1/checkout
   */
  async startCheckout(data: CheckoutRequest): Promise<CheckoutSagaResponse> {
    return apiClient.post<CheckoutSagaResponse>("/checkout", data)
  },

  /**
   * Get checkout saga state
   * GET /api/v1/checkout/{sagaId}
   */
  async getCheckoutSaga(sagaId: string): Promise<CheckoutSagaResponse> {
    return apiClient.get<CheckoutSagaResponse>(`/checkout/${sagaId}`)
  },

  async checkout(data: CheckoutRequest): Promise<OrderResponse> {
    const started = await this.startCheckout(data)
    const saga = await waitForCheckoutSaga(started.sagaId, current => current.status === "COMPLETED")
    if (saga.status !== "COMPLETED" || !saga.orderId) {
      throw new Error(getCheckoutSagaError(saga, "Checkout is still processing"))
    }
    return { id: saga.orderId } as OrderResponse
  },

  async checkoutVNPay(data: CheckoutRequest): Promise<CreatePaymentResponse> {
    const started = await this.startCheckout({ ...data, paymentMethod: "VNPay" })
    const saga = await waitForCheckoutSaga(started.sagaId, current => !!current.paymentUrl)
    if (!saga.paymentUrl) {
      throw new Error(getCheckoutSagaError(saga, "Payment URL is not ready"))
    }
    return { paymentUrl: saga.paymentUrl || "" } as CreatePaymentResponse
  },

  async checkoutZaloPay(data: CheckoutRequest): Promise<CreatePaymentResponse> {
    const started = await this.startCheckout({ ...data, paymentMethod: "ZaloPay" })
    const saga = await waitForCheckoutSaga(started.sagaId, current => !!current.paymentUrl)
    if (!saga.paymentUrl) {
      throw new Error(getCheckoutSagaError(saga, "Payment URL is not ready"))
    }
    return { paymentUrl: saga.paymentUrl || "" } as CreatePaymentResponse
  },

  async checkoutMoMo(data: CheckoutRequest): Promise<CreatePaymentResponse> {
    const started = await this.startCheckout({ ...data, paymentMethod: "MoMo" })
    const saga = await waitForCheckoutSaga(started.sagaId, current => !!current.paymentUrl)
    if (!saga.paymentUrl) {
      throw new Error(getCheckoutSagaError(saga, "Payment URL is not ready"))
    }
    return { paymentUrl: saga.paymentUrl || "" } as CreatePaymentResponse
  },

  /**
   * Verify MoMo Payment (Callback)
   * POST /api/payment/momo/callback
   */
  async verifyMoMoPayment(data: MoMoCallbackRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/payment/momo/callback", data)
  },
}

export interface MoMoCallbackRequest {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: string
  resultCode: number
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}
