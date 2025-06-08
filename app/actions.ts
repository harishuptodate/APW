"use server"

import { parse } from "node-html-parser"
import { v4 as uuidv4 } from "uuid"

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
    // Validate the URL is from Amazon
    if (!amazonUrl.includes("amazon.") && !amazonUrl.includes("amzn.to")) {
      return { error: "Please provide a valid Amazon product URL" }
    }

    // Handle short links (amzn.to)
    if (amazonUrl.includes("amzn.to")) {
      const response = await fetch(amazonUrl, { redirect: "follow" })
      amazonUrl = response.url
    }

    // Fetch the product page
    const response = await fetch(amazonUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return { error: "Failed to fetch product information" }
    }

    const html = await response.text()
    const root = parse(html)

    // Extract product title
    const titleElement = root.querySelector("#productTitle")
    const title = titleElement ? titleElement.text.trim() : "Unknown Product"

    // Extract product image
    // Amazon uses different image selectors, so we try multiple options
    let imageUrl = ""

    // Try to find the main product image
    const mainImageElement =
      root.querySelector("#landingImage") ||
      root.querySelector("#imgBlkFront") ||
      root.querySelector("#ebooksImgBlkFront")

    if (mainImageElement && mainImageElement.getAttribute("data-old-hires")) {
      imageUrl = mainImageElement.getAttribute("data-old-hires") || ""
    } else if (mainImageElement && mainImageElement.getAttribute("src")) {
      imageUrl = mainImageElement.getAttribute("src") || ""
    }

    // If we couldn't find the image, try another approach
    if (!imageUrl) {
      const scriptTags = root.querySelectorAll("script")
      for (const script of scriptTags) {
        const content = script.text
        if (content.includes("'colorImages'")) {
          const match = content.match(/"large":"([^"]+)"/)
          if (match && match[1]) {
            imageUrl = match[1]
            break
          }
        }
      }
    }

    if (!imageUrl) {
      return { error: "Could not find product image" }
    }

    // Store the product
    const product = {
      id: uuidv4(),
      title,
      imageUrl,
      amazonUrl,
    }

    productsStore.unshift(product) // Add to the beginning of the array

    // Keep only the last 10 products
    if (productsStore.length > 10) {
      productsStore = productsStore.slice(0, 10)
    }

    // Dispatch a custom event to notify the client
    // This is a workaround since we can't directly update client state from server actions
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage-updated"))
    }

    return { success: true, product }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { error: "Failed to process the Amazon link" }
  }
}

export async function getStoredProducts() {
  return productsStore
}
