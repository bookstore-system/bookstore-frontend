"use client"

import { useState } from "react"

export interface NewsTocSection {
  level: number
  title: string
  id: string
}

interface NewsTableOfContentsProps {
  sections: NewsTocSection[]
}

export function NewsTableOfContents({ sections }: NewsTableOfContentsProps) {
  const [open, setOpen] = useState(false)

  if (sections.length === 0) return null

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const offset = 100
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: elementPosition - offset,
      behavior: "smooth",
    })
    setOpen(false)
  }

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-border rounded-lg mb-8 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7m-9-2a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Mục lục</span>
        </div>
        <svg
          className={`h-5 w-5 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-border/50">
          <ul className="space-y-2.5 mt-4">
            {sections.map((section, index) => (
              <li
                key={`${section.id}-${index}`}
                style={{ paddingLeft: `${Math.max(section.level - 2, 0) * 24}px` }}
                className="relative"
              >
                <button
                  type="button"
                  className="text-foreground hover:text-primary transition-all inline-flex items-center gap-2 py-1 hover:translate-x-2 duration-200 font-medium text-left"
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="text-primary/70">›</span>
                  <span className="hover:underline">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
