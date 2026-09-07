import assert from "node:assert/strict"
import test from "node:test"

import { cleanAmazonImageUrl, cleanAmazonProductUrl } from "../lib/amazon-link.ts"

test("cleans the supplied Amazon affiliate link", () => {
  const input =
    "https://www.amazon.in/dp/B0FNDMZ3RN?linkCode=sl2&linkId=3dd18c5fbb8aac5f0a89a7ee6f3e0b7a&ref_=as_li_ss_tl&ascsubtag=srctok-345f07f5286ceef2&btn_type=ss&btn_ref=srctok-345f07f5286ceef2&tag=another-store"

  assert.equal(cleanAmazonProductUrl(input), "https://www.amazon.in/dp/B0FNDMZ3RN?tag=harishch-21")
})

test("extracts an Amazon URL with leading pasted text and a nested path", () => {
  const input =
    "vhttps://www.amazon.in/dealsmagnet.com/dp/B0BN8K1QWB?ascsubtag=1dg8874997&th=1&tag=another-store"

  assert.equal(cleanAmazonProductUrl(input), "https://www.amazon.in/dp/B0BN8K1QWB?tag=harishch-21")
})

test("supports other common Amazon ASIN paths", () => {
  assert.equal(
    cleanAmazonProductUrl("https://amazon.in/gp/product/b08n5wrwnw/ref=something", "my-store-21"),
    "https://www.amazon.in/dp/B08N5WRWNW?tag=my-store-21",
  )
})

test("rejects non-Amazon hosts and links without an ASIN", () => {
  assert.throws(() => cleanAmazonProductUrl("https://amazon.in.example.com/dp/B0FNDMZ3RN"), /Amazon\.in/)
  assert.throws(() => cleanAmazonProductUrl("https://www.amazon.in/s?k=phone"), /ASIN/)
})

test("removes Amazon image size transformations", () => {
  assert.equal(
    cleanAmazonImageUrl("https://m.media-amazon.com/images/I/example._AC_SL1500_.jpg"),
    "https://m.media-amazon.com/images/I/example.jpg",
  )
  assert.equal(
    cleanAmazonImageUrl("https://m.media-amazon.com/images/I/example._SX679_.jpg?one=1&amp;two=2"),
    "https://m.media-amazon.com/images/I/example.jpg?one=1&two=2",
  )
})
