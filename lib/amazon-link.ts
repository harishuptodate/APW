const DEFAULT_AFFILIATE_TAG = "harishch-21"

const ASIN_PATH_PATTERN = /\/(?:dp|gp\/product|gp\/aw\/d)\/([a-z0-9]{10})(?:[/?#]|$)/i

function extractUrl(value: string): URL {
  const match = value.trim().match(/https?:\/\/[^\s]+/i)

  if (!match) {
    throw new Error("Please provide a valid Amazon.in product URL")
  }

  try {
    return new URL(match[0])
  } catch {
    throw new Error("Please provide a valid Amazon.in product URL")
  }
}

// function isAmazonIndiaHost(hostname: string): boolean {
//   return hostname === "amazon.in" || hostname.endsWith(".amazon.in")
// }

export function isAmazonShortUrl(value: string): boolean {
  const { hostname } = extractUrl(value)
  return hostname === "amzn.to" || hostname === "www.amzn.to"
}

export function cleanAmazonProductUrl(
  value: string,
  affiliateTag = process.env.AMAZON_AFFILIATE_TAG?.trim() || DEFAULT_AFFILIATE_TAG,
): string {
  const url = extractUrl(value)

  // if (!isAmazonIndiaHost(url.hostname.toLowerCase())) {
  //   throw new Error("Please provide a valid Amazon.in product URL")
  // }

  const asin = url.pathname.match(ASIN_PATH_PATTERN)?.[1]

  if (!asin) {
    throw new Error("Could not find a valid product ASIN in the Amazon link")
  }

  const cleanUrl = new URL(`https://www.amazon.in/dp/${asin.toUpperCase()}`)
  cleanUrl.searchParams.set("tag", affiliateTag)
  return cleanUrl.toString()
}

export function cleanAmazonImageUrl(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/\._[^.]+_(?=\.[a-z0-9]{3,4}(?:$|\?))/i, "")
}
