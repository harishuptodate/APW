"use server"

import { v4 as uuidv4 } from "uuid"

// In a real app, we'd use a database
// For this example, we'll use server-side memory storage
let productsStore: Array<{
  id: string
  title: string
  imageUrl: string
  amazonUrl: string
}> = []

export async function addProduct(productData: { title: string; imageUrl: string; amazonUrl: string }) {
  const product = {
    id: uuidv4(),
    ...productData,
  }

  productsStore.unshift(product) // Add to the beginning of the array

  // Keep only the last 10 products
  if (productsStore.length > 10) {
    productsStore = productsStore.slice(0, 10)
  }

  return { success: true, product }
}

export async function deleteProduct(productId: string) {
  const initialLength = productsStore.length
  productsStore = productsStore.filter((product) => product.id !== productId)

  if (productsStore.length < initialLength) {
    return { success: true }
  } else {
    return { success: false, error: "Product not found" }
  }
}

export async function getStoredProducts() {
  return productsStore
}
