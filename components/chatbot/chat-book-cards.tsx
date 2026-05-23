"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BookCardDto,
  ToolCallTrace,
} from "@/lib/services/chat.service";

export interface ChatBook {
  id: string;
  title: string;
  price?: number;
  discountPrice?: number;
  mainImageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  authorNames?: string[];
}

/**
 * Chuyển danh sách `BookCardDto` (BE đã chuẩn hoá) sang `ChatBook` mà UI dùng.
 * Lọc các phần tử thiếu id/title để tránh card hỏng.
 */
export function mapServerBooks(
  serverBooks: BookCardDto[] | null | undefined
): ChatBook[] {
  if (!serverBooks?.length) return [];
  const seen = new Set<string>();
  const out: ChatBook[] = [];
  for (const b of serverBooks) {
    if (!b?.id || !b?.title || seen.has(b.id)) continue;
    seen.add(b.id);
    out.push({
      id: b.id,
      title: b.title,
      price: b.price ?? undefined,
      discountPrice: b.discountPrice ?? undefined,
      mainImageUrl: b.mainImageUrl ?? undefined,
      averageRating: b.averageRating ?? undefined,
      reviewCount: b.reviewCount ?? undefined,
      stockQuantity: b.stockQuantity ?? undefined,
      authorNames: b.authorNames ?? undefined,
    });
  }
  return out;
}

/**
 * Bóc tách danh sách sách từ trace tool calls trả về bởi AI Agent.
 * Mỗi tool trả data theo shape khác nhau (xem ai-service code), helper
 * này gom hết về `ChatBook[]`, dedupe theo id.
 */
export function extractBooksFromToolCalls(
  toolCalls: ToolCallTrace[] | undefined
): ChatBook[] {
  if (!toolCalls?.length) return [];

  const seen = new Set<string>();
  const out: ChatBook[] = [];

  const pushBook = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return;
    const b = raw as Record<string, unknown>;
    const id = b.id != null ? String(b.id) : "";
    const title = typeof b.title === "string" ? b.title : "";
    if (!id || !title || seen.has(id)) return;
    seen.add(id);
    out.push({
      id,
      title,
      price: toNumber(b.price),
      discountPrice: toNumber(b.discountPrice),
      mainImageUrl:
        typeof b.mainImageUrl === "string"
          ? b.mainImageUrl
          : firstString((b.imageUrls as unknown[]) ?? null),
      averageRating: toNumber(b.averageRating),
      reviewCount: toNumber(b.reviewCount),
      stockQuantity: toNumber(b.stockQuantity),
      authorNames: Array.isArray(b.authorNames)
        ? (b.authorNames as unknown[]).filter(
            (a): a is string => typeof a === "string"
          )
        : undefined,
    });
  };

  const drillPageResponse = (resp: unknown) => {
    if (!resp || typeof resp !== "object") return;
    const r = resp as Record<string, unknown>;
    const result = (r.result as Record<string, unknown> | undefined) ?? r;
    const content = (result?.content as unknown) ?? r.content;
    if (Array.isArray(content)) {
      content.forEach(pushBook);
      return;
    }
    if (Array.isArray(result)) {
      (result as unknown[]).forEach(pushBook);
    }
  };

  for (const tc of toolCalls) {
    if (!tc?.success || !tc.data) continue;
    const d = tc.data as Record<string, unknown>;

    switch (tc.toolName) {
      case "searchBooksTool":
        drillPageResponse(d.books);
        break;

      case "semanticSearchTool": {
        const results = d.results;
        if (Array.isArray(results)) {
          results.forEach((r) => {
            const item = r as Record<string, unknown>;
            drillPageResponse(item?.data);
          });
        }
        break;
      }

      case "stockCheckTool": {
        if (d.mode === "filter") drillPageResponse(d.books);
        if (d.mode === "single") {
          const book = d.book as Record<string, unknown> | undefined;
          if (book?.result) pushBook(book.result);
          else pushBook(book);
        }
        break;
      }

      case "recommendationTool":
        drillPageResponse(d.suggestedBooks);
        drillPageResponse(d.bestSellingBooks);
        break;

      case "compareBooksTool": {
        const list = d.comparison;
        if (Array.isArray(list)) {
          list.forEach((item) => {
            const obj = item as Record<string, unknown>;
            drillPageResponse(obj?.data);
            const resp = obj?.data as Record<string, unknown> | undefined;
            const result = resp?.result;
            if (Array.isArray(result)) (result as unknown[]).forEach(pushBook);
          });
        }
        break;
      }

      case "imageScannerTool":
        drillPageResponse(d.matchedBooks);
        break;

      default:
        break;
    }
  }

  return out;
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return undefined;
}

