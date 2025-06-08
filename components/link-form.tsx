"use client"

import type React from "react"

import { useState } from "react"
import { fetchProductImage } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function LinkForm() {
  const [amazonLink, setAmazonLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amazonLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter an Amazon product link",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await fetchProductImage(amazonLink)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Product image fetched successfully",
        })
        setAmazonLink("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product image",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="amazon-link" className="text-sm font-medium">
          Amazon Product Link
        </label>
        <Input
          id="amazon-link"
          type="text"
          placeholder="https://www.amazon.com/... or https://amzn.to/..."
          value={amazonLink}
          onChange={(e) => setAmazonLink(e.target.value)}
          className="w-full"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Fetching..." : "Fetch Product Image"}
      </Button>
    </form>
  )
}
