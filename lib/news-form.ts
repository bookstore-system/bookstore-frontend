import * as z from "zod"
import type { UseFormSetError } from "react-hook-form"

const newsStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])

function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const newsFormSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề tin tức"),
  summary: z
    .string()
    .max(500, "Tóm tắt không được vượt quá 500 ký tự")
    .default(""),
  content: z
    .string()
    .refine((value) => htmlToPlainText(value).length > 0, "Vui lòng nhập nội dung tin tức"),
  category: z.string().trim().min(1, "Vui lòng chọn danh mục"),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: newsStatusSchema.default("DRAFT"),
  coverImage: z
    .string()
    .default("")
    .refine((value) => !value.trim() || isValidUrl(value.trim()), "Ảnh bìa phải là URL hợp lệ"),
})

export type NewsFormValues = z.infer<typeof newsFormSchema>

export const defaultNewsFormValues: NewsFormValues = {
  title: "",
  summary: "",
  content: "",
  category: "",
  tags: [],
  featured: false,
  status: "DRAFT",
  coverImage: "",
}

export function normalizeNewsTags(tags: string[]): string[] {
  const seen = new Set<string>()

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag) return false

      const normalized = tag.toLowerCase()
      if (seen.has(normalized)) return false

      seen.add(normalized)
      return true
    })
}

export function buildNewsPayload(values: NewsFormValues, publishNow = false) {
  return {
    title: values.title.trim(),
    summary: values.summary.trim() || null,
    content: values.content,
    category: values.category,
    tags: normalizeNewsTags(values.tags),
    featured: values.featured,
    status: publishNow ? "PUBLISHED" : values.status,
    coverImage: values.coverImage.trim() || null,
  }
}

type NewsFieldName = keyof NewsFormValues

const backendFieldMap: Record<string, NewsFieldName | null> = {
  title: "title",
  content: "content",
  category: "category",
  summary: "summary",
  coverimage: "coverImage",
  cover_image: "coverImage",
  images: null,
}

function guessFieldFromMessage(message: string): NewsFieldName | null {
  const normalized = message.toLowerCase()

  if (normalized.includes("tiêu đề")) return "title"
  if (normalized.includes("nội dung")) return "content"
  if (normalized.includes("danh mục")) return "category"
  if (normalized.includes("tóm tắt")) return "summary"
  if (normalized.includes("ảnh bìa") || normalized.includes("cover image") || normalized.includes("url")) {
    return "coverImage"
  }

  return null
}

export function applyNewsApiErrors(
  error: unknown,
  setError: UseFormSetError<NewsFormValues>
): boolean {
  const message = error instanceof Error ? error.message : ""
  if (!message) return false

  let matched = false
  const segments = message
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)

  for (const segment of segments) {
    const fieldMatch = segment.match(/^([A-Za-z0-9_]+)\s*:\s*(.+)$/)

    if (fieldMatch) {
      const [, rawField, fieldMessage] = fieldMatch
      const field = backendFieldMap[rawField.trim().toLowerCase()]

      if (field) {
        setError(field, { type: "server", message: fieldMessage.trim() })
        matched = true
        continue
      }
    }

    const guessedField = guessFieldFromMessage(segment)
    if (guessedField) {
      setError(guessedField, { type: "server", message: segment })
      matched = true
    }
  }

  return matched
}
