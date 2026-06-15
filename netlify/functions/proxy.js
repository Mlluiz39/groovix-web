exports.handler = async (event) => {
  const API = process.env.VITE_API_URL
  if (!API) return { statusCode: 500, body: 'VITE_API_URL not set' }

  const path = event.path.replace(/^\/.netlify\/functions\/proxy/, '')
  const qs = event.rawUrl ? new URL(event.rawUrl).search : ''
  const url = `${API}/api${path}${qs}`

  const resp = await fetch(url, {
    method: event.httpMethod,
    headers: { 'Content-Type': 'application/json' },
  })
  const body = await resp.text()

  return {
    statusCode: resp.status,
    headers: { 'Content-Type': resp.headers.get('content-type') || 'application/json' },
    body,
  }
}
