"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Facebook, Linkedin, Link as LinkIcon, Share2, Twitter } from "lucide-react"

interface NewsDetailActionsProps {
  title: string
}

export function NewsDetailActions({ title }: NewsDetailActionsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleShare = (platform: string) => {
    const url = window.location.href
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    }

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Đã sao chép link!")
      return
    }

    window.open(shareUrls[platform], "_blank", "width=600,height=400")
  }

  return (
    <div className="flex items-center gap-2 mb-8 pb-6 border-b">
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() => setShowShareMenu((value) => !value)}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Chia sẻ
      </Button>

      {showShareMenu && (
        <div className="flex items-center gap-1 ml-2">
          <Button variant="outline" size="sm" type="button" onClick={() => handleShare("facebook")} title="Chia sẻ trên Facebook">
            <Facebook className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => handleShare("twitter")} title="Chia sẻ trên Twitter">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => handleShare("linkedin")} title="Chia sẻ trên LinkedIn">
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => handleShare("copy")} title="Sao chép link">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
