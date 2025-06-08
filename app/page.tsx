import { LinkForm } from "@/components/link-form"
import { ProductImages } from "@/components/product-images"
import { ProductProvider } from "@/context/product-context"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Amazon Product Image Fetcher</h1>
          <p className="text-gray-600 text-center mb-8">
            Paste Amazon product links (short or long format) to fetch and display product images
          </p>

          <ProductProvider>
            <div className="bg-white rounded-lg shadow-md p-6">
              <LinkForm />
            </div>

            <ProductImages />
          </ProductProvider>
        </div>
      </div>
    </div>
  )
}
