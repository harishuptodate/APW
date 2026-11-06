# Amazon Image Fetcher API Documentation

## Deploy on Render

Create a Render Blueprint connected to this repository to use `render.yaml`.
It runs the frontend, API routes, and server actions together as one Next.js
Node web service. No separate backend service or frontend API URL is needed.

For an existing Render web service, use:

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start --hostname 0.0.0.0 --port $PORT`
- Node version: `22`
- Health check path: `/api/health`
- Environment variable: `AMAZON_AFFILIATE_TAG` set to your Amazon India store tag

`GET /api/health` returns HTTP 200 with `{"status":"ok"}` and is not cached.
It checks that the app is responding without requesting Amazon pages.

The existing product store is in server memory and resets on restart or deploy.
Amazon scraping can still fail due to upstream blocking or CAPTCHA on any host.

## API Endpoint

Use this API to fetch product images from Amazon URLs programmatically.

Set `AMAZON_AFFILIATE_TAG` in the deployment environment to your official Amazon India store tag. It defaults to `harishch-21`. Incoming tracking parameters are discarded, and saved product links use only the ASIN and this configured tag.

```
POST /api/fetch-image
GET /api/fetch-image?url=AMAZON_URL
```

---

## POST Request

### Request Body

```json
{
  "amazonUrl": "https://www.amazon.in/dp/B08N5WRWNW"
}
```

### Example using cURL

```bash
curl -X POST https://your-domain.com/api/fetch-image \
  -H "Content-Type: application/json" \
  -d '{"amazonUrl": "https://www.amazon.in/dp/B08N5WRWNW"}'
```

### Example using JavaScript (fetch)

```javascript
const response = await fetch('https://your-domain.com/api/fetch-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amazonUrl: 'https://www.amazon.in/dp/B08N5WRWNW'
  })
});

const data = await response.json();
console.log(data.data.imageUrl);
```

---

## GET Request

### Query Parameters

- `url` – The Amazon product URL (required)

### Example

```
GET https://your-domain.com/api/fetch-image?url=https://www.amazon.in/dp/B08N5WRWNW
```

### Example using cURL

```bash
curl "https://your-domain.com/api/fetch-image?url=https://www.amazon.in/dp/B08N5WRWNW"
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://m.media-amazon.com/images/I/71abc123def.jpg",
    "title": "Product Title",
    "amazonUrl": "https://www.amazon.in/dp/B08N5WRWNW?tag=harishch-21"
  }
}
```

### Error Response

```json
{
  "error": "Please provide a valid Amazon.in product URL"
}
```

---

## Supported URL Formats

- Full Amazon India URLs: `https://www.amazon.in/dp/B08N5WRWNW`
- Short Amazon URLs: `https://amzn.to/3abc123`
- Amazon URLs with additional parameters
- Common ASIN paths such as `/dp/ASIN`, `/gp/product/ASIN`, and `/gp/aw/d/ASIN`

---

## Rate Limiting & Best Practices

- Be respectful with request frequency to avoid being blocked by Amazon
- Cache results when possible to reduce redundant requests
- Handle errors gracefully in your application
- The API returns high-resolution product images when available
