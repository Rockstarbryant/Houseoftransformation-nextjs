const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:3000'

export const config = {
  apiUrl: API_URL,
  mainSiteUrl: MAIN_SITE_URL,
}

export const fetchData = async (endpoint) => {
  const res = await fetch(`${API_URL}${endpoint}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}