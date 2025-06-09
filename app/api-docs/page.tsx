export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Amazon Image Fetcher API Documentation</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">API Endpoint</h2>
          <p className="text-gray-600 mb-4">Use this API to fetch product images from Amazon URLs programmatically.</p>

          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <code className="text-sm">POST /api/fetch-image</code>
            <br />
            <code className="text-sm">GET /api/fetch-image?url=AMAZON_URL</code>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">POST Request</h3>

          <h4 className="font-medium mb-2">Request Body:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`{
  "amazonUrl": "https://www.amazon.com/dp/B08N5WRWNW"
}`}
          </pre>

          <h4 className="font-medium mb-2">Example using cURL:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`curl -X POST https://your-domain.com/api/fetch-image \\
  -H "Content-Type: application/json" \\
  -d '{"amazonUrl": "https://www.amazon.com/dp/B08N5WRWNW"}'`}
          </pre>

          <h4 className="font-medium mb-2">Example using JavaScript fetch:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`const response = await fetch('https://your-domain.com/api/fetch-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amazonUrl: 'https://www.amazon.com/dp/B08N5WRWNW'
  })
});

const data = await response.json();
console.log(data.data.imageUrl);`}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">GET Request</h3>

          <h4 className="font-medium mb-2">Query Parameters:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>
              <code>url</code> - The Amazon product URL (required)
            </li>
          </ul>

          <h4 className="font-medium mb-2">Example:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`GET https://your-domain.com/api/fetch-image?url=https://www.amazon.com/dp/B08N5WRWNW`}
          </pre>

          <h4 className="font-medium mb-2">Example using cURL:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`curl "https://your-domain.com/api/fetch-image?url=https://www.amazon.com/dp/B08N5WRWNW"`}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Response Format</h3>

          <h4 className="font-medium mb-2">Success Response:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`{
  "success": true,
  "data": {
    "imageUrl": "https://m.media-amazon.com/images/I/71abc123def.jpg",
    "title": "Product Title",
    "amazonUrl": "https://www.amazon.com/dp/B08N5WRWNW"
  }
}`}
          </pre>

          <h4 className="font-medium mb-2">Error Response:</h4>
          <pre className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            {`{
  "error": "Please provide a valid Amazon product URL"
}`}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Supported URL Formats</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Full Amazon URLs: <code>https://www.amazon.com/dp/B08N5WRWNW</code>
            </li>
            <li>
              Short Amazon URLs: <code>https://amzn.to/3abc123</code>
            </li>
            <li>Amazon URLs with additional parameters</li>
            <li>International Amazon domains (.co.uk, .de, .fr, etc.)</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Rate Limiting & Best Practices</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Be respectful with request frequency to avoid being blocked by Amazon</li>
            <li>Cache results when possible to reduce redundant requests</li>
            <li>Handle errors gracefully in your application</li>
            <li>The API returns high-resolution product images when available</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
