import { type NextRequest, NextResponse } from "next/server"
import { scrapeAmazonProduct } from "@/lib/amazon-scraper"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amazonUrl } = body

    if (!amazonUrl) {
      return NextResponse.json({ error: "Amazon URL is required" }, { status: 400 })
    }

    const productData = await scrapeAmazonProduct(amazonUrl)

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

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process the Amazon link",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amazonUrl = searchParams.get("url")

  if (!amazonUrl) {
    return NextResponse.json({ error: "Amazon URL is required as 'url' query parameter" }, { status: 400 })
  }

  try {
    const productData = await scrapeAmazonProduct(amazonUrl)

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

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process the Amazon link",
      },
      { status: 500 },
    )
  }
}
