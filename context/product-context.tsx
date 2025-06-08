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
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])

  const refreshProducts = async () => {
    const storedProducts = await getStoredProducts()
    setProducts(storedProducts)
  }

  // Load products on initial mount
  useEffect(() => {
    refreshProducts()
  }, [])

  return <ProductContext.Provider value={{ products, refreshProducts }}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
