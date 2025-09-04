// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5099'

const fetcher = (url: string) => {
  console.log('📡 [API] Fetching:', url)
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.text()
      console.log('❌ [API] Error response:', { status: response.status, error })
      throw new Error(`Request failed with status ${response.status}`)
    }
    const data = await response.json()
    console.log('✅ [API] Success:', data)
    return data
  }).catch((error) => {
    console.log('❌ [API] Fetch failed:', error)
    throw error
  })
}

export const api = {
  fetcher,
  
  // Testing endpoints
  getTestingData: () => fetcher(`${API_BASE}/api/test/testing`),
  getSupabaseStatus: () => fetcher(`${API_BASE}/api/test/supabase-status`),
  getDatabaseStatus: () => fetcher(`${API_BASE}/api/test/database-status`),
}

// API endpoints for SWR
export const endpoints = {
  testing: `${API_BASE}/api/test/testing`,
  supabaseStatus: `${API_BASE}/api/test/supabase-status`,
  databaseStatus: `${API_BASE}/api/test/database-status`,
}

export { API_BASE }
