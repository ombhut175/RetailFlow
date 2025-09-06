'use client'

import React from 'react'
import { toast } from 'sonner'
import { ErrorDetails, ErrorDebugPanel } from './error-debug-panel'
import hackLog from '@/lib/logger'
import { setRequestErrorManager } from '@/helpers/request'

// Global error manager state
interface ErrorManagerState {
  errors: ErrorDetails[]
  currentError: ErrorDetails | null
  showDebugPanel: boolean
}

interface ErrorManagerContextType {
  captureError: (error: unknown, options?: CaptureErrorOptions) => void
  showErrorDebug: (errorId: string) => void
  clearError: (errorId: string) => void
  clearAllErrors: () => void
  errors: ErrorDetails[]
}

interface CaptureErrorOptions {
  type?: 'frontend' | 'backend' | 'network'
  component?: string
  url?: string
  method?: string
  statusCode?: number
  requestData?: any
  responseData?: any
  showToast?: boolean
  showDebugPanel?: boolean
  userId?: string
  sessionId?: string
  silent?: boolean
}

// Create context
const ErrorManagerContext = React.createContext<ErrorManagerContextType | null>(null)

// Generate unique error ID
const generateErrorId = () => `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Extract component name from stack trace
const extractComponentFromStack = (stack?: string): string | undefined => {
  if (!stack) return undefined
  
  // Look for React component patterns in the stack
  const componentMatch = stack.match(/at (\w+(?:Component|Page|Layout|Provider)?)\s/)
  if (componentMatch) return componentMatch[1]
  
  // Look for file names that might be components
  const fileMatch = stack.match(/\/([A-Z][a-zA-Z-]+)\.(tsx?|jsx?)/)
  if (fileMatch) return fileMatch[1]
  
  return undefined
}

// Extract error details from various error types
const extractErrorDetails = (error: unknown, options: CaptureErrorOptions = {}): Omit<ErrorDetails, 'id' | 'timestamp'> => {
  let message = 'An unknown error occurred'
  let stack: string | undefined
  let type: 'frontend' | 'backend' | 'network' = options.type || 'frontend'

  // Handle different error types
  if (error instanceof Error) {
    message = error.message
    stack = error.stack
    
    // Determine error type from error characteristics
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      type = 'network'
    } else if (error.message.includes('API Error:') || error.message.includes('HTTP')) {
      type = 'backend'
    }
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    const errorObj = error as any
    if (errorObj.message) {
      message = String(errorObj.message)
    } else if (errorObj.error) {
      message = String(errorObj.error)
    } else {
      message = JSON.stringify(error)
    }
    
    // Extract additional info from axios/fetch errors
    if (errorObj.response) {
      type = 'backend'
      options.statusCode = errorObj.response.status
      options.responseData = errorObj.response.data
      options.url = errorObj.config?.url || options.url
      options.method = errorObj.config?.method?.toUpperCase() || options.method
    }
  }

  // Get current route
  const route = typeof window !== 'undefined' ? window.location.pathname : undefined

  // Get user agent
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined

  // Build error details
  return {
    message,
    type,
    stack,
    component: options.component || extractComponentFromStack(stack),
    url: options.url,
    method: options.method,
    statusCode: options.statusCode,
    requestData: options.requestData,
    responseData: options.responseData,
    route,
    userAgent,
    userId: options.userId,
    sessionId: options.sessionId,
    environment: process.env.NODE_ENV || 'development',
    buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev'
  }
}

export function ErrorManagerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ErrorManagerState>({
    errors: [],
    currentError: null,
    showDebugPanel: false
  })

  // Initialize error manager connections once the provider is mounted

  // Capture and process errors
  const captureError = React.useCallback((error: unknown, options: CaptureErrorOptions = {}) => {
    const errorId = generateErrorId()
    const extractedDetails = extractErrorDetails(error, options)
    
    const errorDetails: ErrorDetails = {
      id: errorId,
      timestamp: new Date(),
      message: extractedDetails.message,
      type: extractedDetails.type,
      stack: extractedDetails.stack,
      component: extractedDetails.component,
      url: extractedDetails.url,
      method: extractedDetails.method,
      statusCode: extractedDetails.statusCode,
      requestData: extractedDetails.requestData,
      responseData: extractedDetails.responseData,
      route: extractedDetails.route,
      userAgent: extractedDetails.userAgent,
      userId: extractedDetails.userId,
      sessionId: extractedDetails.sessionId,
      environment: extractedDetails.environment,
      buildVersion: extractedDetails.buildVersion
    }

    // Log the error
    hackLog.error('Error captured by ErrorManager', {
      errorId,
      message: errorDetails.message,
      type: errorDetails.type,
      component: errorDetails.component,
      url: errorDetails.url,
      statusCode: errorDetails.statusCode
    })

    // Add to error list
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, errorDetails]
    }))

    // Handle display logic
    const isDevelopment = process.env.NODE_ENV === 'development'
    const shouldShowToast = options.showToast !== false && !options.silent
    const shouldShowDebugPanel = (options.showDebugPanel !== false && isDevelopment) || options.showDebugPanel === true

    // Show toast notification (unless it's just a simple post request error)
    if (shouldShowToast && !isSimplePostError(errorDetails)) {
      const toastMessage = isDevelopment 
        ? `${errorDetails.message} (Click dev tools for details)`
        : errorDetails.message
      
      toast.error(toastMessage, {
        duration: isDevelopment ? 6000 : 4000,
        action: isDevelopment ? {
          label: 'Debug',
          onClick: () => showErrorDebug(errorId)
        } : undefined
      })
    }

    // Show debug panel in development for complex errors
    if (shouldShowDebugPanel && !isSimplePostError(errorDetails)) {
      setState(prev => ({
        ...prev,
        currentError: errorDetails,
        showDebugPanel: true
      }))
    }

    return errorId
  }, [])

  const showErrorDebug = React.useCallback((errorId: string) => {
    const error = state.errors.find(e => e.id === errorId)
    if (error) {
      setState(prev => ({
        ...prev,
        currentError: error,
        showDebugPanel: true
      }))
    }
  }, [state.errors])

  const closeDebugPanel = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      currentError: null,
      showDebugPanel: false
    }))
  }, [])

  const clearError = React.useCallback((errorId: string) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(e => e.id !== errorId),
      currentError: prev.currentError?.id === errorId ? null : prev.currentError,
      showDebugPanel: prev.currentError?.id === errorId ? false : prev.showDebugPanel
    }))
  }, [])

  const clearAllErrors = React.useCallback(() => {
    setState({
      errors: [],
      currentError: null,
      showDebugPanel: false
    })
  }, [])

  // Check if error is a simple post request error that should only show toast
  const isSimplePostError = (error: ErrorDetails): boolean => {
    return (
      error.method === 'POST' &&
      error.type === 'backend' &&
      !error.stack &&
      Boolean(error.statusCode && error.statusCode >= 400 && error.statusCode < 500)
    )
  }

  const contextValue: ErrorManagerContextType = {
    captureError,
    showErrorDebug,
    clearError,
    clearAllErrors,
    errors: state.errors
  }

  // Initialize connections to other parts of the app
  React.useEffect(() => {
    setRequestErrorManager(contextValue)
    console.log('✅ Error Manager initialized and connected to helpers')
  }, [contextValue])

  return (
    <ErrorManagerContext.Provider value={contextValue}>
      {children}
      {state.showDebugPanel && state.currentError && (
        <ErrorDebugPanel
          error={state.currentError}
          onClose={closeDebugPanel}
          onRetry={() => {
            // You can add retry logic here
            hackLog.info('Error retry requested', { errorId: state.currentError?.id })
            closeDebugPanel()
          }}
        />
      )}
    </ErrorManagerContext.Provider>
  )
}

// Hook to use error manager
export function useErrorManager() {
  const context = React.useContext(ErrorManagerContext)
  if (!context) {
    throw new Error('useErrorManager must be used within ErrorManagerProvider')
  }
  return context
}

// Enhanced error boundary that uses error manager
export function EnhancedErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}) {
  const errorManager = useErrorManager()
  
  return (
    <ErrorBoundary 
      fallback={fallback ? (props) => {
        // Capture the error in our error manager
        React.useEffect(() => {
          errorManager.captureError(props.error, {
            type: 'frontend',
            component: 'ErrorBoundary',
            showDebugPanel: true
          })
        }, [props.error])
        
        return React.createElement(fallback, props)
      } : undefined}
    >
      {children}
    </ErrorBoundary>
  )
}

// Simple error boundary fallback (exported from existing file)
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {process.env.NODE_ENV === 'development' ? this.state.error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.retry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
