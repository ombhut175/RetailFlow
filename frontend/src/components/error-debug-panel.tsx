'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  X, 
  ChevronDown, 
  Clock, 
  Code, 
  Globe, 
  FileText,
  Copy,
  ExternalLink,
  Bug,
  Server,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export interface ErrorDetails {
  id: string
  timestamp: Date
  message: string
  stack?: string
  type: 'frontend' | 'backend' | 'network'
  url?: string
  method?: string
  statusCode?: number
  responseData?: any
  requestData?: any
  component?: string
  userAgent?: string
  route?: string
  userId?: string
  sessionId?: string
  buildVersion?: string
  environment?: string
  [key: string]: any
}

interface ErrorDebugPanelProps {
  error: ErrorDetails
  onClose: () => void
  onRetry?: () => void
}

export function ErrorDebugPanel({ error, onClose, onRetry }: ErrorDebugPanelProps) {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    details: true,
    stack: false,
    request: false,
    response: false,
    environment: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const copyFullError = () => {
    const errorReport = {
      timestamp: error.timestamp.toISOString(),
      message: error.message,
      type: error.type,
      stack: error.stack,
      url: error.url,
      method: error.method,
      statusCode: error.statusCode,
      component: error.component,
      route: error.route,
      userAgent: error.userAgent,
      requestData: error.requestData,
      responseData: error.responseData,
      environment: error.environment,
      buildVersion: error.buildVersion
    }
    
    const reportText = JSON.stringify(errorReport, null, 2)
    copyToClipboard(reportText, 'Full error report')
  }

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <Globe className="h-5 w-5" />
      case 'backend':
        return <Server className="h-5 w-5" />
      default:
        return <Bug className="h-5 w-5" />
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'text-orange-500'
      case 'backend':
        return 'text-red-500'
      default:
        return 'text-yellow-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`${getErrorColor()}`}>
                {getErrorIcon()}
              </div>
              <div>
                <CardTitle className="text-lg">Error Debug Panel</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="destructive" className="text-xs">
                    {error.type.toUpperCase()} ERROR
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {error.timestamp.toLocaleString()}
                  </Badge>
                  {error.statusCode && (
                    <Badge variant="outline" className="text-xs">
                      HTTP {error.statusCode}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={copyFullError}>
                <Copy className="h-4 w-4" />
              </Button>
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[600px] px-6 pb-6">
            {/* Error Message */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Error Message
              </h3>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-mono text-red-800 dark:text-red-200">
                  {error.message}
                </p>
              </div>
            </div>

            {/* Basic Details */}
            <Collapsible
              open={expandedSections.details}
              onOpenChange={() => toggleSection('details')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Error Details
                  </h3>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mb-6">
                <div className="space-y-3 pl-6">
                  {error.component && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Component:</span>
                      <span className="text-sm font-mono">{error.component}</span>
                    </div>
                  )}
                  {error.route && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Route:</span>
                      <span className="text-sm font-mono">{error.route}</span>
                    </div>
                  )}
                  {error.url && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">URL:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono truncate max-w-md">{error.url}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(error.url!, 'URL')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {error.method && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Method:</span>
                      <Badge variant="outline" className="text-xs">{error.method}</Badge>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4" />

            {/* Stack Trace */}
            {error.stack && (
              <>
                <Collapsible
                  open={expandedSections.stack}
                  onOpenChange={() => toggleSection('stack')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-2">
                      <h3 className="text-sm font-semibold flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        Stack Trace
                      </h3>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-6">
                    <div className="pl-6">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                          {error.stack}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => copyToClipboard(error.stack!, 'Stack trace')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Stack
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Separator className="my-4" />
              </>
            )}

            {/* Request Data */}
            {error.requestData && (
              <>
                <Collapsible
                  open={expandedSections.request}
                  onOpenChange={() => toggleSection('request')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-2">
                      <h3 className="text-sm font-semibold flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Request Data
                      </h3>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-6">
                    <div className="pl-6">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-blue-800 dark:text-blue-200">
                          {JSON.stringify(error.requestData, null, 2)}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => copyToClipboard(JSON.stringify(error.requestData, null, 2), 'Request data')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Request
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Separator className="my-4" />
              </>
            )}

            {/* Response Data */}
            {error.responseData && (
              <>
                <Collapsible
                  open={expandedSections.response}
                  onOpenChange={() => toggleSection('response')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-2">
                      <h3 className="text-sm font-semibold flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        Response Data
                      </h3>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-6">
                    <div className="pl-6">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-orange-800 dark:text-orange-200">
                          {JSON.stringify(error.responseData, null, 2)}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => copyToClipboard(JSON.stringify(error.responseData, null, 2), 'Response data')}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Response
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Separator className="my-4" />
              </>
            )}

            {/* Environment Info */}
            <Collapsible
              open={expandedSections.environment}
              onOpenChange={() => toggleSection('environment')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Environment Info
                  </h3>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mb-6">
                <div className="space-y-3 pl-6">
                  {error.environment && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Environment:</span>
                      <Badge variant="secondary">{error.environment}</Badge>
                    </div>
                  )}
                  {error.buildVersion && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Build Version:</span>
                      <span className="text-sm font-mono">{error.buildVersion}</span>
                    </div>
                  )}
                  {error.userAgent && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600 dark:text-gray-400">User Agent:</span>
                      <span className="text-sm font-mono text-right max-w-md break-all">
                        {error.userAgent}
                      </span>
                    </div>
                  )}
                  {error.userId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">User ID:</span>
                      <span className="text-sm font-mono">{error.userId}</span>
                    </div>
                  )}
                  {error.sessionId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Session ID:</span>
                      <span className="text-sm font-mono">{error.sessionId}</span>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
