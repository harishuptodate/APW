"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/context/product-context"
import { addProduct } from "@/app/actions"

export function LinkForm() {
  const [amazonLink, setAmazonLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { refreshProducts } = useProducts()

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

      // Use GET request to our API endpoint
      const response = await fetch(`/api/fetch-image?url=${encodeURIComponent(amazonLink)}&retries=3`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch product image",
          variant: "destructive",
        })
      } else {
        // Store the product using server action
        const storeResult = await addProduct({
          title: result.data.title,
          imageUrl: result.data.imageUrl,
          amazonUrl: result.data.amazonUrl,
        })

        if (storeResult.success) {
          toast({
            title: "Success",
            description: "Product image fetched and saved successfully",
          })
          setAmazonLink("")
          // Refresh the products list after successful fetch and store
          await refreshProducts()
        } else {
          toast({
            title: "Warning",
            description: "Image fetched but failed to save locally",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
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

      {isLoading && (
        <p className="text-sm text-gray-500 text-center">
          This may take a few seconds... Amazon sometimes requires multiple attempts.
        </p>
      )}
    </form>
  )
}
