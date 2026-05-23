/**
 * Chat Service
 * Handles all chatbot AI API calls
 */

import apiClient from "../api-client";

export interface ChatbotRequest {
  message: string;
  sessionId?: string | null;
  userId?: string | null;
  attachments?: AttachmentRequest[];
}

export interface AttachmentRequest {
  type: "image" | "file" | "location";
  url?: string;
  name?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

/**
 * Trace của một tool agent đã thực thi.
 * Trùng cấu trúc với `ChatbotResponse.ToolCallTrace` ở BE.
 */
export interface ToolCallTrace {
  toolName: string;
  arguments?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string | null;
  data?: Record<string, unknown> | null;
}

/**
 * Card sách chuẩn hoá BE đã gom từ mọi tool. Mirror với
 * `BookCard.java` ở bookstore-ai-service.
 */
export interface BookCardDto {
  id: string;
  title: string;
  price?: number | null;
  discountPrice?: number | null;
  mainImageUrl?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  stockQuantity?: number | null;
  authorNames?: string[] | null;
  source?: string | null;
}

export interface ChatbotResponse {
  response: string;
  sessionId: string;
  intent?: string | null;
  toolCalls?: ToolCallTrace[];
  books?: BookCardDto[];
}

class ChatService {
  /**
   * Gửi tin nhắn đến chatbot AI (endpoint đầy đủ với JSON)
   * @param request - Thông tin tin nhắn từ người dùng
   * @returns Phản hồi từ chatbot AI
   */
  async sendMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
    try {
      const response = await apiClient.post<ChatbotResponse>(
        "/chatbot/chat",
        request
      );
      return response;
    } catch (error: any) {
      console.error("Error sending chat message:", error);
      const errorMessage =
        error.message ||
        "Không thể kết nối đến chatbot. Vui lòng thử lại sau.";
      throw new Error(errorMessage);
    }
  }
}

export const chatService = new ChatService();
export default chatService;
