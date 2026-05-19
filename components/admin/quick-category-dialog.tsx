"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { bookCategoriesService, BookCategoryOption } from "@/lib/services/book-categories.service"
import { useToast } from "@/components/ui/use-toast"

const categorySchema = z.object({
  name: z.string().min(1, "Nhập tên thể loại").max(255, "Tối đa 255 ký tự"),
  description: z.string().max(10000, "Mô tả quá dài").optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface QuickCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (category: BookCategoryOption) => void
}

export function QuickCategoryDialog({ open, onOpenChange, onSuccess }: QuickCategoryDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset({ name: "", description: "" })
    }
  }, [open, form])

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true)
      const created = await bookCategoriesService.create({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      })
      toast({
        title: "Thành công",
        description: "Đã thêm thể loại mới",
      })
      onSuccess(created)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Failed to create category", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo thể loại",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thể loại</DialogTitle>
          <DialogDescription>
            Tên phải duy nhất trong hệ thống
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thể loại *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Văn học" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tùy chọn" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
