exports.handler = async (event) => {
  const API = process.env.API_BACKEND_URL
  if (!API) return { statusCode: 500, body: 'API_BACKEND_URL not set' }

  // event.path = /.netlify/functions/proxy/search?q=hip+hop
  // Extract the API path after /proxy/
  const apiPath = event.path.replace(/^\/.netlify\/functions\/proxy/, '') || ''

  // Rebuild query string from params
  const qs = event.queryStringParameters
    ? '?' + new URLSearchParams(event.queryStringParameters).toString()
    : ''

  const url = `${API}/api${apiPath}${qs}`

  try {
    const resp = await fetch(url, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
    })
    const body = await resp.text()

    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    }
  } catch (err) {
    return { statusCode: 502, body: `Proxy error: ${err.message}` }
  }
}