function firstString(arr: unknown[] | null): string | undefined {
  if (!Array.isArray(arr)) return undefined;
  for (const v of arr) if (typeof v === "string" && v) return v;
  return undefined;
}

interface ChatBookCardsProps {
  books: ChatBook[];
  onCardClick?: () => void;
  className?: string;
}

/**
 * Hiển thị danh sách card sách dạng cuộn ngang trong chat bubble.
 * Mỗi card là <Link> tới `/products/{id}` để user bấm vào xem chi tiết.
 */
export function ChatBookCards({
  books,
  onCardClick,
  className,
}: ChatBookCardsProps) {
  if (!books?.length) return null;

  return (
    <div
      className={cn(
        "mt-2 -mx-1 flex w-full max-w-[260px] gap-2 overflow-x-auto pb-1",
        "scrollbar-thin scrollbar-thumb-muted-foreground/30",
        "sm:max-w-[340px]",
        className
      )}
    >
      {books.slice(0, 8).map((book) => (
        <ChatBookCard key={book.id} book={book} onClick={onCardClick} />
      ))}
    </div>
  );
}

function ChatBookCard({
  book,
  onClick,
}: {
  book: ChatBook;
  onClick?: () => void;
}) {
  const displayPrice =
    book.discountPrice && book.discountPrice > 0
      ? book.discountPrice
      : book.price;
  const hasDiscount =
    book.discountPrice != null &&
    book.discountPrice > 0 &&
    book.price != null &&
    book.discountPrice < book.price;

  return (
    <Link
      href={`/products/${book.id}`}
      onClick={onClick}
      className={cn(
        "group flex w-[140px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background",
        "shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
      )}
    >
      <div className="relative h-[110px] w-full bg-muted">
        {book.mainImageUrl ? (
          <Image
            src={book.mainImageUrl}
            alt={book.title}
            fill
            sizes="140px"
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
        )}
        {book.stockQuantity != null && book.stockQuantity <= 0 && (
          <span className="absolute left-1 top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
            Hết hàng
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2">
        <p
          className="line-clamp-2 text-xs font-semibold text-foreground"
          title={book.title}
        >
          {book.title}
        </p>

        {book.authorNames && book.authorNames.length > 0 && (
          <p
            className="line-clamp-1 text-[10px] text-muted-foreground"
            title={book.authorNames.join(", ")}
          >
            {book.authorNames.join(", ")}
          </p>
        )}

        {book.averageRating != null && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span className="font-medium text-foreground">
              {book.averageRating.toFixed(1)}
            </span>
            {book.reviewCount != null && book.reviewCount > 0 && (
              <span>({book.reviewCount})</span>
            )}
          </div>
        )}

        {displayPrice != null && (
          <div className="mt-auto flex flex-col">
            <span className="text-sm font-bold text-primary">
              {displayPrice.toLocaleString("vi-VN")}₫
            </span>
            {hasDiscount && book.price != null && (
              <span className="text-[10px] text-muted-foreground line-through">
                {book.price.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        )}

        <span className="mt-1 text-center text-[10px] font-medium text-primary opacity-0 transition group-hover:opacity-100">
          Xem chi tiết →
        </span>
      </div>
    </Link>
  );
}
