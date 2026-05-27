import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, Tag, User } from "lucide-react"
import { Header } from "@/components/layout/header"
import { NewsDetailActions } from "@/components/news/news-detail-actions"
import { RelatedBooks } from "@/components/news/related-books"
import { NewsTableOfContents, type NewsTocSection } from "@/components/news/news-table-of-contents"
import type { NewsItem } from "@/lib/services/news.service"

export const dynamic = "force-dynamic"

interface NewsDetailPageProps {
  params: Promise<{ id: string }>
}

interface NewsMetadata {
  sections?: NewsTocSection[]
}

function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "")
  if (/\/api(\/v\d+)?$/i.test(trimmed)) {
    return trimmed
  }
  return `${trimmed}/api/v1`
}

function newsApiBase() {
  return normalizeApiBase(
    process.env.NEWS_SERVER_URL?.trim() ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api/v1"
  )
}

async function parseApiResult<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null
  }

  const data = await response.json()
  if (data && typeof data === "object" && "result" in data) {
    return data.result as T
  }
  if (data && typeof data === "object" && "data" in data && "code" in data) {
    return data.data as T
  }
  return data as T
}

async function fetchNewsDetail(id: string): Promise<NewsItem | null> {
  try {
    const response = await fetch(`${newsApiBase()}/news/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    return parseApiResult<NewsItem>(response)
  } catch (error) {
    console.warn("Failed to fetch news detail on server:", error)
    return null
  }
}

function formatDate(value?: string | null) {
  if (!value) return ""
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value))
}

function metadataOf(news: NewsItem): NewsMetadata {
  if (!news.metadata || typeof news.metadata !== "object") {
    return {}
  }
  return news.metadata as NewsMetadata
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params
  const news = await fetchNewsDetail(id)

  if (!news) {
    notFound()
  }

  const metadata = metadataOf(news)
  const images = (news.images ?? []).map((image) => ({
    id: String(image.id),
    url: image.url,
    priority: image.priority,
  }))
  const tags = news.tags ?? []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="bg-linear-to-r from-amber-800 via-red-800 to-amber-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-sm bg-white/20 text-white border-white/30 hover:bg-white/30">
                {news.category}
              </Badge>
              {news.featured && (
                <Badge variant="secondary" className="text-sm bg-yellow-500/30 text-yellow-200 border-yellow-400/30">
                  Nổi bật
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(news.publishedAt || news.createdAt)}</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{news.authorName || "Nhà Sách Cộng Đồng"}</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{(news.views ?? 0).toLocaleString("vi-VN")} lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-6 sm:px-8 lg:px-10 py-8">
          <article className="w-full">
            {news.summary && (
              <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-lg mb-8">
                <p className="text-lg leading-relaxed">{news.summary}</p>
              </div>
            )}

            <NewsTableOfContents sections={metadata.sections ?? []} />

            <NewsDetailActions title={news.title} />

            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            {images.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Thư viện ảnh
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="relative rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <Image
                        src={image.url}
                        alt={`Image ${image.priority}`}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex items-start gap-3 pt-6 border-t">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link key={tag} href={`/news?tag=${encodeURIComponent(tag)}`}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <RelatedBooks newsTitle={news.title} />
          </article>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .prose h2 {
              margin-top: 2rem;
              margin-bottom: 1rem;
              font-size: 1.875rem;
              font-weight: 700;
            }

            .prose h3 {
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              font-size: 1.5rem;
              font-weight: 600;
            }

            .prose p {
              margin-bottom: 1.25rem;
            }

            .prose blockquote {
              border-left: 4px solid hsl(var(--primary));
              padding-left: 1.5rem;
              font-style: italic;
              color: hsl(var(--muted-foreground));
              margin: 2rem 0;
            }

            .prose img {
              border-radius: 0.5rem;
              margin: 2rem auto;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .prose a {
              color: hsl(var(--primary));
              text-decoration: underline;
            }

            .prose ul,
            .prose ol {
              margin: 1.5rem 0;
              padding-left: 2rem;
            }

            .prose li {
              margin-bottom: 0.5rem;
            }
          `,
        }}
      />
    </div>
  )
}
