'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Database, Server, Zap, Bug, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { ErrorHistory } from '@/components/error-history'
import { useErrorManager } from '@/components/error-manager'

interface DevToolsProps {
  className?: string
}

export function DevTools({ className }: DevToolsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const { errors } = useErrorManager()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5099'
  const recentErrors = errors.slice(-5) // Show last 5 errors
  const hasErrors = errors.length > 0

  const quickLinks = [
    { name: 'API Docs', url: `${apiUrl}/api/docs`, icon: Server },
    { name: 'DB Studio', url: 'https://local.drizzle.studio', icon: Database },
  ]

  const envVars = {
    'API URL': process.env.NEXT_PUBLIC_API_URL,
    'Node Env': process.env.NODE_ENV,
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        size="sm"
        variant="outline"
        className={`fixed bottom-4 right-4 z-50 ${
          hasErrors 
            ? 'bg-red-100 hover:bg-red-200 border-red-300 text-red-800' 
            : 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300'
        }`}
      >
        {hasErrors && <AlertTriangle className="h-4 w-4 mr-1" />}
        <Bug className="h-4 w-4 mr-1" />
        Dev Tools
        {hasErrors && (
          <Badge variant="destructive" className="ml-1 text-xs">
            {errors.length}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {/* Error History - Always visible if there are errors */}
      {hasErrors && (
        <ErrorHistory className="w-80" maxErrors={10} />
      )}
      
      {/* Main Dev Tools Panel */}
      <Card className={`w-80 ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              Hackathon Dev Tools
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium mb-2">Quick Links</h4>
            <div className="flex gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.name}
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(link.url, '_blank')}
                  className="text-xs"
                >
                  <link.icon className="h-3 w-3 mr-1" />
                  {link.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Environment Info */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
                Environment Info
                <ChevronDown className="h-3 w-3" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="font-medium">{key}:</span>
                  <Badge variant="secondary" className="text-xs">
                    {value || 'Not Set'}
                  </Badge>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Quick Actions */}
          <div>
            <h4 className="text-xs font-medium mb-2">Quick Actions</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.reload()
                }}
                className="text-xs"
              >
                Clear Storage
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Reload
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Trigger a test error for demonstration
                  const testError = new Error('Test error from dev tools')
                  console.error(testError)
                  throw testError
                }}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Test Error
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}