"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

function VNPayReturnContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...")
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const resultCode = searchParams.get("resultCode")
    const statusParam = searchParams.get("status")
    const messageParam = searchParams.get("message")
    const returnedOrderId = searchParams.get("orderId")

    if (returnedOrderId) {
      setOrderId(returnedOrderId)
    }

    const isSuccess = resultCode === "00" || resultCode === "0" || statusParam === "COMPLETED"

    if (isSuccess && returnedOrderId) {
      setStatus("success")
      setMessage(messageParam || "Thanh toán thành công")
      toast.success("Thanh toán thành công")
      const redirectTimer = setTimeout(() => {
        router.push(`/account/orders/${returnedOrderId}`)
      }, 2500)

      return () => clearTimeout(redirectTimer)
    }

    setStatus("error")
    setMessage(messageParam || "Thanh toán thất bại")
  }, [router, searchParams])

  const statusConfig = {
    processing: {
      wrapper: "from-slate-50 via-sky-50 to-cyan-50",
      iconBg: "bg-primary/10 text-primary",
      ring: "ring-primary/10",
      title: "Đang xử lý thanh toán",
      subtitle: "Vui lòng chờ trong giây lát, hệ thống đang xác nhận giao dịch.",
    },
    success: {
      wrapper: "from-emerald-50 via-white to-teal-50",
      iconBg: "bg-emerald-500/10 text-emerald-600",
      ring: "ring-emerald-200/60",
      title: "Thanh toán thành công",
      subtitle: "Giao dịch đã được xác nhận. Bạn sẽ được chuyển đến chi tiết đơn hàng.",
    },
    error: {
      wrapper: "from-rose-50 via-white to-orange-50",
      iconBg: "bg-red-500/10 text-red-600",
      ring: "ring-red-200/60",
      title: "Thanh toán thất bại",
      subtitle: "Đơn hàng chưa được thanh toán. Bạn có thể thử lại hoặc quay về trang chủ.",
    },
  }[status]

  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className={`w-full rounded-3xl border bg-card/90 p-6 shadow-2xl shadow-black/5 backdrop-blur sm:p-8 ring-1 ${statusConfig.ring}`}>
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${statusConfig.iconBg}`}>
            {status === "processing" && <Loader2 className="h-10 w-10 animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-10 w-10" />}
            {status === "error" && <XCircle className="h-10 w-10" />}
          </div>

          <div className="space-y-3 text-center">
            <div className="inline-flex items-center rounded-full border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              VNPay · Kết quả giao dịch
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {statusConfig.title}
            </h1>

            <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              {status === "processing" ? "Đang xử lý kết quả thanh toán của bạn..." : message}
            </p>

            {orderId && (
              <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm text-foreground">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-semibold">#{orderId}</span>
              </div>
            )}

            <p className="text-sm text-muted-foreground">{statusConfig.subtitle}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {status === "success" && orderId && (
              <Link href={`/account/orders/${orderId}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Xem chi tiết đơn hàng</Button>
              </Link>
            )}

            {status === "error" && (
              <>
                <Link href="/checkout" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Thử lại
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Về trang chủ</Button>
                </Link>
              </>
            )}

            {status === "processing" && (
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Về trang chủ
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
      <VNPayReturnContent />
    </Suspense>
  )
}
