'use client'

import React from 'react'
import { useErrorManager } from '@/components/error-manager'
import hackLog from '@/lib/logger'

interface UseErrorReportingOptions {
  component?: string
  userId?: string
  sessionId?: string
}

export function useErrorReporting(options: UseErrorReportingOptions = {}) {
  const errorManager = useErrorManager()

  // Report frontend error
  const reportError = React.useCallback((error: unknown, additionalContext?: {
    action?: string
    data?: any
    url?: string
    method?: string
    showDebugPanel?: boolean
  }) => {
    hackLog.error('Error reported via useErrorReporting', {
      error,
      component: options.component,
      action: additionalContext?.action,
      context: additionalContext
    })

    return errorManager.captureError(error, {
      type: 'frontend',
      component: options.component,
      userId: options.userId,
      sessionId: options.sessionId,
      requestData: additionalContext?.data,
      url: additionalContext?.url,
      method: additionalContext?.method,
      showDebugPanel: additionalContext?.showDebugPanel
    })
  }, [errorManager, options])

  // Report API error (from axios/fetch responses)
  const reportApiError = React.useCallback((error: unknown, request?: {
    url?: string
    method?: string
    data?: any
    response?: any
    statusCode?: number
  }) => {
    hackLog.apiError(request?.method || 'UNKNOWN', request?.url || 'unknown-url', {
      error,
      component: options.component,
      requestData: request?.data,
      responseData: request?.response
    })

    return errorManager.captureError(error, {
      type: 'backend',
      component: options.component,
      userId: options.userId,
      sessionId: options.sessionId,
      url: request?.url,
      method: request?.method,
      statusCode: request?.statusCode,
      requestData: request?.data,
      responseData: request?.response,
      // For POST requests, only show toast unless it's a complex error
      showToast: true,
      showDebugPanel: request?.method !== 'POST' || process.env.NODE_ENV === 'development'
    })
  }, [errorManager, options])

  // Report network error
  const reportNetworkError = React.useCallback((error: unknown, context?: {
    url?: string
    method?: string
    timeout?: boolean
  }) => {
    hackLog.error('Network error reported', {
      error,
      component: options.component,
      url: context?.url,
      method: context?.method,
      timeout: context?.timeout
    })

    return errorManager.captureError(error, {
      type: 'network',
      component: options.component,
      userId: options.userId,
      sessionId: options.sessionId,
      url: context?.url,
      method: context?.method,
      showDebugPanel: true // Network errors are usually complex
    })
  }, [errorManager, options])

  // Async error wrapper
  const withErrorReporting = React.useCallback(<T extends (...args: any[]) => Promise<any>>(
    asyncFn: T,
    context?: {
      action?: string
      showDebugPanel?: boolean
    }
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await asyncFn(...args)
      } catch (error) {
        reportError(error, {
          action: context?.action || asyncFn.name,
          data: args,
          showDebugPanel: context?.showDebugPanel
        })
        throw error // Re-throw so calling code can handle it too
      }
    }) as T
  }, [reportError])

  return {
    reportError,
    reportApiError,
    reportNetworkError,
    withErrorReporting
  }
}

// HOC for class components
export function withErrorReporting<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const WithErrorReportingComponent = React.forwardRef<any, P>((props, ref) => {
    const errorReporting = useErrorReporting({ component: displayName })

    // Enhanced props with error reporting
    const enhancedProps = {
      ...props,
      reportError: errorReporting.reportError,
      reportApiError: errorReporting.reportApiError,
      reportNetworkError: errorReporting.reportNetworkError,
      withErrorReporting: errorReporting.withErrorReporting
    } as P & {
      reportError: typeof errorReporting.reportError
      reportApiError: typeof errorReporting.reportApiError
      reportNetworkError: typeof errorReporting.reportNetworkError
      withErrorReporting: typeof errorReporting.withErrorReporting
    }

    return <WrappedComponent {...enhancedProps} ref={ref} />
  })

  WithErrorReportingComponent.displayName = `withErrorReporting(${displayName})`
  return WithErrorReportingComponent
}
