"use client"

import { BookForm } from "@/components/admin/book-form"
import {
  adminBooksService,
  AdminCreateBookRequest,
} from "@/lib/services/admin-books.service"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function NewBookPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: AdminCreateBookRequest, images: File[]) => {
    try {
      const newBook = await adminBooksService.createBook(data)

      if (images.length > 0) {
        await adminBooksService.uploadBookImages(newBook.id, images)
      }

      toast({
        title: "Thành công",
        description: "Đã tạo sách mới thành công",
      })
      router.push("/admin/books")
    } catch (error) {
      console.error("Failed to create book", error)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thêm sách mới</h1>
          <p className="text-muted-foreground">
            Điền thông tin chi tiết để thêm một cuốn sách mới vào hệ thống.
          </p>
        </div>

        <BookForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
