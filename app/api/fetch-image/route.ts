import { type NextRequest, NextResponse } from "next/server"
import { AmazonScrapeError, normalizeAmazonScrapeError, scrapeAmazonProduct, type ProductData } from "@/lib/amazon-scraper"

type FetchImageErrorResponse = {
  error: string
  code: AmazonScrapeError["code"]
  retryable: boolean
  attempts: number
  upstreamStatus?: number
}

async function fetchWithRetry(amazonUrl: string, maxRetries = 3): Promise<ProductData> {
  let lastError: AmazonScrapeError | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeAmazonProduct(amazonUrl)
      return result
    } catch (error) {
      lastError = normalizeAmazonScrapeError(error)
      console.log(`Attempt ${attempt} failed [${lastError.code}]`, lastError.message)

      if (!lastError.retryable) {
        break
      }

      if (attempt < maxRetries) {
        // Wait longer between retries (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError ?? new AmazonScrapeError("Failed to process the Amazon link", {
    code: "unexpected",
    statusCode: 500,
    retryable: false,
  })
}

function createErrorResponse(error: unknown, attempts: number) {
  const normalizedError = normalizeAmazonScrapeError(error)
  const responseBody: FetchImageErrorResponse = {
    error: normalizedError.message,
    code: normalizedError.code,
    retryable: normalizedError.retryable,
    attempts,
  }

  if (normalizedError.upstreamStatus) {
    responseBody.upstreamStatus = normalizedError.upstreamStatus
  }

  return NextResponse.json(responseBody, { status: normalizedError.statusCode })
}

export async function POST(request: NextRequest) {
  let retries = 2

  try {
    const body = await request.json()
    const { amazonUrl, retries: retryCount = 2 } = body
    retries = Math.min(retryCount, 3)

    if (!amazonUrl) {
      return NextResponse.json({ error: "Amazon URL is required" }, { status: 400 })
    }

    const productData = await fetchWithRetry(amazonUrl, retries)

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
    return createErrorResponse(error, retries)
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amazonUrl = searchParams.get("url")
  const retries = Math.min(Number.parseInt(searchParams.get("retries") || "2"), 3)

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
    return createErrorResponse(error, retries)
  }
}
