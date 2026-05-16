"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductCard } from "@/components/products/product-card";
import { booksService, type Book } from "@/lib/services/books.service";
import type { FilterOptions } from "@/lib/types";
import { Filter, Search } from "lucide-react";

const defaultFilters: FilterOptions = {
  categories: [],
  priceRange: [0, 10000000],
  ratings: [],
  sortBy: "popular",
};

function ProductsEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border">
        <Search
          className="h-14 w-14 text-muted-foreground/70"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
      <p className="text-lg font-medium text-foreground mb-2">
        Hiện tại chưa tìm thấy sách nào...
      </p>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Thử điều chỉnh bộ lọc hoặc quay lại sau nhé.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4"
      >
        Xóa các bộ lọc
      </button>
    </div>
  );
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        const apiFilters: Record<string, unknown> = {
          page: currentPage - 1,
          size: itemsPerPage,
        };

        if (filters.priceRange[0] > 0) {
          apiFilters.minPrice = filters.priceRange[0];
        }
        if (filters.priceRange[1] < 10000000) {
          apiFilters.maxPrice = filters.priceRange[1];
        }

        if (filters.ratings.length > 0) {
          apiFilters.minRating = Math.min(...filters.ratings);
        }

        if (filters.categories.length > 0) {
          apiFilters.danhMuc = filters.categories;
        }

        switch (filters.sortBy) {
          case "newest":
            apiFilters.option = "moinhat";
            break;
          case "popular":
            apiFilters.option = "phobien";
            break;
          case "price-low":
            apiFilters.option = "thapdencao";
            break;
          case "price-high":
            apiFilters.option = "caodenthap";
            break;
          case "rating":
            apiFilters.option = "danhgiacao";
            break;
          default:
            apiFilters.option = "phobien";
        }

        const response = await booksService.getBooks(apiFilters);

        setBooks(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      } catch (err) {
        setBooks([]);
        setTotalPages(1);
        setTotalElements(0);
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, filters]);

  const filteredProducts = useMemo(() => books, [books]);

  const handleReset = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.categories, filters.priceRange, filters.ratings, filters.sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="border-b border-border bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cửa hàng sách
            </h1>
            <p className="text-muted-foreground">
              {loading ? "..." : `${totalElements} sách tìm thấy`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="hidden w-full max-w-xs shrink-0 lg:block">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleReset}
              />
            </aside>

            <div className="min-w-0 flex-1">
              <div className="lg:hidden mb-6">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Filter size={18} />
                  Bộ lọc
                </button>
              </div>

              {mobileFiltersOpen && (
                <div className="mb-6 rounded-lg border border-border bg-card p-4 lg:hidden">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={handleReset}
                  />
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Đang tải...</p>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {filteredProducts.map((book, index) => (
                      <ProductCard
                        key={book.id || `book-${index}`}
                        book={book}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ≪
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>
                        <div className="flex gap-2 flex-wrap justify-center">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[40px] px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                      currentPage === page
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border bg-card hover:bg-muted"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              }
                              if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                              ) {
                                return (
                                  <span
                                    key={page}
                                    className="px-2 py-2 text-muted-foreground"
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            }
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ≫
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <ProductsEmptyState onReset={handleReset} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
