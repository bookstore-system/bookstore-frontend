"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { API_BASE_URL } from "@/lib/api-client"

type LoginFormVariant = "user" | "admin"

function LoginFormContent({ variant = "user" }: { variant?: LoginFormVariant }) {
  const isAdminLogin = variant === "admin"
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu")
      return
    }

    try {
      const authenticatedUser = await login(formData.username, formData.password)
      const isAdmin =
        typeof authenticatedUser.role === "string" &&
        authenticatedUser.role.toUpperCase() === "ADMIN"

      if (isAdminLogin && !isAdmin) {
        setError("Tài khoản không có quyền truy cập khu vực quản trị.")
        return
      }

      if (redirectPath) {
        router.push(redirectPath)
      } else if (isAdminLogin || isAdmin) {
        router.push("/admin")
      } else {
        router.push("/account")
      }
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        setError("Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.")
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Tên đăng nhập</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="admin"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Mật khẩu</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      {isAdminLogin ? <AdminLoginExtras /> : <UserLoginExtras />}
    </form>
  )
}

function AdminLoginExtras() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
        Quên mật khẩu?
      </Link>
    </p>
  )
}

function UserLoginExtras() {
  const getGoogleOAuthUrl = () => {
    if (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL) {
      return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL
    }

    const redirectUri = `${API_BASE_URL}/auth/google/callback`
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
  }

  const googleOAuthUrl = getGoogleOAuthUrl()

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px w-full bg-border" />
          <span>Hoặc</span>
          <span className="h-px w-full bg-border" />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = googleOAuthUrl
            }
          }}
        >
          <span className="flex w-full items-center justify-center gap-2">
            <FcGoogle className="h-5 w-5" />
            <span>Đăng nhập với Google</span>
          </span>
        </Button>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
            Quên mật khẩu?
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </>
  )
}

export function LoginForm({ variant = "user" }: { variant?: LoginFormVariant }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
        </div>
      }
    >
      <LoginFormContent variant={variant} />
    </Suspense>
  )
}
