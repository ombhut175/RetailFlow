// lib/store.ts - FOLLOWS HACKATHON RULES
import { create } from 'zustand'
import { handleError } from '@/helpers/errors' // 🚨 MUST USE helpers/errors
import { DEBUG_MESSAGES } from '@/constants/messages'

interface TestingStore {
  // UI State
  loading: boolean
  error: string | null
  lastRefresh: Date | null
  
  // Testing Data
  testingData: any | null
  systemStatus: 'healthy' | 'warning' | 'error' | 'unknown'
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setErrorFromException: (error: unknown) => void // 🚨 Uses helpers/errors
  setTestingData: (data: any) => void
  setLastRefresh: (date: Date) => void
  setSystemStatus: (status: 'healthy' | 'warning' | 'error' | 'unknown') => void
  clearData: () => void
}

export const useTestingStore = create<TestingStore>((set, get) => ({
  // Initial state
  loading: false,
  error: null,
  lastRefresh: null,
  testingData: null,
  systemStatus: 'unknown',
  
  // Actions
  setLoading: (loading) => {
    console.log(`🔄 [${DEBUG_MESSAGES.STORE_ACTION}] Setting loading:`, loading)
    set({ loading })
  },
  
  setError: (error) => {
    console.log(`❌ [${DEBUG_MESSAGES.STORE_ACTION}] Setting error:`, error)
    set({ error })
  },
  
  // 🚨 FOLLOWS RULES - Uses helpers/errors
  setErrorFromException: (error) => {
    console.log(`❌ [${DEBUG_MESSAGES.STORE_ACTION}] Processing error exception:`, error)
    const errorMessage = handleError(error, { toast: false }) // Handle error but don't show toast (store handles it)
    set({ error: errorMessage, systemStatus: 'error' })
  },
  
  setTestingData: (data) => {
    console.log(`✅ [${DEBUG_MESSAGES.STORE_ACTION}] Setting testing data:`, data)
    set({ testingData: data })
  },
  
  setLastRefresh: (date) => {
    console.log(`🕒 [${DEBUG_MESSAGES.STORE_ACTION}] Setting last refresh:`, date)
    set({ lastRefresh: date })
  },
  
  setSystemStatus: (status) => {
    console.log(`📊 [${DEBUG_MESSAGES.STORE_ACTION}] Setting system status:`, status)
    set({ systemStatus: status })
  },
  
  clearData: () => {
    console.log(`🧹 [${DEBUG_MESSAGES.STORE_ACTION}] Clearing all data`)
    set({ 
      testingData: null, 
      error: null, 
      lastRefresh: null, 
      systemStatus: 'unknown' 
    })
  },
}))

// Helper to get current store state (useful for debugging)
export const getStoreState = () => useTestingStore.getState()
