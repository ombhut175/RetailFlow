'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Bug, 
  Server, 
  Globe, 
  AlertTriangle, 
  TestTube,
  Zap,
  Database
} from 'lucide-react'
import { useErrorReporting } from '@/hooks/use-error-reporting'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/apiClient'
import { ExampleFormWithErrorHandling } from '@/components/example-form-with-error-handling'

export default function ErrorTestingPage() {
  const { reportError, reportApiError, reportNetworkError, withErrorReporting } = useErrorReporting({
    component: 'ErrorTestingPage'
  })

  const [isLoading, setIsLoading] = React.useState(false)

  // Test frontend error
  const testFrontendError = () => {
    const error = new Error('This is a test frontend error with detailed stack trace information')
    error.stack = `Error: This is a test frontend error with detailed stack trace information
    at testFrontendError (ErrorTestingPage.tsx:32:19)
    at onClick (ErrorTestingPage.tsx:45:7)
    at HTMLButtonElement.callCallback (react-dom.js:3945:14)
    at Object.invokeGuardedCallbackDev (react-dom.js:3994:16)
    at invokeGuardedCallback (react-dom.js:4056:31)`
    
    reportError(error, {
      action: 'test_frontend_error',
      showDebugPanel: true
    })
  }

  // Test API error
  const testApiError = async () => {
    setIsLoading(true)
    try {
      // This should fail
      await apiClient.get('/api/nonexistent-endpoint')
    } catch (error) {
      reportApiError(error, {
        url: '/api/nonexistent-endpoint',
        method: 'GET',
        statusCode: 404
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test POST error (should only show toast)
  const testPostError = async () => {
    setIsLoading(true)
    try {
      await apiClient.post('/api/test/fail', { test: 'data' })
    } catch (error) {
      reportApiError(error, {
        url: '/api/test/fail',
        method: 'POST',
        data: { test: 'data' },
        statusCode: 400
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test network error
  const testNetworkError = () => {
    const error = new TypeError('Failed to fetch: Network request failed')
    reportNetworkError(error, {
      url: 'https://unreachable-api.example.com/data',
      method: 'GET',
      timeout: true
    })
  }

  // Test error wrapper
  const testWithErrorWrapper = withErrorReporting(async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    throw new Error('Error caught by withErrorReporting wrapper')
  }, { action: 'async_operation_test', showDebugPanel: true })

  // Test unhandled promise rejection
  const testUnhandledPromise = () => {
    Promise.reject(new Error('Unhandled promise rejection for testing'))
  }

  // Test component error boundary trigger
  const [shouldThrow, setShouldThrow] = React.useState(false)

  if (shouldThrow) {
    throw new Error('Error boundary test error')
  }

  const errorTypes = [
    {
      title: 'Frontend Error',
      description: 'JavaScript error with stack trace',
      icon: Bug,
      color: 'text-yellow-500',
      action: testFrontendError,
      level: 'Will show debug panel'
    },
    {
      title: 'API GET Error',
      description: '404 error from API endpoint',
      icon: Server,
      color: 'text-red-500',
      action: testApiError,
      level: 'Will show debug panel'
    },
    {
      title: 'API POST Error',
      description: 'POST request error (toast only)',
      icon: Server,
      color: 'text-orange-500',
      action: testPostError,
      level: 'Toast only'
    },
    {
      title: 'Network Error',
      description: 'Network connectivity issue',
      icon: Globe,
      color: 'text-blue-500',
      action: testNetworkError,
      level: 'Will show debug panel'
    },
    {
      title: 'Async Wrapper Error',
      description: 'Error caught by wrapper function',
      icon: Zap,
      color: 'text-purple-500',
      action: testWithErrorWrapper,
      level: 'Will show debug panel'
    },
    {
      title: 'Unhandled Promise',
      description: 'Promise rejection (check console)',
      icon: AlertTriangle,
      color: 'text-pink-500',
      action: testUnhandledPromise,
      level: 'Console only'
    },
    {
      title: 'Component Error',
      description: 'Triggers error boundary',
      icon: Bug,
      color: 'text-red-600',
      action: () => setShouldThrow(true),
      level: 'Error boundary'
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Error Handling Test Page</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Test the enhanced error handling and debugging system. 
            In development mode, you'll see detailed error panels.
          </p>
          <Badge variant="outline" className="mb-4">
            Current Environment: {process.env.NODE_ENV || 'development'}
          </Badge>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center text-blue-800 dark:text-blue-200">
                <TestTube className="h-4 w-4 mr-2" />
                Development Mode Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Detailed error debug panels with full stack traces</li>
                <li>Error history tracking in dev tools</li>
                <li>Request/response data capture</li>
                <li>Component and environment context</li>
                <li>Copy error details for sharing</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {errorTypes.map((errorType, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center">
                    <errorType.icon className={`h-4 w-4 mr-2 ${errorType.color}`} />
                    {errorType.title}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {errorType.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {errorType.description}
                </p>
                <Button
                  onClick={errorType.action}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Testing...' : 'Trigger Error'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex justify-center mb-8">
          <ExampleFormWithErrorHandling />
        </div>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🚨 Development Mode (Current)</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Complex errors show detailed debug panels with full context</li>
                <li>Simple POST request errors show toast notifications only</li>
                <li>All errors are tracked in the error history (dev tools)</li>
                <li>Stack traces, request/response data, and environment info included</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🚀 Production Mode</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Only toast notifications with user-friendly messages</li>
                <li>No debug panels or detailed error information shown</li>
                <li>Errors still logged for debugging but not exposed to users</li>
                <li>Maintains clean UX while preserving debugging capability</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🔧 Integration</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Automatic error capture from API requests via helpers/request.ts</li>
                <li>Manual error reporting via useErrorReporting hook</li>
                <li>Enhanced error boundary with detailed context</li>
                <li>Global error management with centralized handling</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
