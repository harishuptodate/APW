"use server"

import { v4 as uuidv4 } from "uuid"
import { scrapeAmazonProduct } from "@/lib/amazon-scraper"

// In a real app, we'd use a database
// For this example, we'll use server-side memory storage
let productsStore: Array<{
  id: string
  title: string
  imageUrl: string
  amazonUrl: string
}> = []

export async function fetchProductImage(amazonUrl: string) {
  try {
    const productData = await scrapeAmazonProduct(amazonUrl)

    // Store the product
    const product = {
      id: uuidv4(),
      title: productData.title,
      imageUrl: productData.imageUrl,
      amazonUrl: productData.amazonUrl,
    }

    productsStore.unshift(product) // Add to the beginning of the array

    // Keep only the last 10 products
    if (productsStore.length > 10) {
      productsStore = productsStore.slice(0, 10)
    }

    return { success: true, product }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { error: error instanceof Error ? error.message : "Failed to process the Amazon link" }
  }
}

export async function getStoredProducts() {
  return productsStore
}
