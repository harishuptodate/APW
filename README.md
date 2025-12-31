# Amazon Image Fetcher API Documentation

## API Endpoint

Use this API to fetch product images from Amazon URLs programmatically.

```
POST /api/fetch-image
GET /api/fetch-image?url=AMAZON_URL
```

---

## POST Request

### Request Body

```json
{
  "amazonUrl": "https://www.amazon.com/dp/B08N5WRWNW"
}
```

### Example using cURL

```bash
curl -X POST https://your-domain.com/api/fetch-image \
  -H "Content-Type: application/json" \
  -d '{"amazonUrl": "https://www.amazon.com/dp/B08N5WRWNW"}'
```

### Example using JavaScript (fetch)

```javascript
const response = await fetch('https://your-domain.com/api/fetch-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amazonUrl: 'https://www.amazon.com/dp/B08N5WRWNW'
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
GET https://your-domain.com/api/fetch-image?url=https://www.amazon.com/dp/B08N5WRWNW
```

### Example using cURL

```bash
curl "https://your-domain.com/api/fetch-image?url=https://www.amazon.com/dp/B08N5WRWNW"
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
    "amazonUrl": "https://www.amazon.com/dp/B08N5WRWNW"
  }
}
```

### Error Response

```json
{
  "error": "Please provide a valid Amazon product URL"
}
```

---

## Supported URL Formats

- Full Amazon URLs: `https://www.amazon.com/dp/B08N5WRWNW`
- Short Amazon URLs: `https://amzn.to/3abc123`
- Amazon URLs with additional parameters
- International Amazon domains (`.co.uk`, `.de`, `.fr`, etc.)

---

## Rate Limiting & Best Practices

- Be respectful with request frequency to avoid being blocked by Amazon
- Cache results when possible to reduce redundant requests
- Handle errors gracefully in your application
- The API returns high-resolution product images when available
