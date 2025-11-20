"use client"

import { useState, useEffect } from "react"
import { toggleBookmark as toggleBookmarkAction, isProductBookmarked } from "@/app/actions/bookmarks"

// Guest bookmark management using localStorage
const GUEST_BOOKMARKS_KEY = "reknur_guest_bookmarks"

function getGuestBookmarks(): string[] {
  if (typeof window === "undefined") return []
  try {
    const bookmarks = localStorage.getItem(GUEST_BOOKMARKS_KEY)
    return bookmarks ? JSON.parse(bookmarks) : []
  } catch {
    return []
  }
}

function setGuestBookmarks(bookmarks: string[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GUEST_BOOKMARKS_KEY, JSON.stringify(bookmarks))
    window.dispatchEvent(new CustomEvent("bookmarksChanged"))
  } catch (error) {
    console.error("Failed to save guest bookmarks:", error)
  }
}

export function useBookmarks(productId: string, isAuthenticated: boolean) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load initial bookmark status
  useEffect(() => {
    async function loadBookmarkStatus() {
      if (isAuthenticated) {
        const result = await isProductBookmarked(productId)
        setIsBookmarked(result.bookmarked)
      } else {
        const guestBookmarks = getGuestBookmarks()
        setIsBookmarked(guestBookmarks.includes(productId))
      }
    }

    loadBookmarkStatus()

    if (!isAuthenticated) {
      const handleBookmarkChange = () => {
        const guestBookmarks = getGuestBookmarks()
        setIsBookmarked(guestBookmarks.includes(productId))
      }

      window.addEventListener("bookmarksChanged", handleBookmarkChange)
      return () => window.removeEventListener("bookmarksChanged", handleBookmarkChange)
    }
  }, [productId, isAuthenticated])

  async function toggleBookmark() {
    setIsLoading(true)

    try {
      if (isAuthenticated) {
        // Handle authenticated users - save to database
        const result = await toggleBookmarkAction(productId)

        if (result.error) {
          alert(result.error)
          return
        }

        setIsBookmarked(result.bookmarked || false)
      } else {
        // Handle guest users - save to localStorage
        const guestBookmarks = getGuestBookmarks()
        const isCurrentlyBookmarked = guestBookmarks.includes(productId)

        if (isCurrentlyBookmarked) {
          const updated = guestBookmarks.filter((id) => id !== productId)
          setGuestBookmarks(updated)
          setIsBookmarked(false)
        } else {
          const updated = [...guestBookmarks, productId]
          setGuestBookmarks(updated)
          setIsBookmarked(true)
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
      alert("Failed to save product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return { isBookmarked, isLoading, toggleBookmark }
}

// Export function to get all guest bookmarks
export function getAllGuestBookmarks(): string[] {
  return getGuestBookmarks()
}

// Export function to clear guest bookmarks (useful after sign in)
export function clearGuestBookmarks() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_BOOKMARKS_KEY)
  }
}
