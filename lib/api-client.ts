/**
 * API Client Configuration
 * Base configuration for making HTTP requests to the backend
 */

// Strip /api or /api/v{n} from base URL for user-facing "server origin" hints
function stripApiPathSuffix(baseURL: string): string {
  try {
    const u = new URL(baseURL)
    const path = u.pathname.replace(/\/$/, "")
    if (/\/api(?:\/v\d+)?$/i.test(path)) {
      u.pathname = path.replace(/\/api(?:\/v\d+)?$/i, "") || "/"
      u.search = ""
      u.hash = ""
      return u.toString().replace(/\/$/, "")
    }
  } catch {
    /* fall through */
  }
  return baseURL.replace(/\/api(?:\/v\d+)?$/i, "")
}

// Get API URL from environment variables and normalize it
function normalizeApiUrl(url: string): string {
  url = url.trim()

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.startsWith("//")) {
      url = "http:" + url
    } else {
      url = "http://" + url
    }
  }

  url = url.replace(/\/$/, "")

  // Already includes API prefix (e.g. .../api or .../api/v1)
  if (/\/api(\/v\d+)?$/i.test(url)) {
    return url
  }

  return `${url}/api/v1`
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

/** Resolved API base URL (includes `/api` or `/api/v1`, no trailing slash). */
export const API_BASE_URL = normalizeApiUrl(rawApiUrl)

/** Host (and port) without trailing `/api` or `/api/v{n}` — for OAuth redirects and hints. */
export function backendOriginFromApiBaseUrl(baseUrl: string): string {
  return stripApiPathSuffix(baseUrl)
}

// Log API URL to help debug (in both dev and production)
if (typeof window !== "undefined") {
  console.log("API Base URL:", API_BASE_URL)
  if (rawApiUrl !== API_BASE_URL) {
    console.warn("API URL was normalized from:", rawApiUrl, "to:", API_BASE_URL)
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage if exists
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: any = {}
        try {
          const text = await response.text()
          if (text) {
            errorData = JSON.parse(text)
          }
        } catch (e) {
          errorData = { message: response.statusText || "Unknown error" }
        }
        // Backend returns { code, message, result } format
        let errorMessage =
          errorData.message || errorData.error || `HTTP Error: ${response.status}`
        if (response.status === 500) {
          errorMessage =
            "News-service chưa sẵn sàng hoặc gateway không kết nối được tới news-service. " +
            "Kiểm tra container `news-service` đã chạy (log: Started BookstoreNewsServiceApplication) rồi thử lại."
        } else if (response.status === 401) {
          errorMessage =
            "Phiên đăng nhập hết hạn hoặc thiếu token. Vui lòng đăng nhập lại."
        } else if (response.status === 403) {
          errorMessage = errorMessage || "Bạn không có quyền thực hiện thao tác này."
        }
        throw new Error(errorMessage)
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      // Unwrap Spring-style envelopes: { code, message, result } or { code, message, data }
      if (data && typeof data === "object") {
        if ("result" in data) {
          return (data as { result: T }).result as T;
        }
        if ("data" in data && "code" in data) {
          return (data as { data: T }).data as T;
        }
      }

      return data;
    } catch (error) {
      // Improved error handling for "Failed to fetch"
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        const serverOrigin = stripApiPathSuffix(this.baseURL)
        console.error("API Request Failed:", {
          url,
          baseURL: this.baseURL,
          endpoint,
          error: "Cannot connect to backend server",
          checks: [
            `1. Is backend server running at ${serverOrigin}?`,
            "2. Check CORS configuration in backend",
            "3. Check network connectivity",
            "4. If using Railway, check if NEXT_PUBLIC_API_URL is set correctly in .env.local",
          ],
        })
        throw new Error(
          `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
          `- Backend có đang chạy tại ${serverOrigin} không?\n` +
          `- Kiểm tra CORS configuration\n` +
          `- Kiểm tra file .env.local có NEXT_PUBLIC_API_URL đúng không\n` +
          `- Kiểm tra kết nối mạng`
        )
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network request failed");
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Filter out undefined, null, and empty string values
    const cleanParams = params
      ? Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== "" && String(value) !== "undefined"
        )
      )
      : undefined

    const queryString = cleanParams && Object.keys(cleanParams).length > 0
      ? "?" + new URLSearchParams(
        Object.entries(cleanParams).map(([key, value]) => [key, String(value)])
      ).toString()
      : ""
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    if (body) {
      console.log("POST request body (raw):", body)
      console.log("POST request body (stringified):", JSON.stringify(body, null, 2))
    }
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Upload failed");
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient;
