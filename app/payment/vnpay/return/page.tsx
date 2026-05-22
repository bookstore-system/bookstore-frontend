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
  const [message, setMessage] = useState("Dang xu ly ket qua thanh toan...")
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
      setMessage(messageParam || "Thanh toan thanh cong")
      toast.success("Thanh toan thanh cong")
      setTimeout(() => {
        router.push(`/account/orders/${returnedOrderId}`)
      }, 3000)
      return
    }

    setStatus("error")
    setMessage(messageParam || "Thanh toan that bai")
  }, [router, searchParams])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 p-4 text-center">
      {status === "processing" && (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Dang xu ly thanh toan...</h1>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-green-600">Thanh toan thanh cong</h1>
          <p className="text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">Dang chuyen huong den chi tiet don hang...</p>
          {orderId && (
            <Link href={`/account/orders/${orderId}`}>
              <Button>Xem don hang ngay</Button>
            </Link>
          )}
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-red-600">Thanh toan that bai</h1>
          <p className="text-muted-foreground">{message}</p>
          <div className="flex gap-4">
            <Link href="/checkout">
              <Button variant="outline">Thu lai</Button>
            </Link>
            <Link href="/">
              <Button>Ve trang chu</Button>
            </Link>
          </div>
        </>
      )}
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
