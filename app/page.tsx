"use client"

import { useMemo, useState } from "react"

type LoginResponse = {
  token: string
  type: string
  expiresIn: number
  user: {
    id: number
    email: string
    fullName: string
    createdAt: string
  }
}

type RegisterResponse = {
  id: number
  email: string
  fullName: string
  createdAt: string
}

type BookItem = {
  id: string
  title: string
  price: number
  discountPrice: number
  mainImageUrl: string | null
  stockQuantity: number
  authorNames: string[] | null
  categoryId: string[] | null
}

type CreateBookResult = {
  id: string
  title: string
  isbn: string
  price: number
  importPrice: number
  discountPrice: number
  stockQuantity: number
  publishDate: string
  description: string
}

type ApiEnvelope<T> = {
  code: number
  message: string
  result: T
}

const API_BASE = "http://localhost:8080/api"

export default function ApiDemoPage() {
  const [token, setToken] = useState("")
  const [tokenType, setTokenType] = useState("Bearer")
  const [busy, setBusy] = useState<string | null>(null)

  const [loginBody, setLoginBody] = useState({
    email: "usesr@example.com",
    password: "changeme123",
  })

  const [registerBody, setRegisterBody] = useState({
    email: "usesr@example.com",
    password: "changeme123",
    fullName: "Nguyen Van A",
  })

  const [createBookBody, setCreateBookBody] = useState({
    title: "Book Title",
    isbn: "1234567890",
    price: 100000,
    discountPrice: 90000,
    importPrice: 80000,
    stockQuantity: 10,
    publishDate: "2024-01-01",
    description: "Description here",
    status: "AVAILABLE",
  })

  const [deleteId, setDeleteId] = useState("")

  const [loginResult, setLoginResult] = useState<unknown>(null)
  const [registerResult, setRegisterResult] = useState<unknown>(null)
  const [createBookResult, setCreateBookResult] = useState<unknown>(null)
  const [getBooksResult, setGetBooksResult] = useState<unknown>(null)
  const [deleteResult, setDeleteResult] = useState<unknown>(null)

  const authHeader = useMemo(() => {
    if (!token.trim()) return ""
    return `${tokenType} ${token}`
  }, [token, tokenType])

  const sendJson = async <T,>(
    endpoint: string,
    options: RequestInit,
    requireAuth: boolean = false
  ): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    if (requireAuth && authHeader) {
      headers.Authorization = authHeader
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      const msg = (data && (data.message || data.error)) || `HTTP ${response.status}`
      throw new Error(msg)
    }

    return data as T
  }

  const withRunner = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    try {
      await fn()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      const errorPayload = { error: true, message }

      if (key === "login") setLoginResult(errorPayload)
      if (key === "register") setRegisterResult(errorPayload)
      if (key === "createBook") setCreateBookResult(errorPayload)
      if (key === "getBooks") setGetBooksResult(errorPayload)
      if (key === "deleteBook") setDeleteResult(errorPayload)
    } finally {
      setBusy(null)
    }
  }

  const handleLogin = async () => {
    await withRunner("login", async () => {
      const data = await sendJson<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginBody),
      })

      setToken(data.token)
      setTokenType(data.type || "Bearer")
      setLoginResult(data)
    })
  }

  const handleRegister = async () => {
    await withRunner("register", async () => {
      const data = await sendJson<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerBody),
      })
      setRegisterResult(data)
    })
  }

  const handleCreateBook = async () => {
    await withRunner("createBook", async () => {
      const data = await sendJson<ApiEnvelope<CreateBookResult>>(
        "/books",
        {
          method: "POST",
          body: JSON.stringify(createBookBody),
        },
        true
      )
      setCreateBookResult(data)
    })
  }

  const handleGetBooks = async () => {
    await withRunner("getBooks", async () => {
      const data = await sendJson<ApiEnvelope<BookItem[]>>("/books", {
        method: "GET",
      })
      setGetBooksResult(data)
    })
  }

  const handleDeleteBook = async (id?: string) => {
    const targetId = (id || deleteId).trim()
    if (!targetId) {
      setDeleteResult({ error: true, message: "Vui long nhap ID sach can xoa" })
      return
    }

    await withRunner("deleteBook", async () => {
      const data = await sendJson<ApiEnvelope<null>>(
        `/books/${targetId}`,
        { method: "DELETE" },
        true
      )
      setDeleteResult(data)
      await handleGetBooks()
    })
  }

  const books =
    (getBooksResult as ApiEnvelope<BookItem[]> | null)?.result &&
    Array.isArray((getBooksResult as ApiEnvelope<BookItem[]>).result)
      ? (getBooksResult as ApiEnvelope<BookItem[]>).result
      : []

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8f4e8_0%,_#f2e8cf_35%,_#e8dcc2_100%)] text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 rounded-3xl border border-amber-900/20 bg-white/75 p-6 shadow-lg backdrop-blur">
          <p className="mb-2 inline-block rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-50">
            API Playground
          </p>
          <h1 className="font-serif text-3xl font-bold md:text-4xl">Demo API Auth + Books</h1>
          <p className="mt-2 text-sm text-zinc-700 md:text-base">
            Giao dien test nhanh cho 5 endpoint: login, register, create book, get books, delete book.
          </p>
        </header>

        <section className="mb-8 grid gap-4 rounded-3xl border border-zinc-900/10 bg-white/75 p-4 shadow-sm md:grid-cols-3 md:p-5">
          <div className="rounded-2xl bg-zinc-900 p-4 text-zinc-100 md:col-span-2">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Authorization header</p>
            <p className="mt-2 break-all text-sm">{authHeader || "(Chua co token)"}</p>
          </div>
          <button
            onClick={() => {
              setToken("")
              setTokenType("Bearer")
            }}
            className="rounded-2xl border border-zinc-900 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-zinc-100"
          >
            Xoa token
          </button>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <ApiCard
            title="POST /auth/login"
            subtitle="Body: email + password"
            actionLabel={busy === "login" ? "Dang goi..." : "Login"}
            onAction={handleLogin}
            disabled={busy !== null}
          >
            <Input
              label="Email"
              value={loginBody.email}
              onChange={(value) => setLoginBody((prev) => ({ ...prev, email: value }))}
            />
            <Input
              label="Password"
              type="password"
              value={loginBody.password}
              onChange={(value) => setLoginBody((prev) => ({ ...prev, password: value }))}
            />
            <JsonBox title="Request" value={loginBody} />
            <JsonBox title="Response" value={loginResult} />
          </ApiCard>

          <ApiCard
            title="POST /auth/register"
            subtitle="Body: email + password + fullName"
            actionLabel={busy === "register" ? "Dang goi..." : "Register"}
            onAction={handleRegister}
            disabled={busy !== null}
          >
            <Input
              label="Email"
              value={registerBody.email}
              onChange={(value) => setRegisterBody((prev) => ({ ...prev, email: value }))}
            />
            <Input
              label="Password"
              type="password"
              value={registerBody.password}
              onChange={(value) => setRegisterBody((prev) => ({ ...prev, password: value }))}
            />
            <Input
              label="Full name"
              value={registerBody.fullName}
              onChange={(value) => setRegisterBody((prev) => ({ ...prev, fullName: value }))}
            />
            <JsonBox title="Request" value={registerBody} />
            <JsonBox title="Response" value={registerResult} />
          </ApiCard>

          <ApiCard
            title="POST /books"
            subtitle="Can token sau login"
            actionLabel={busy === "createBook" ? "Dang goi..." : "Create book"}
            onAction={handleCreateBook}
            disabled={busy !== null}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Title"
                value={createBookBody.title}
                onChange={(value) => setCreateBookBody((prev) => ({ ...prev, title: value }))}
              />
              <Input
                label="ISBN"
                value={createBookBody.isbn}
                onChange={(value) => setCreateBookBody((prev) => ({ ...prev, isbn: value }))}
              />
              <Input
                label="Price"
                type="number"
                value={String(createBookBody.price)}
                onChange={(value) =>
                  setCreateBookBody((prev) => ({ ...prev, price: Number(value) || 0 }))
                }
              />
              <Input
                label="Discount Price"
                type="number"
                value={String(createBookBody.discountPrice)}
                onChange={(value) =>
                  setCreateBookBody((prev) => ({ ...prev, discountPrice: Number(value) || 0 }))
                }
              />
              <Input
                label="Import Price"
                type="number"
                value={String(createBookBody.importPrice)}
                onChange={(value) =>
                  setCreateBookBody((prev) => ({ ...prev, importPrice: Number(value) || 0 }))
                }
              />
              <Input
                label="Stock Quantity"
                type="number"
                value={String(createBookBody.stockQuantity)}
                onChange={(value) =>
                  setCreateBookBody((prev) => ({ ...prev, stockQuantity: Number(value) || 0 }))
                }
              />
              <Input
                label="Publish Date"
                type="date"
                value={createBookBody.publishDate}
                onChange={(value) =>
                  setCreateBookBody((prev) => ({ ...prev, publishDate: value }))
                }
              />
              <Input
                label="Status"
                value={createBookBody.status}
                onChange={(value) => setCreateBookBody((prev) => ({ ...prev, status: value }))}
              />
            </div>
            <TextArea
              label="Description"
              value={createBookBody.description}
              onChange={(value) =>
                setCreateBookBody((prev) => ({ ...prev, description: value }))
              }
            />
            <JsonBox title="Request" value={createBookBody} />
            <JsonBox title="Response" value={createBookResult} />
          </ApiCard>

          <ApiCard
            title="GET /books"
            subtitle="Danh sach sach hien tai"
            actionLabel={busy === "getBooks" ? "Dang goi..." : "Load books"}
            onAction={handleGetBooks}
            disabled={busy !== null}
          >
            <JsonBox title="Response" value={getBooksResult} />

            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-300">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-100">
                  <tr>
                    <th className="px-3 py-2 font-medium">ID</th>
                    <th className="px-3 py-2 font-medium">Title</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {books.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-zinc-500">
                        Chua co du lieu. Bam Load books.
                      </td>
                    </tr>
                  )}

                  {books.map((book) => (
                    <tr key={book.id} className="border-t border-zinc-200">
                      <td className="max-w-44 truncate px-3 py-2" title={book.id}>
                        {book.id}
                      </td>
                      <td className="px-3 py-2">{book.title}</td>
                      <td className="px-3 py-2">{book.price?.toLocaleString("vi-VN")} VND</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          disabled={busy !== null}
                          className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:opacity-50"
                        >
                          Xoa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ApiCard>
        </div>

        <section className="mt-6 rounded-3xl border border-zinc-900/15 bg-white/75 p-5 shadow-sm">
          <h2 className="text-lg font-bold">DELETE /books/{"{id}"}</h2>
          <p className="mt-1 text-sm text-zinc-700">Nhap ID bat ky de xoa sach.</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-amber-700/30 focus:ring"
              placeholder="99e342ee-7789-4195-9cc6-3df5b77c4e54"
            />
            <button
              onClick={() => handleDeleteBook()}
              disabled={busy !== null}
              className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {busy === "deleteBook" ? "Dang goi..." : "Delete by ID"}
            </button>
          </div>
          <JsonBox title="Response" value={deleteResult} />
        </section>
      </div>
    </main>
  )
}

function ApiCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  disabled,
  children,
}: {
  title: string
  subtitle: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-zinc-900/15 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold">{title}</h2>
          <p className="text-xs text-zinc-600">{subtitle}</p>
        </div>
        <button
          onClick={onAction}
          disabled={disabled}
          className="rounded-xl bg-amber-900 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-800 disabled:opacity-50"
        >
          {actionLabel}
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: "text" | "password" | "number" | "date"
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-amber-700/30 focus:ring"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-amber-700/30 focus:ring"
      />
    </label>
  )
}

function JsonBox({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">{title}</p>
      <pre className="max-h-64 overflow-auto rounded-xl bg-zinc-900 p-3 text-xs text-zinc-100">
        {JSON.stringify(value ?? { note: "Chua co du lieu" }, null, 2)}
      </pre>
    </div>
  )
}
