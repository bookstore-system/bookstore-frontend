import Link from "next/link"
import { cn } from "@/lib/utils"

function CoverSkeleton({
  className,
  featured = false,
}: {
  className?: string
  featured?: boolean
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[5px] shadow-[0_14px_36px_-10px_rgba(55,35,20,0.4)] ring-1 ring-white/55",
        featured
          ? "h-[58%] max-h-[13.5rem] w-[34%] max-w-[7.5rem]"
          : "h-[48%] max-h-[11rem] w-[28%] max-w-[6.25rem] opacity-80",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-secondary/50 to-primary/15" />
      <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-foreground/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute bottom-3.5 left-2.5 right-2.5 space-y-1.5">
        <div className="h-2 w-[78%] rounded-full bg-foreground/14" />
        <div className="h-1.5 w-[52%] rounded-full bg-foreground/10" />
      </div>
    </div>
  )
}

/**
 * Placeholder hero khi chưa có sách bán chạy — layout khớp slide carousel thật.
 */
export function HeroBooksPlaceholder() {
  return (
    <Link
      href="/products"
      className="group relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-secondary/90 via-muted/40 to-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div
        className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-primary/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-52 w-52 rounded-full bg-accent/12 blur-3xl"
        aria-hidden
      />

      <div className="absolute right-4 top-4 flex items-center gap-1.5" aria-hidden>
        <span className="h-1.5 w-5 rounded-full bg-primary/60 transition-all group-hover:w-6" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
      </div>

      <div className="relative flex flex-1 items-end justify-center gap-1.5 px-3 pb-1 pt-10 sm:gap-2.5 sm:px-5">
        <CoverSkeleton className="-rotate-[8deg] translate-y-3" />
        <CoverSkeleton
          featured
          className="z-10 -translate-y-1 transition-transform duration-500 group-hover:-translate-y-2.5"
        />
        <CoverSkeleton className="rotate-[8deg] translate-y-4" />
      </div>

      <div className="bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-14 text-left sm:px-5 sm:pb-5">
        <p className="text-sm font-semibold text-white sm:text-base">
          Tủ sách bán chạy đang được cập nhật
        </p>
        <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
          Nhấn để khám phá toàn bộ danh mục
        </p>
      </div>
    </Link>
  )
}
