'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useErrorReporting } from '@/hooks/use-error-reporting'
import { apiClient } from '@/lib/api/apiClient'
import { toast } from 'sonner'

/**
 * Example component showing proper error handling integration
 * This demonstrates best practices for error reporting in components
 */
export function ExampleFormWithErrorHandling() {
  const [formData, setFormData] = React.useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // Initialize error reporting for this component
  const { reportError, reportApiError, withErrorReporting } = useErrorReporting({
    component: 'ExampleFormWithErrorHandling'
  })

  // Handle form validation errors
  const validateForm = () => {
    if (!formData.name.trim()) {
      reportError('Name is required', {
        action: 'form_validation',
        data: formData,
        showDebugPanel: false // Simple validation errors don't need debug panel
      })
      return false
    }
    
    if (!formData.email.includes('@')) {
      reportError('Please enter a valid email address', {
        action: 'form_validation',
        data: formData,
        showDebugPanel: false
      })
      return false
    }
    
    return true
  }

  // Form submission with proper error handling
  const handleSubmit = withErrorReporting(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // This will likely fail, but our error system will handle it gracefully
      const response = await apiClient.post('/api/user/create', formData)
      toast.success('User created successfully!')
      setFormData({ name: '', email: '' })
    } catch (error) {
      // API errors are automatically handled by the request interceptor
      // But we can add additional context here if needed
      reportApiError(error, {
        url: '/api/user/create',
        method: 'POST',
        data: formData
      })
    } finally {
      setIsSubmitting(false)
    }
  }, { 
    action: 'form_submission',
    showDebugPanel: true // Complex operations like API calls should show debug panel
  })

  // Simulate a component-level error
  const simulateError = () => {
    try {
      // Simulate some complex operation that fails
      const data = JSON.parse('invalid json')
    } catch (error) {
      reportError(error, {
        action: 'json_parsing',
        data: 'invalid json',
        showDebugPanel: true
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Example Form with Error Handling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={simulateError}
            >
              Test Error
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <strong>Error Handling Features:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Form validation with user-friendly messages</li>
            <li>API error handling with detailed debugging</li>
            <li>Component-level error reporting with context</li>
            <li>Automatic error categorization and display logic</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
