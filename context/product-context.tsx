"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getStoredProducts } from "@/app/actions"

interface Product {
  id: string
  title: string
  imageUrl: string
  amazonUrl: string
}

interface ProductContextType {
  products: Product[]
  refreshProducts: () => Promise<void>
  isLoading: boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshProducts = async () => {
    try {
      setIsLoading(true)
      const storedProducts = await getStoredProducts()
      setProducts(storedProducts)
    } catch (error) {
      console.error("Error refreshing products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load products on initial mount
  useEffect(() => {
    refreshProducts()
  }, [])

  return <ProductContext.Provider value={{ products, refreshProducts, isLoading }}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
