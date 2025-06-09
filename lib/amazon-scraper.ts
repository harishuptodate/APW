import { parse } from "node-html-parser"

export interface ProductData {
  title: string
  imageUrl: string
  amazonUrl: string
}

export async function scrapeAmazonProduct(amazonUrl: string): Promise<ProductData> {
  // Validate the URL is from Amazon
  if (!amazonUrl.includes("amazon.") && !amazonUrl.includes("amzn.to")) {
    throw new Error("Please provide a valid Amazon product URL")
  }

  let finalUrl = amazonUrl

  // Handle short links (amzn.to)
  if (amazonUrl.includes("amzn.to")) {
    const response = await fetch(amazonUrl, { redirect: "follow" })
    finalUrl = response.url
  }

  // Fetch the product page
  const response = await fetch(finalUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch product information")
  }

  const html = await response.text()
  const root = parse(html)

  // Extract product title
  const titleElement = root.querySelector("#productTitle")
  const title = titleElement ? titleElement.text.trim() : "Unknown Product"

  // Extract product image
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
    throw new Error("Could not find product image")
  }

  return {
    title,
    imageUrl,
    amazonUrl: finalUrl,
  }
}
