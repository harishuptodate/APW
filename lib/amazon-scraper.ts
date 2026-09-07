import { parse } from "node-html-parser"

export interface ProductData {
  title: string
  imageUrl: string
  amazonUrl: string
}

export type AmazonScrapeErrorCode =
  | "invalid_url"
  | "short_url_resolution_failed"
  | "timeout"
  | "blocked"
  | "captcha"
  | "upstream_http_error"
  | "image_not_found"
  | "unexpected"

export class AmazonScrapeError extends Error {
  code: AmazonScrapeErrorCode
  statusCode: number
  retryable: boolean
  upstreamStatus?: number

  constructor(
    message: string,
    options: {
      code: AmazonScrapeErrorCode
      statusCode: number
      retryable: boolean
      upstreamStatus?: number
    },
  ) {
    super(message)
    this.name = "AmazonScrapeError"
    this.code = options.code
    this.statusCode = options.statusCode
    this.retryable = options.retryable
    this.upstreamStatus = options.upstreamStatus
  }
}

// Multiple User-Agent strings to rotate
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
]

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// Add delay to avoid rate limiting
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createAmazonScrapeError(
  message: string,
  options: {
    code: AmazonScrapeErrorCode
    statusCode: number
    retryable: boolean
    upstreamStatus?: number
  },
): AmazonScrapeError {
  return new AmazonScrapeError(message, options)
}

export function normalizeAmazonScrapeError(error: unknown): AmazonScrapeError {
  if (error instanceof AmazonScrapeError) {
    return error
  }

  if (error instanceof Error && error.name === "AbortError") {
    return createAmazonScrapeError("Amazon request timed out. Please try again.", {
      code: "timeout",
      statusCode: 408,
      retryable: true,
    })
  }

  if (error instanceof Error) {
    return createAmazonScrapeError(error.message, {
      code: "unexpected",
      statusCode: 500,
      retryable: false,
    })
  }

  return createAmazonScrapeError("An unexpected error occurred while fetching the product", {
    code: "unexpected",
    statusCode: 500,
    retryable: false,
  })
}

export async function scrapeAmazonProduct(amazonUrl: string): Promise<ProductData> {
  // Validate the URL is from Amazon
  if (!amazonUrl.includes("amazon.") && !amazonUrl.includes("amzn.to")) {
    throw createAmazonScrapeError("Please provide a valid Amazon product URL", {
      code: "invalid_url",
      statusCode: 400,
      retryable: false,
    })
  }

  let finalUrl = amazonUrl

  try {
    // Handle short links (amzn.to) with timeout
    if (amazonUrl.includes("amzn.to")) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const response = await fetch(amazonUrl, {
          redirect: "follow",
          signal: controller.signal,
          headers: {
            "User-Agent": getRandomUserAgent(),
          },
        })
        clearTimeout(timeoutId)
        finalUrl = response.url
      } catch {
        clearTimeout(timeoutId)
        throw createAmazonScrapeError("Failed to resolve short URL", {
          code: "short_url_resolution_failed",
          statusCode: 502,
          retryable: true,
        })
      }
    }

    // Add small delay to avoid rate limiting
    await delay(Math.random() * 1000 + 500) // 500-1500ms random delay

    // Fetch the product page with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(finalUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429 || response.status === 503) {
        throw createAmazonScrapeError("Amazon is temporarily blocking requests. Please try again later.", {
          code: "blocked",
          statusCode: 429,
          retryable: true,
          upstreamStatus: response.status,
        })
      }
      throw createAmazonScrapeError(`Failed to fetch product page (Status: ${response.status})`, {
        code: "upstream_http_error",
        statusCode: 502,
        retryable: response.status >= 500,
        upstreamStatus: response.status,
      })
    }

    const html = await response.text()

    // Check if we got a CAPTCHA page
    if (html.includes("captcha") || html.includes("Robot Check")) {
      throw createAmazonScrapeError("Amazon CAPTCHA detected. Please try again later or from a different IP.", {
        code: "captcha",
        statusCode: 429,
        retryable: false,
      })
    }

    const root = parse(html)

    // Extract product title with multiple fallbacks
    let title = "Unknown Product"
    const titleSelectors = [
      "#productTitle",
      ".product-title",
      "[data-automation-id='product-title']",
      "h1.a-size-large",
      "h1 span",
    ]

    for (const selector of titleSelectors) {
      const element = root.querySelector(selector)
      if (element && element.text.trim()) {
        title = element.text.trim()
        break
      }
    }

    // Extract product image with multiple strategies
    let imageUrl = ""

    // Strategy 1: Try main image selectors
    const imageSelectors = [
      "#landingImage",
      "#imgBlkFront",
      "#ebooksImgBlkFront",
      ".a-dynamic-image",
      "[data-old-hires]",
      ".a-image-wrapper img",
    ]

    for (const selector of imageSelectors) {
      const element = root.querySelector(selector)
      if (element) {
        // Try different attributes
        const attrs = ["data-old-hires", "data-a-hires", "src", "data-src"]
        for (const attr of attrs) {
          const url = element.getAttribute(attr)
          if (url && url.startsWith("http")) {
            imageUrl = url
            break
          }
        }
        if (imageUrl) break
      }
    }

    // Strategy 2: Parse JavaScript data
    if (!imageUrl) {
      const scriptTags = root.querySelectorAll("script")
      for (const script of scriptTags) {
        const content = script.text

        // Try different patterns
        const patterns = [
          /"large":"([^"]+)"/,
          /"hiRes":"([^"]+)"/,
          /"main":{"[^"]+":"([^"]+)"/,
          /colorImages[^{]*{[^{]*"large":"([^"]+)"/,
        ]

        for (const pattern of patterns) {
          const match = content.match(pattern)
          if (match && match[1]) {
            imageUrl = match[1].replace(/\\u[\dA-F]{4}/gi, (match) => {
              return String.fromCharCode(Number.parseInt(match.replace(/\\u/g, ""), 16))
            })
            break
          }
        }
        if (imageUrl) break
      }
    }

    // Strategy 3: Look for any Amazon image URLs in the HTML
    if (!imageUrl) {
      const imageRegex = /https:\/\/[^"'\s]*\.media-amazon\.com[^"'\s]*\.(jpg|jpeg|png|webp)/gi
      const matches = html.match(imageRegex)
      if (matches && matches.length > 0) {
        // Filter out small images (thumbnails, icons)
        const largeImages = matches.filter(
          (url) => !url.includes("._AC_") || url.includes("._AC_SL") || url.includes("._AC_UL"),
        )
        if (largeImages.length > 0) {
          imageUrl = largeImages[0]
        }
      }
    }

    if (!imageUrl) {
      throw createAmazonScrapeError(
        "Could not find product image. The page structure may have changed or the product may not have images.",
        {
          code: "image_not_found",
          statusCode: 422,
          retryable: false,
        },
      )
    }

    // Clean up the image URL (remove size restrictions for higher quality)
    imageUrl = imageUrl.replace(/\._[A-Z]{2}\d+_/, ".")

    return {
      title,
      imageUrl,
      amazonUrl: finalUrl,
    }
  } catch (error) {
    throw normalizeAmazonScrapeError(error)
  }
}
