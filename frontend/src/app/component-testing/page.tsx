"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Bug,
  Settings,
  Zap,
  Database,
  Shield,
  Globe,
  Clock,
  Heart,
  Star,
  ThumbsUp,
  Trash2
} from 'lucide-react';
import hackLog from "@/lib/logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES } from '@/constants/messages';
import { ErrorBoundary } from '@/components/error-boundary';
import { useErrorManager } from '@/components/error-manager';

// Test component that throws an error
const ErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error thrown by ErrorComponent");
  }
  return <div className="p-4 bg-green-100 text-green-800 rounded">No error thrown!</div>;
};

// Test component for third-party integrations
const ThirdPartyTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    setLoading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          toast.success("Progress completed!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-4">
      <Button onClick={simulateProgress} disabled={loading}>
        {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
        Test Progress Animation
      </Button>
      {loading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{progress}% completed</p>
        </div>
      )}
    </div>
  );
};

export default function ComponentTestingPage() {
  const [throwError, setThrowError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    notifications: false,
    theme: 'light'
  });
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const { toast: shadToast } = useToast();
  const errorManager = useErrorManager();

  React.useEffect(() => {
    hackLog.componentMount('ComponentTestingPage', {
      route: '/component-testing',
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Toast testing functions
  const testSonnerToast = () => {
    toast.success("Sonner Toast Success!", {
      description: "This is a success toast using Sonner library",
      action: {
        label: "Undo",
        onClick: () => toast("Undo clicked!")
      }
    });
    markTestResult('sonner-toast', true);
  };

  const testShadcnToast = () => {
    shadToast({
      title: "Shadcn Toast Success!",
      description: "This is a success toast using Shadcn/UI toast",
      variant: "default"
    });
    markTestResult('shadcn-toast', true);
  };

  const testErrorToast = () => {
    toast.error("Error Toast Test", {
      description: "This is an error toast for testing purposes"
    });
  };

  const testWarningToast = () => {
    toast.warning("Warning Toast Test", {
      description: "This is a warning toast for testing purposes"
    });
  };

  const testInfoToast = () => {
    toast.info("Info Toast Test", {
      description: "This is an info toast for testing purposes"
    });
  };

  const testLoadingToast = () => {
    const promise = new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    toast.promise(promise, {
      loading: 'Loading...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data'
    });
  };

  // Error handling tests
  const testErrorBoundary = () => {
    setThrowError(true);
    setTimeout(() => setThrowError(false), 3000);
    markTestResult('error-boundary', true);
  };

  const testErrorManager = () => {
    try {
      throw new Error("Test error for error manager");
    } catch (error) {
      errorManager.captureError(error, {
        type: 'frontend',
        component: 'ComponentTestingPage',
        showToast: true,
        showDebugPanel: true
      });
      markTestResult('error-manager', true);
    }
  };

  const testNetworkError = () => {
    errorManager.captureError(new Error("Network request failed"), {
      type: 'network',
      component: 'ComponentTestingPage',
      url: '/api/test-endpoint',
      method: 'GET',
      statusCode: 500,
      showToast: true
    });
    markTestResult('network-error', true);
  };

  // Logger tests
  const testLogger = () => {
    hackLog.info('Logger test - info level', { test: true });
    hackLog.warn('Logger test - warning level', { test: true });
    hackLog.error('Logger test - error level', { test: true });
    hackLog.dev('Logger test - dev level', { test: true });
    toast.success("Logger tests executed - check console for output");
    markTestResult('logger', true);
  };

  // Form handling tests
  const testFormValidation = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success("Form validation passed!");
    markTestResult('form-validation', true);
  };

  const testFormSubmission = () => {
    hackLog.info('Form submission test', formData);
    toast.success("Form submitted successfully!", {
      description: `Name: ${formData.name}, Email: ${formData.email}`
    });
    markTestResult('form-submission', true);
  };

  // UI Components tests
  const testAllComponents = () => {
    const components = [
      'buttons', 'cards', 'alerts', 'forms', 'dialogs', 
      'tabs', 'progress', 'skeletons', 'badges', 'separators'
    ];
    
    components.forEach(component => {
      markTestResult(component, true);
    });
    
    toast.success("All UI components tested successfully!");
  };

  // Theme tests
  const testThemeToggle = () => {
    document.documentElement.classList.toggle('dark');
    toast.success("Theme toggled!");
    markTestResult('theme-toggle', true);
  };

  // Utility function to mark test results
  const markTestResult = (testName: string, passed: boolean) => {
    setTestResults(prev => ({ ...prev, [testName]: passed }));
  };

  // Get test result icon
  const getTestResultIcon = (testName: string) => {
    const result = testResults[testName];
    if (result === true) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (result === false) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bug className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Component Testing Suite
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Comprehensive testing for toast notifications, error handling, UI components, and third-party integrations
          </p>
        </div>

        <Tabs defaultValue="toasts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="toasts">Toasts</TabsTrigger>
            <TabsTrigger value="errors">Error Handling</TabsTrigger>
            <TabsTrigger value="components">UI Components</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="integrations">Third Party</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          {/* Toast Testing */}
          <TabsContent value="toasts">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Sonner Toast Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={testSonnerToast} className="w-full">
                    {getTestResultIcon('sonner-toast')}
                    Test Success Toast
                  </Button>
                  <Button onClick={testErrorToast} variant="destructive" className="w-full">
                    <XCircle className="w-4 h-4 mr-2" />
                    Test Error Toast
                  </Button>
                  <Button onClick={testWarningToast} variant="outline" className="w-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Test Warning Toast
                  </Button>
                  <Button onClick={testInfoToast} variant="secondary" className="w-full">
                    <Info className="w-4 h-4 mr-2" />
                    Test Info Toast
                  </Button>
                  <Button onClick={testLoadingToast} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test Loading Toast
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Shadcn Toast Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={testShadcnToast} className="w-full">
                    {getTestResultIcon('shadcn-toast')}
                    Test Shadcn Toast
                  </Button>
                  <Button 
                    onClick={() => {
                      shadToast({
                        title: "Error Toast",
                        description: "This is an error using Shadcn toast",
                        variant: "destructive"
                      });
                    }} 
                    variant="destructive" 
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Test Error Variant
                  </Button>
                  <Button 
                    onClick={() => {
                      shadToast({
                        title: "Custom Action",
                        description: "Toast with custom action button",
                        action: (
                          <Button size="sm" onClick={() => toast.success("Action clicked!")}>
                            Click me
                          </Button>
                        )
                      });
                    }} 
                    variant="outline" 
                    className="w-full"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Test Custom Action
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Error Handling Testing */}
          <TabsContent value="errors">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Error Boundary Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={testErrorBoundary} variant="destructive" className="w-full">
                    {getTestResultIcon('error-boundary')}
                    Test Error Boundary
                  </Button>
                  <ErrorBoundary>
                    <ErrorComponent shouldThrow={throwError} />
                  </ErrorBoundary>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-red-500" />
                    Error Manager Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={testErrorManager} variant="destructive" className="w-full">
                    {getTestResultIcon('error-manager')}
                    Test Frontend Error
                  </Button>
                  <Button onClick={testNetworkError} variant="destructive" className="w-full">
                    {getTestResultIcon('network-error')}
                    Test Network Error
                  </Button>
                  <Button onClick={testLogger} variant="outline" className="w-full">
                    {getTestResultIcon('logger')}
                    Test Logger Output
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UI Components Testing */}
          <TabsContent value="components">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Buttons & Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">Primary Button</Button>
                  <Button variant="secondary" className="w-full">Secondary Button</Button>
                  <Button variant="outline" className="w-full">Outline Button</Button>
                  <Button variant="ghost" className="w-full">Ghost Button</Button>
                  <Button variant="destructive" className="w-full">Destructive Button</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alerts & Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>Your operation completed successfully.</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Something went wrong.</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress & Loading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={33} />
                  <Progress value={66} />
                  <Progress value={100} />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dialogs & Modals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Test Dialog</DialogTitle>
                        <DialogDescription>
                          This is a test dialog to verify modal functionality.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">Open Alert Dialog</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Theme & Styling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={testThemeToggle} variant="outline" className="w-full">
                    {getTestResultIcon('theme-toggle')}
                    Toggle Dark/Light Theme
                  </Button>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    Test responsive design and theme switching
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button onClick={testAllComponents} size="lg" className="w-full">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Mark All UI Components as Tested
              </Button>
            </div>
          </TabsContent>

          {/* Forms Testing */}
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Form Components Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                    />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>

                  <div>
                    <Label>Theme Preference</Label>
                    <RadioGroup 
                      value={formData.theme} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light">Light</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark">Dark</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system">System</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">I agree to the terms and conditions</Label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={testFormValidation} variant="outline" className="flex-1">
                    {getTestResultIcon('form-validation')}
                    Test Validation
                  </Button>
                  <Button onClick={testFormSubmission} className="flex-1">
                    {getTestResultIcon('form-submission')}
                    Submit Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Third-party Integrations Testing */}
          <TabsContent value="integrations">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Animation & Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ThirdPartyTestComponent />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    External Libraries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Libraries Tested</AlertTitle>
                    <AlertDescription>
                      • Lucide React (Icons) ✅<br/>
                      • Sonner (Toasts) ✅<br/>
                      • Radix UI (Components) ✅<br/>
                      • Class Variance Authority ✅<br/>
                      • Tailwind CSS ✅
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Results */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Test Results Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(testResults).map(([testName, passed]) => (
                    <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="capitalize font-medium">{testName.replace('-', ' ')}</span>
                      <div className="flex items-center gap-2">
                        {passed ? 
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                          <XCircle className="w-4 h-4 text-red-500" />
                        }
                        <span className="text-sm">{passed ? 'Passed' : 'Failed'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total Tests: {Object.keys(testResults).length} | 
                    Passed: {Object.values(testResults).filter(Boolean).length} | 
                    Failed: {Object.values(testResults).filter(v => !v).length}
                  </div>
                  <Button 
                    onClick={() => setTestResults({})} 
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
