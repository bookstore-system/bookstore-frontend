"use client"

import { useEffect, useState } from "react"
import type { Book } from "@/lib/services/books.service"
import { booksService } from "@/lib/services/books.service"
import { ProductCard } from "@/components/products/product-card"
import { Loader2 } from "lucide-react"

interface RelatedBooksProps {
  newsTitle: string
}

export function RelatedBooks({ newsTitle }: RelatedBooksProps) {
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedBooks() {
      if (!newsTitle) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const response = await booksService.searchBooks(newsTitle, {
          page: 0,
          size: 4,
        })
        setRelatedBooks(response.content)
      } catch (error) {
        console.error("Failed to fetch related books:", error)
        setRelatedBooks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedBooks()
  }, [newsTitle])

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Đang tìm sách liên quan...</p>
      </div>
    )
  }

  if (relatedBooks.length === 0) {
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Có thể bạn quan tâm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedBooks.map((book) => (
          <ProductCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
