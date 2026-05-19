# API dùng bởi Bookstore Frontend

Tài liệu tổng hợp các endpoint mà FE gọi (theo `lib/services/*`, `lib/api-client.ts`, và các `fetch` trong `app/**`).
## Base URL

- Biến môi trường: `NEXT_PUBLIC_API_URL`
- Ví dụ: `http://localhost:8080/api/v1`
- Mọi path trong bảng dưới đây là **đường dẫn tương đối** ghép sau base URL trên (không có dấu `/` thừa giữa base và path).

## Định dạng & client

- **`apiClient`**: tự gắn `Authorization: Bearer <token>` khi có; với JSON, backend Spring thường trả `{ code, message, result }` — client **unwrap** field `result`.
- **`fetch` trực tiếp**: dùng cho FormData, blob export, và một số trang News — cần tự set header / xử lý response.

---

## OAuth Google (ngoài prefix versioned)

Redirect URI được build trong FE dạng:

`{origin}/api/auth/google/callback`

Trong đó `origin` là host backend (đã bỏ suffix `/api` hoặc `/api/v1`). Không nhất thiết trùng path version của REST API.

---

## Xác thực — `/auth`

| Method | Path |
|--------|------|
| POST | `/auth/login` |
| POST | `/auth/register` |
| POST | `/auth/google` |
| POST | `/auth/logout` |
| GET | `/auth/me` |
| POST | `/auth/refresh` |
| POST | `/auth/forgot-password` |
| POST | `/auth/send-otp` |
| POST | `/auth/verify-otp` |
| POST | `/auth/reset-password` |
| POST | `/auth/verify-email` |
| GET | `/auth/confirm-email?token=...` |

---

