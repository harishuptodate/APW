"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useProducts } from "@/context/product-context"
import { deleteProduct } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

export function ProductImages() {
  const { products, refreshProducts, isLoading } = useProducts()
  const { toast } = useToast()
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Function to handle product deletion
  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id))
    await deleteProduct(id)
    await refreshProducts()
    setDeletingIds((prev) => new Set(prev).delete(id))
    toast({
      title: "Success",
      description: "Product deleted successfully",
    })
  }

  // Add loading state
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          Loading products...
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500">No product images yet. Add an Amazon link to get started.</div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Fetched Product Images ({products.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-contain"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=200"
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.title}</h3>
              <div className="flex justify-between items-center gap-2">
                <a
                  href={product.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex-1 truncate"
                >
                  View on Amazon
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 bg-transparent"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingIds.has(product.id)}
                >
                  {deletingIds.has(product.id) ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={async () => {
              // Delete all products
              const deletePromises = products.map((product) => deleteProduct(product.id))
              await Promise.all(deletePromises)
              await refreshProducts()
              toast({
                title: "Success",
                description: "All products cleared",
              })
            }}
            className="text-red-500 hover:text-red-700"
          >
            Clear All Products
          </Button>
        </div>
      )}
    </div>
  )
}
