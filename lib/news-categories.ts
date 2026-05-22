/**
 * Danh mục tin tức — dùng chung create / edit / admin filter.
 * Giá trị `value` phải khớp chuỗi lưu trong DB (field category).
 */
export const NEWS_CATEGORIES = [
  { value: "Lập trình", label: "Lập trình" },
  { value: "Sách kinh tế", label: "Sách kinh tế" },
  { value: "Văn học", label: "Văn học" },
  { value: "Tâm lý - Kỹ năng", label: "Tâm lý" },
  { value: "Thiếu nhi", label: "Thiếu nhi" },
  { value: "Khuyến mãi", label: "Khuyến mãi" },
  { value: "Tin tức", label: "Tin tức" },
  { value: "Giải trí", label: "Giải trí" },
] as const

export type NewsCategoryValue = (typeof NEWS_CATEGORIES)[number]["value"]
