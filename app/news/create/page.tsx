/**
 * News Creation Page - Professional CKEditor 5 Integration
 * Trang tạo tin tức mới với trình soạn thảo CKEditor 5 chuyên nghiệp
 * Protected page - Only Admin can access
 */

"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Save, Eye, X, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
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
  const { user, isLoading: authLoading } = useAuth()
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: defaultNewsFormValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để tiếp tục",
          variant: "destructive",
        })
        router.push("/login?redirect=/news/create")
        return
      }

      if (user.role !== "ADMIN" && user.role !== "admin") {
        toast({
          title: "Không có quyền truy cập",
          description: "Chỉ Admin mới có quyền tạo tin tức",
          variant: "destructive",
        })
        router.push("/")
      }
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const ckboxScript = document.createElement("script")
    ckboxScript.src = "https://cdn.ckbox.io/ckbox/2.9.2/ckbox.js"
    ckboxScript.crossOrigin = "anonymous"
    document.head.appendChild(ckboxScript)

    const ckboxTranslation = document.createElement("script")
    ckboxTranslation.src = "https://cdn.ckbox.io/ckbox/2.9.2/translations/vi.js"
    ckboxTranslation.crossOrigin = "anonymous"
    document.head.appendChild(ckboxTranslation)

    return () => {
      if (document.head.contains(ckboxScript)) {
        document.head.removeChild(ckboxScript)
      }
      if (document.head.contains(ckboxTranslation)) {
        document.head.removeChild(ckboxTranslation)
      }
    }
  }, [])

  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const title = form.watch("title")
  const summary = form.watch("summary")
  const tags = form.watch("tags")

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    return null
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
        router.push("/login?redirect=/news/create")
        return
      }

      await newsService.create(buildNewsPayload(values, publishNow))

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
      <form onSubmit={(e) => e.preventDefault()} className="min-h-screen bg-gray-50 flex flex-col">
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2 border-l pl-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  {isSubmitting ? "Đang lưu..." : title || "Tin tức mới"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={submitDraft}
                disabled={isSubmitting}
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

        <div className="bg-white border-b px-6 py-3">
          <div className="grid grid-cols-12 gap-3 items-start">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel className="text-xs font-medium mb-1 block">Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Tiêu đề tin tức" className="h-9 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs font-medium mb-1 block">Danh mục</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Chọn" />
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="col-span-3">
              <Label className="text-xs font-medium mb-1 block">Tags</Label>
              <div className="flex gap-1">
                <Input
                  placeholder="Nhấn Enter để thêm"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="h-9 text-sm flex-1"
                />
                <Button type="button" onClick={handleAddTag} size="sm" className="h-9 px-3">
                  +
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs py-0 px-1.5">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs font-medium mb-1 block">
                    Tóm tắt ({summary.length}/500)
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Tóm tắt ngắn"
                      className="w-full h-9 p-2 text-xs border rounded-md resize-none"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="col-span-2 flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        id="featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="featured" className="text-xs cursor-pointer whitespace-nowrap">
                      Nổi bật
                    </Label>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white p-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormMessage className="mb-2 px-1" />
                <FormControl>
                  <div
                    className={[
                      "rounded-lg border bg-white",
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
      </form>
    </Form>
  )
}
