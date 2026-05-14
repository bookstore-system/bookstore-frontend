import { apiClient, PaginatedResponse } from "../api-client";

export interface Author {
    id: string;
    name: string;
    biography?: string;
    dateOfBirth?: string;
    nationality?: string;
}

export interface CreateAuthorRequest {
    name: string;
    biography?: string;
    dateOfBirth?: string; // YYYY-MM-DD
    nationality?: string;
}

export interface AuthorFilterRequest {
    page?: number;
    size?: number;
    sortByName?: string;
    sortByBirthYear?: string;
}

export const authorsService = {
    /**
     * Get all authors with pagination and filters
     * Endpoint: GET /api/authors
     */
    async getAuthors(params?: AuthorFilterRequest): Promise<PaginatedResponse<Author> | Author[]> {
        return apiClient.get<PaginatedResponse<Author> | Author[]>("/authors", params);
    },

    /**
     * Get all authors (helper for dropdowns).
     * Hỗ trợ cả book-service (GET trả về mảng) và API dạng Spring page ({ content }).
     */
    async getAllAuthorsForSelect(): Promise<Author[]> {
        const res = await this.getAuthors({ page: 0, size: 500 });
        if (Array.isArray(res)) {
            return res as Author[];
        }
        return res.content ?? [];
    },

    /**
     * Get author by ID
     * Endpoint: GET /api/authors/{id}
     */
    async getAuthorById(id: string): Promise<Author> {
        return apiClient.get<Author>(`/authors/${id}`);
    },

    /**
     * Create a new author
     * Endpoint: POST /api/authors
     */
    async createAuthor(data: CreateAuthorRequest): Promise<Author> {
        return apiClient.post<Author>("/authors", data);
    }
};
