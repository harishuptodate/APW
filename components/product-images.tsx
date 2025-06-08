"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useProducts } from "@/context/product-context"

export function ProductImages() {
  const { products } = useProducts()

  if (products.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500">No product images yet. Add an Amazon link to get started.</div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Fetched Product Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={product.imageUrl || "/placeholder.svg"} alt={product.title} fill className="object-contain" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
              <div className="mt-3 flex justify-between items-center">
                <a
                  href={product.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View on Amazon
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={async () => {
                    // We would implement a remove function here
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
