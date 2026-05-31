import { LoginForm } from "@/components/auth/login-form"

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        className="relative flex min-h-screen flex-1 items-center justify-center bg-cover bg-center bg-fixed px-4 py-12"
        style={{ backgroundImage: "url(/background.png)" }}
      >
        <div className="absolute inset-0 bg-black/50" aria-hidden />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-lg border border-border bg-card/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-foreground">Đăng nhập quản trị</h1>
              <p className="text-muted-foreground">
                Đăng nhập vào khu vực quản trị Nhà Sách Cộng Đồng
              </p>
            </div>

            <LoginForm variant="admin" />
          </div>
        </div>
      </main>
    </div>
  )
}
