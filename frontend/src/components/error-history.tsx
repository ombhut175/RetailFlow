'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  History, 
  Trash2, 
  Eye, 
  Bug, 
  Server, 
  Globe, 
  Clock,
  ChevronDown,
  AlertTriangle
} from 'lucide-react'
import { useErrorManager } from '@/components/error-manager'
import { ErrorDetails } from '@/components/error-debug-panel'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ErrorHistoryProps {
  className?: string
  maxErrors?: number
}

export function ErrorHistory({ className, maxErrors = 20 }: ErrorHistoryProps) {
  const { errors, clearError, clearAllErrors, showErrorDebug } = useErrorManager()
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const recentErrors = errors.slice(-maxErrors).reverse() // Show most recent first

  const getErrorIcon = (type: ErrorDetails['type']) => {
    switch (type) {
      case 'network':
        return <Globe className="h-4 w-4 text-orange-500" />
      case 'backend':
        return <Server className="h-4 w-4 text-red-500" />
      default:
        return <Bug className="h-4 w-4 text-yellow-500" />
    }
  }

  const getErrorBadgeColor = (type: ErrorDetails['type']) => {
    switch (type) {
      case 'network':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'backend':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const truncateMessage = (message: string, maxLength = 60) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  if (recentErrors.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <History className="h-4 w-4 mr-2" />
            Error History
            <Badge variant="secondary" className="ml-2 text-xs">
              0 errors
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No errors captured yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <History className="h-4 w-4 mr-2" />
            Error History
            <Badge variant="secondary" className="ml-2 text-xs">
              {recentErrors.length} error{recentErrors.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAllErrors}
              className="h-6 px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentErrors.map((error, index) => (
                  <div key={error.id} className="group">
                    <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-shrink-0 mt-0.5">
                        {getErrorIcon(error.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getErrorBadgeColor(error.type)}`}
                          >
                            {error.type}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(error.timestamp)}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                          {truncateMessage(error.message)}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {error.component && (
                              <span className="truncate">{error.component}</span>
                            )}
                            {error.statusCode && (
                              <>
                                {error.component && <span>•</span>}
                                <span>HTTP {error.statusCode}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => showErrorDebug(error.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => clearError(error.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {index < recentErrors.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {recentErrors.length >= maxErrors && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Showing last {maxErrors} errors
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
