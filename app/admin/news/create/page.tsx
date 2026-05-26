/**
 * News Creation Page - Professional CKEditor 5 Integration
 * Trang tạo tin tức mới với trình soạn thảo CKEditor 5 chuyên nghiệp
 * Standalone page - No admin layout
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, X, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { NEWS_CATEGORIES } from "@/lib/news-categories"
import { newsService } from "@/lib/services/news.service"
import {
  applyNewsApiErrors,
  buildNewsPayload,
  defaultNewsFormValues,
  newsFormSchema,
  normalizeNewsTags,
  type NewsFormValues,
} from "@/lib/news-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import "./ckeditor-styles.css"

const CKEditorComponent = dynamic(() => import("@/components/news/news-ckeditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[600px] flex items-center justify-center border rounded-lg bg-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Đang tải trình soạn thảo...</p>
      </div>
    </div>
  ),
})

export default function CreateNewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: defaultNewsFormValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const title = form.watch("title")
  const summary = form.watch("summary")
  const tags = form.watch("tags")
  const coverImage = form.watch("coverImage")

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return

    const nextTags = normalizeNewsTags([...form.getValues("tags"), trimmedTag])
    form.setValue("tags", nextTags, { shouldDirty: true, shouldValidate: true })
    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((tag) => tag !== tagToRemove),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const handleSubmit = async (values: NewsFormValues, publishNow = false) => {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        })
        router.push("/admin/login?redirect=/admin/news/create")
        return
      }

      const payload = buildNewsPayload(values, publishNow)
      if (!publishNow) {
        payload.status = "DRAFT"
      }

      await newsService.create(payload)

      toast({
        title: "Thành công",
        description: publishNow
          ? "Tin tức đã được xuất bản"
          : "Tin tức đã được lưu nháp",
      })
      router.push("/admin/news/manage")
    } catch (error) {
      console.error("Error creating news:", error)
      const mapped = applyNewsApiErrors(error, form.setError)

      if (!mapped) {
        toast({
          title: "Lỗi",
          description:
            error instanceof Error ? error.message : "Không thể tạo tin tức. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDraft = () => void form.handleSubmit((values) => handleSubmit(values, false))()
  const submitPublished = () => void form.handleSubmit((values) => handleSubmit(values, true))()

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-white">
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-8 py-3">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.close()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Đóng
              </Button>
              <div className="flex items-center gap-3 border-l pl-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold">
                    {title || "Tin tức chưa có tiêu đề"}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {isSubmitting ? "Đang lưu..." : "Đã lưu tất cả thay đổi"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={submitDraft}
                disabled={isSubmitting}
                className="border-gray-300"
              >
                <Save className="mr-2 h-4 w-4" />
                Lưu nháp
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={submitPublished}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="mr-2 h-4 w-4" />
                Xuất bản
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 overflow-auto bg-gray-50" style={{ height: "calc(100vh - 65px)" }}>
            <div className="max-w-[1400px] mx-auto py-8 px-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormMessage className="mb-2 px-1" />
                    <FormControl>
                      <div
                        className={[
                          "bg-white rounded-lg shadow-sm border",
                          fieldState.error ? "border-destructive ring-1 ring-destructive/20" : "",
                        ].join(" ")}
                      >
                        <CKEditorComponent
                          value={field.value}
                          onChange={(data: string) => field.onChange(data)}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="w-80 border-l bg-white overflow-auto" style={{ height: "calc(100vh - 65px)" }}>
            <div className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">Tiêu đề</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề tin tức..."
                        className="border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">Tóm tắt</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Mô tả ngắn gọn về tin tức..."
                        className="w-full min-h-[80px] p-2.5 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">{summary.length}/500 ký tự</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6" />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">Danh mục</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NEWS_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Thêm tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="border-gray-300 text-sm"
                  />
                  <Button type="button" onClick={handleAddTag} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold text-gray-700">Ảnh bìa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="URL ảnh bìa"
                        className="border-gray-300 text-sm"
                        {...field}
                      />
                    </FormControl>
                    {coverImage && (
                      <div className="mt-2 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={coverImage}
                          alt="Preview"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6" />

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Cài đặt</Label>

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium">Tin nổi bật</p>
                          <p className="text-xs text-gray-500">
                            Hiển thị trong mục nổi bật
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            id="featured"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-gray-700">Trạng thái</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Nháp</SelectItem>
                          <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