## Người dùng — `/users`, `/user`, `/admin/users`

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/users/me` | |
| PUT | `/users/profile` | `fetch` + FormData |
| POST | `/users/change-password` | |
| PATCH | `/users/{id}/role` | |
| GET | `/users/stats` | |
| GET | `/admin/users` | Query: `search`, `role`, `status`, `sortBy`, `sortDirection`, `page`, `size` |
| GET | `/admin/users/{id}` | |
| DELETE | `/admin/users/{id}` | |
| PATCH | `/admin/users/{id}/ban` | |
| PATCH | `/admin/users/{id}/unban` | |
| PATCH | `/admin/users/{id}/status` | Body: `{ status }` |
| GET | `/admin/users/statistics` | Optional: `startDate`, `endDate` |
| GET | `/admin/users/top-spenders` | `?limit=` |
| GET | `/admin/users/top-buyers` | `?limit=` |
| POST | `/admin/users` | |
| POST | `/admin/upload/avatar` | `fetch` + FormData |
| GET | `/admin/users/export` | `fetch` + blob |

---

## Sách — `/books`

| Method | Path |
|--------|------|
| GET | `/books/options` |
| GET | `/books/{id}` |
| GET | `/books/by-category/{categoryId}` |
| POST | `/books` |
| PUT | `/books/{id}` |
| DELETE | `/books/{id}` |
| GET | `/books/featured` |
| GET | `/books/best-selling` |
| GET | `/books/suggested` |
| GET | `/books/by-popular-categories` |
| GET | `/books/new-arrivals` |
| GET | `/books/search` |
| POST | `/books/upload-image` |
| PATCH | `/books/{id}/stock` |

---

## Admin sách — `/admin/books`

| Method | Path |
|--------|------|
| POST | `/admin/books` |
| PUT | `/admin/books/{bookId}` |
| DELETE | `/admin/books/{bookId}` |
| GET | `/admin/books/{bookId}` |
| GET | `/admin/books` |
| POST | `/admin/books/{bookId}/images` |
| DELETE | `/admin/books/{bookId}/images/{imageId}` |

---

## Danh mục — `/categories`

| Method | Path |
|--------|------|
| GET | `/categories` |
| GET | `/categories/popular` |
| GET | `/categories/with-sample-book` |
| GET | `/categories/{id}` |
| GET | `/categories/slug/{slug}` |
| GET | `/categories/stats` |
| POST | `/categories` |
| PUT | `/categories/{id}` |
| DELETE | `/categories/{id}` |

---

## Tác giả — `/authors`

| Method | Path |
|--------|------|
| GET | `/authors` |
| GET | `/authors/{id}` |
| POST | `/authors` |

---

## Giỏ hàng — `/cart`

| Method | Path |
|--------|------|
| GET | `/cart` |
| GET | `/cart/count` |
| GET | `/cart/check/{bookId}` |
| POST | `/cart/add` |
| PUT | `/cart/update/{bookId}` |
| DELETE | `/cart/remove/{bookId}` |
| DELETE | `/cart/clear` |

---

## Wishlist — `/wishlist`

| Method | Path |
|--------|------|
| GET | `/wishlist` |
| GET | `/wishlist/check/{bookId}` |
| POST | `/wishlist/add` |
| DELETE | `/wishlist/remove/{bookId}` |
| DELETE | `/wishlist/clear` |

---

## Địa chỉ — `/addresses`

| Method | Path |
|--------|------|
| POST | `/addresses` |
| PUT | `/addresses/{id}` |
| DELETE | `/addresses/{id}` |
| GET | `/addresses/{id}` |
| GET | `/addresses/user` |

---

## Vận chuyển — `/shipment/customer`

| Method | Path |
|--------|------|
| GET | `/shipment/customer/province` |
| GET | `/shipment/customer/district?provinceId=` |
| GET | `/shipment/customer/ward?districtId=` |
| POST | `/shipment/customer/calculate` |

---

## Đơn hàng & thanh toán — `/orders`, `/payment`

| Method | Path |
|--------|------|
| GET | `/orders` |
| GET | `/orders/{orderId}` |
| GET | `/orders/count` |
| POST | `/orders/{orderId}/cancel` |
| POST | `/orders/checkout` |
| POST | `/orders/checkout/vnpay` |
| POST | `/orders/checkout/zalopay` |
| POST | `/orders/checkout/momo` |
| GET | `/orders/admin/all` |
| PUT | `/orders/admin/{orderId}/status?status=` |
| GET | `/orders/admin/status/{status}` |
| GET | `/orders/admin/revenue` |
| POST | `/payment/momo/callback` |

Query thường gặp: `page`, `size` (admin all); `startDate`, `endDate` (revenue / orders by status).

---

## Đánh giá — `/reviews`, `/review`

| Method | Path |
|--------|------|
| GET | `/reviews` |
| GET | `/reviews/my-reviews` |
| GET | `/review/book/{bookId}` |
| GET | `/reviews/book/{bookId}/summary` |
| POST | `/review/book/add` |
| POST | `/reviews/{id}/helpful` |
| PUT | `/reviews/{id}` |
| DELETE | `/reviews/{id}` |

---

## Khuyến mãi — `/promotions`

| Method | Path |
|--------|------|
| GET | `/promotions` |
| GET | `/promotions/active` |
| GET | `/promotions/{id}` |
| POST | `/promotions/validate` |
| POST | `/promotions` |
| PUT | `/promotions/{id}` |
| PATCH | `/promotions/{id}/status?status=` |
| DELETE | `/promotions/{id}` |

---

## Admin dashboard — `/admin/dashboard`

| Method | Path |
|--------|------|
| GET | `/admin/dashboard/stats` |
| GET | `/admin/dashboard/sales-trend` |
| GET | `/admin/dashboard/top-categories` |
| GET | `/admin/dashboard/performance` |
| GET | `/admin/dashboard/top-selling-books` |
| GET | `/admin/dashboard/recent-orders` |

---

## Thống kê doanh thu admin — `/admin/statistics`

| Method | Path |
|--------|------|
| GET | `/admin/statistics/revenue` |

Tham số query theo `lib/services/revenue.service.ts`.

---

## Tin tức — `/news`

| Method | Path |
|--------|------|
| GET | `/news/statistics` |
| GET | `/news/advanced-search` |
| GET | `/news` |
| GET | `/news/{id}` |
| POST | `/news` |
| PUT | `/news/{id}` |

Một số màn hình dùng `fetch` trực tiếp với `API_BASE_URL` / `NEXT_PUBLIC_API_URL`.

---

## Chatbot — `/chatbot`

| Method | Path |
|--------|------|
| POST | `/chatbot/chat` |

---

## Ghi chú đối soát backend

1. **`PUT /user/profile`** (singular) khác **`GET /users/me`** — cần khớp với controller thực tế trên server.
2. Một số file vẫn fallback `http://localhost:8080/api` (không có `/v1`) khi thiếu env; nên thống nhất dùng `NEXT_PUBLIC_API_URL` hoặc import `API_BASE_URL` từ `lib/api-client.ts`.
3. Cập nhật tài liệu này khi thêm service hoặc đổi path trên BE.
