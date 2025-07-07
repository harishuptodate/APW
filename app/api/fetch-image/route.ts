import { type NextRequest, NextResponse } from "next/server"
import { scrapeAmazonProduct } from "@/lib/amazon-scraper"

async function fetchWithRetry(amazonUrl: string, maxRetries = 3): Promise<any> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeAmazonProduct(amazonUrl)
      return result
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        // Wait longer between retries (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amazonUrl, retries = 2 } = body

    if (!amazonUrl) {
      return NextResponse.json({ error: "Amazon URL is required" }, { status: 400 })
    }

    const productData = await fetchWithRetry(amazonUrl, Math.min(retries, 3))

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: productData.imageUrl,
        title: productData.title,
        amazonUrl: productData.amazonUrl,
      },
    })
  } catch (error) {
    console.error("Error fetching product:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to process the Amazon link"

    // Provide more specific error codes
    let statusCode = 500
    if (errorMessage.includes("CAPTCHA") || errorMessage.includes("blocking")) {
      statusCode = 429 // Too Many Requests
    } else if (errorMessage.includes("timeout")) {
      statusCode = 408 // Request Timeout
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amazonUrl = searchParams.get("url")
  const retries = Number.parseInt(searchParams.get("retries") || "2")

  if (!amazonUrl) {
    return NextResponse.json({ error: "Amazon URL is required as 'url' query parameter" }, { status: 400 })
  }

  try {
    const productData = await fetchWithRetry(amazonUrl, Math.min(retries, 3))

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: productData.imageUrl,
        title: productData.title,
        amazonUrl: productData.amazonUrl,
      },
    })
  } catch (error) {
    console.error("Error fetching product:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to process the Amazon link"

    let statusCode = 500
    if (errorMessage.includes("CAPTCHA") || errorMessage.includes("blocking")) {
      statusCode = 429
    } else if (errorMessage.includes("timeout")) {
      statusCode = 408
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
