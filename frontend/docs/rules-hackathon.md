## 🚀 Hackathon Development Rules - Simple & Fast

This document defines **simplified rules** for rapid hackathon development with easy debugging and quick iteration.

### 🎯 Hackathon Goals
- **Speed first** - Get features working fast
- **Easy debugging** - Clear logs and simple error handling
- **Minimal complexity** - Keep it simple, avoid over-engineering
- **Quick fixes** - Easy to find and modify code

---

## 📁 Project Folder Structure (USE THESE!)

```
src/
  app/                 # Next.js pages and routes
  components/          # All UI components
    ui/                # Shadcn/ui components
  hooks/               # Custom React hooks (USE THIS!)
  lib/                 # Core setup (API, stores, configs)
  helpers/             # Business logic helpers (USE THIS!)
  constants/           # All constants (USE THIS!)
  styles/              # CSS files
```

### 🔗 Import Rules
Always use `@/` imports:
- `@/hooks/useUsers` 
- `@/helpers/request` ← **MANDATORY for ALL API calls**
- `@/helpers/errors` ← **MANDATORY for ALL error handling**
- `@/constants/messages`

---

## 🚨 CRITICAL RULES - READ THIS FIRST!

### **MANDATORY FILE USAGE:**
1. **`src/helpers/request.ts`** - ALL API calls MUST go through this file
   - **Even with SWR** - SWR fetcher must use this
   - **Even with fetch()** - Replace all fetch() with helpers/request
   - **Even in libs** - lib files must import from helpers/request

2. **`src/helpers/errors.ts`** - ALL error handling MUST go through this file
   - **Even with SWR** - SWR errors must be processed here
   - **Even with Zustand** - Store error states use this
   - **Even in try/catch** - All catches must use helpers/errors

### **NEVER DO THIS:**
- ❌ `fetch('/api/users')` - Use helpers/request instead
- ❌ `try/catch` inline - Use helpers/errors instead
- ❌ Direct API calls in components
- ❌ Hardcoded error messages

### **ALWAYS DO THIS:**
- ✅ `import { apiRequest } from '@/helpers/request'`
- ✅ `import { handleError } from '@/helpers/errors'`
- ✅ API calls → helpers/request → SWR → hooks → components
- ✅ Errors → helpers/errors → constants/messages → UI

---

## 📄 Constants Folder - Put ALL Constants Here

### What Goes in `constants/`:
- **API endpoints** - All your backend URLs
- **Success/error messages** - User-facing text
- **Route paths** - Navigation routes
- **App configuration** - Settings, limits, timeouts
- **Theme colors** - UI colors and breakpoints

### Files to Create:
- `constants/api.ts` - API_BASE_URL, endpoints
- `constants/messages.ts` - SUCCESS, ERROR, LOADING messages
- `constants/routes.ts` - All app routes
- `constants/config.ts` - App settings, file limits, etc.

### Why Use Constants:
- **Easy to change** - Update messages in one place
- **No typos** - TypeScript autocomplete
- **Consistent** - Same messages everywhere
- **Fast debugging** - Know where to look

---

## 🔧 Helpers Folder - Business Logic Only (MANDATORY!)

### What Goes in `helpers/`:
- **Error handling** - Process API errors into user messages
- **Form processing** - Validate and submit forms
- **API requests** - ALL API calls must go through helpers
- **Data transformation** - Convert API data for UI

### **REQUIRED FILES - MUST USE THESE:**
- `helpers/errors.ts` - **ALL ERROR HANDLING** (handleError, processApiError)
- `helpers/request.ts` - **ALL API CALLS** (apiRequest, fetch wrappers)
- `helpers/formHandler.ts` - validateForm, submitForm

### **STRICT RULES FOR API & ERRORS:**
- **🚨 NEVER use fetch() directly** - Always use `@/helpers/request`
- **🚨 NEVER handle errors inline** - Always use `@/helpers/errors`
- **🚨 Even with SWR** - SWR calls must use helpers/request
- **🚨 Even with Zustand** - Error states must use helpers/errors

### Rules for Helpers:
- **App-specific logic** - Not generic utilities
- **Handle complex operations** - Form submission, error processing
- **Use constants** - Import from `@/constants/`
- **Easy to test** - Simple input/output functions

---

## 📚 Lib Folder - Core Setup (No Direct API Calls!)

### What Goes in `lib/`:
- **SWR configuration** - Global SWR settings (uses helpers/request!)
- **Zustand stores** - App state management (uses helpers/errors!)
- **Third-party configs** - External service setup
- **API endpoints** - URL definitions only (actual calls use helpers/request!)

### **REQUIRED FILES:**
- `lib/store.ts` - Zustand global store
- `lib/swr-config.ts` - SWR global configuration
- `lib/apiClient.ts` - API client setup (imports from helpers/request!)

### **CRITICAL RULES:**
- **🚨 NO direct fetch() calls** - Must import from `@/helpers/request`
- **🚨 NO inline error handling** - Must import from `@/helpers/errors`
- **SWR fetcher** - Must use `@/helpers/request`
- **Store error states** - Must use `@/helpers/errors`

### Why Separate Lib:
- **Core functionality** - App foundation
- **Configuration heavy** - Setup once, use everywhere
- **Uses helpers** - All API calls through helpers/request

---

## 🪝 Hooks Folder - Custom React Logic (Use Helpers!)

### What Goes in `hooks/`:
- **Data fetching hooks** - useUsers, useProducts, etc.
- **Form hooks** - useForm, useValidation
- **UI state hooks** - useModal, useToggle
- **Combined logic** - SWR + Zustand + **ALWAYS use helpers**

### Hook Naming:
- `useUsers` - For user data management
- `useProducts` - For product operations
- `useForm` - For form handling
- `useApi` - For generic API calls

### **MANDATORY Hook Rules:**
- **🚨 Import apiRequest from `@/helpers/request`** - Never fetch() directly
- **🚨 Import handleError from `@/helpers/errors`** - Never inline error handling
- **SWR fetcher** - Must use function from helpers/request
- **Error handling** - Must use functions from helpers/errors
- **All async operations** - Wrapped with helpers/errors

### Hook Responsibilities:
- **Connect SWR + Zustand** - Data fetching + state management
- **Use helpers/request** - For ALL API calls
- **Use helpers/errors** - For ALL error handling
- **Loading states** - Provide loading/error states

---

## 🎯 Development Workflow (Helpers First!)

### 1. Start with Constants
- Define all API endpoints in `constants/api.ts`
- Add all user messages in `constants/messages.ts`
- Set up routes in `constants/routes.ts`

### 2. **Build Core Helpers (DO THIS FIRST!)**
- **Create `helpers/request.ts`** - ALL API calls go here
- **Create `helpers/errors.ts`** - ALL error handling goes here
- Set up basic request/error patterns

### 3. Set up Lib (Uses Helpers!)
- Configure SWR in `lib/swr-config.ts` (import from helpers/request)
- Create Zustand store in `lib/store.ts` (import from helpers/errors)
- Set up API client in `lib/apiClient.ts` (import from helpers/request)

### 4. Create Hooks (Must Use Helpers!)
- Build `hooks/useUsers.ts` with SWR + Zustand
- **ALWAYS import from helpers/request for API calls**
- **ALWAYS import from helpers/errors for error handling**
- Keep hooks focused on one feature

### 5. Build Components (Through Hooks Only!)
- Import from hooks, never directly from lib or helpers
- Use constants for all text and URLs
- All API calls happen through hooks → helpers

---

## 🐛 DETAILED LOGGING Rules (For AI Context!)

### **🤖 Why Detailed Logs?**
- **AI can help you** - Give full context to AI tools
- **Quick debugging** - Know exactly what happened
- **Demo troubleshooting** - Fix issues during presentation
- **Team collaboration** - Others can understand your code

### **� MANDATORY Logging Format:**

#### **1. API Request Logging (in helpers/request.ts):**
```javascript
// ALWAYS log: method, url, payload, timestamp, user context
console.log('🌐 [API-REQUEST]', {
  method: 'POST',
  url: '/api/users',
  payload: { name: 'John', email: 'john@email.com' },
  timestamp: new Date().toISOString(),
  component: 'UserForm',
  hook: 'useUsers',
  action: 'createUser'
})
```

#### **2. API Response Logging (in helpers/request.ts):**
```javascript
// ALWAYS log: status, data, timing, request context
console.log('📨 [API-RESPONSE]', {
  status: 200,
  url: '/api/users',
  data: { id: 123, name: 'John' },
  timing: '250ms',
  success: true,
  component: 'UserForm'
})
```

#### **3. Error Logging (in helpers/errors.ts):**
```javascript
// ALWAYS log: error type, message, stack, context, user action
console.log('❌ [ERROR]', {
  type: 'ValidationError',
  message: 'Email is required',
  originalError: error.stack,
  context: {
    component: 'UserForm',
    hook: 'useUsers',
    action: 'createUser',
    userInput: { name: 'John', email: '' }
  },
  timestamp: new Date().toISOString(),
  userId: 'user123' // if available
})
```

#### **4. State Changes (in Zustand stores):**
```javascript
// ALWAYS log: what changed, old value, new value, trigger
console.log('🔄 [STATE-CHANGE]', {
  store: 'userStore',
  field: 'users',
  oldValue: oldUsers.length,
  newValue: newUsers.length,
  action: 'addUser',
  trigger: 'API response',
  component: 'UserList'
})
```

#### **5. Hook Execution (in hooks/*.ts):**
```javascript
// ALWAYS log: hook name, input params, result, timing
console.log('🪝 [HOOK-EXEC]', {
  hook: 'useUsers',
  input: { filters: { active: true } },
  result: { count: 5, loading: false, error: null },
  timing: '120ms',
  component: 'UserList',
  revalidation: false
})
```

#### **6. Component Renders:**
```javascript
// ALWAYS log: component name, props, state changes
console.log('🎨 [COMPONENT]', {
  component: 'UserList',
  props: { showInactive: false },
  state: { selectedUser: null },
  renderTrigger: 'users data changed',
  userCount: 5
})
```

### **🔍 Context-Rich Logging Rules:**

#### **For helpers/request.ts:**
- Log **before** API call with full payload
- Log **after** API call with response/error
- Include **component name** that triggered call
- Include **hook name** that made request
- Include **user action** that started it
- Include **timing** information

#### **For helpers/errors.ts:**
- Log **original error** with full stack trace
- Log **processed error** with user-friendly message
- Include **user context** (what they were doing)
- Include **app state** at time of error
- Include **recovery actions** taken

#### **For hooks/*.ts:**
- Log **hook entry** with parameters
- Log **SWR cache** hits/misses
- Log **state updates** before/after
- Log **side effects** triggered
- Log **performance** metrics

#### **For components:**
- Log **major user interactions** (clicks, form submits)
- Log **prop changes** that cause re-renders
- Log **conditional rendering** decisions
- Log **error boundaries** triggers

### **🤖 AI-Friendly Log Structure:**
```javascript
// Template for ALL logs - copy this format!
console.log('[LOG-TYPE]', {
  // Core info
  timestamp: new Date().toISOString(),
  component: 'ComponentName',
  action: 'whatHappened',
  
  // Context
  userAction: 'what user did',
  appState: 'relevant state',
  
  // Data
  input: 'what went in',
  output: 'what came out',
  
  // Meta
  timing: 'how long',
  success: true/false,
  
  // Debug info
  stack: 'for errors',
  additionalInfo: 'anything else helpful'
})
```

### **🔧 Debug Tools for AI Context:**

#### **Global Debug Function (create in utils/debug.ts):**
```javascript
// One function to rule them all - use everywhere!
export const debugLog = (type: string, data: any, context?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${type}]`, {
      timestamp: new Date().toISOString(),
      ...data,
      context: context || 'no context provided',
      url: window.location.href,
      userAgent: navigator.userAgent.slice(0, 50)
    })
  }
}

// Usage examples:
debugLog('API-REQUEST', { url, method, payload }, { component: 'UserForm' })
debugLog('STATE-CHANGE', { field, oldValue, newValue }, { hook: 'useUsers' })
debugLog('ERROR', { message, stack }, { userAction: 'clicked save button' })
```

#### **AI Helper Debug Panel (add to components):**
```javascript
// Add this to ANY component for instant AI context
{process.env.NODE_ENV === 'development' && (
  <div style={{ position: 'fixed', top: 0, right: 0, background: 'yellow', padding: '10px', zIndex: 9999 }}>
    <h4>🤖 AI DEBUG PANEL</h4>
    <button onClick={() => {
      const fullContext = {
        component: 'UserList', // Update this
        currentState: useAppStore.getState(),
        props: props,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        recentActions: 'list recent user actions here',
        errorHistory: 'any recent errors',
        networkStatus: navigator.onLine
      }
      console.log('🤖 [AI-CONTEXT]', fullContext)
      console.log('📋 Copy this entire log to AI for help!')
    }}>
      📋 Copy Full Context to AI
    </button>
  </div>
)}
```

### **📊 Performance & Analytics Logging:**

#### **Track User Journey:**
```javascript
// Track complete user flows for AI analysis
const trackUserJourney = (action: string, details: any) => {
  debugLog('USER-JOURNEY', {
    action,
    details,
    sessionId: 'generate or get session id',
    stepNumber: 'current step in flow',
    previousAction: 'what they did before',
    timeSpentOnPage: 'how long on current page'
  })
}

// Usage:
trackUserJourney('form-submit', { form: 'createUser', isValid: true })
trackUserJourney('navigation', { from: '/users', to: '/products' })
```

#### **Performance Monitoring:**
```javascript
// Log performance issues for AI optimization
const logPerformance = (operation: string, timing: number, details?: any) => {
  debugLog('PERFORMANCE', {
    operation,
    timing: `${timing}ms`,
    threshold: timing > 1000 ? 'SLOW' : 'OK',
    details,
    memoryUsage: (performance as any).memory?.usedJSHeapSize
  })
}
```

### **🚨 Error Context for AI:**

#### **Complete Error Context:**
```javascript
// When error occurs, give AI EVERYTHING
const logErrorForAI = (error: any, context: string) => {
  debugLog('AI-ERROR-CONTEXT', {
    // Error details
    errorMessage: error.message,
    errorStack: error.stack,
    errorType: error.constructor.name,
    
    // App context
    currentRoute: window.location.pathname,
    userActions: 'last 3-5 actions user took',
    appState: useAppStore.getState(),
    
    // Technical context
    browserInfo: navigator.userAgent,
    timestamp: new Date().toISOString(),
    networkStatus: navigator.onLine,
    
    // User context
    whatUserWasDoing: context,
    expectedBehavior: 'what should have happened',
    actualBehavior: 'what actually happened',
    
    // Code context
    component: 'which component',
    hook: 'which hook if applicable',
    apiCall: 'which API call if applicable'
  })
  
  console.log('🤖 ☝️ COPY THE ABOVE LOG TO AI FOR INSTANT HELP!')
}
```

### **📱 Real-time AI Assistance:**

#### **AI Prompt Generator:**
```javascript
// Generate AI prompts automatically
const generateAIPrompt = (issue: string) => {
  const prompt = `
🤖 AI DEBUGGING REQUEST:

ISSUE: ${issue}

CURRENT STATE: ${JSON.stringify(useAppStore.getState(), null, 2)}

RECENT LOGS: ${JSON.stringify(getRecentLogs(), null, 2)}

COMPONENT: ${getCurrentComponent()}

USER ACTION: ${getLastUserAction()}

EXPECTED: [Describe what should happen]

ACTUAL: [Describe what actually happened]

STACK TRACE: [Include if error]

Please help debug this issue. Provide:
1. Root cause analysis
2. Step-by-step fix
3. Prevention tips
`
  
  console.log('🤖 [AI-PROMPT]', prompt)
  return prompt
}
```

---

## 🤖 Using Logs with AI Tools

### **How to Get AI Help:**
1. **Reproduce the issue** - Make it happen again
2. **Check console logs** - Look for the detailed logs
3. **Copy full context** - Use the AI debug panel button
4. **Paste to AI** - Give complete log to AI assistant
5. **Follow AI guidance** - Implement suggested fixes

### **Perfect AI Prompt Structure:**
```
Hi AI! I need help with my React app. Here's the full context:

ISSUE: [Brief description]

LOGS: [Paste the detailed logs from console]

EXPECTED BEHAVIOR: [What should happen]

ACTUAL BEHAVIOR: [What actually happens]

Please provide:
1. Root cause analysis
2. Step-by-step fix
3. Code examples
4. Prevention tips
```

### **Log Categories for AI:**
- **🌐 [API-REQUEST]** - For API issues
- **📨 [API-RESPONSE]** - For response problems
- **❌ [ERROR]** - For error debugging  
- **🔄 [STATE-CHANGE]** - For state issues
- **🪝 [HOOK-EXEC]** - For hook problems
- **🎨 [COMPONENT]** - For UI issues
- **🤖 [AI-CONTEXT]** - Complete app context
- **📊 [PERFORMANCE]** - For speed issues

### **Emergency AI Debug:**
```javascript
// When everything breaks, run this:
const emergencyDebug = () => {
  console.log('🚨 [EMERGENCY-DEBUG]', {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    
    // App state
    storeState: useAppStore.getState(),
    
    // Recent errors
    recentErrors: getRecentErrors(),
    
    // Network status
    online: navigator.onLine,
    
    // Performance
    memory: (performance as any).memory,
    
    // User context
    lastActions: getLastUserActions(),
    
    // Tech context
    browser: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    
    // App context
    currentRoute: window.location.pathname,
    components: getCurrentComponents()
  })
  
  console.log('🤖 EMERGENCY: Copy above log to AI immediately!')
}

// Add to window for easy access
window.emergencyDebug = emergencyDebug
```
```
```

---

## ⚡ Component Development

### Component Rules:
- **One responsibility** - Users, products, forms, etc.
- **Use hooks** - Never call API directly
- **Import constants** - All text from constants folder
- **Handle loading/error** - Show appropriate states

### File Organization:
- Keep components flat in `components/`
- Use descriptive names: `UserList.tsx`, `ProductForm.tsx`
- Co-locate related components if needed

---

## 🚨 Common Issues & Quick Fixes

### SWR Not Working:
- Check if SWR provider is set up in app layout
- Verify API endpoints in constants
- Look for network errors in console

### Zustand State Not Updating:
- Always use functional updates for arrays
- Check if you're subscribing correctly
- Use store devtools for debugging

### API Errors:
- **🚨 Check helpers/request.ts** - All API calls must go here
- **🚨 Check helpers/errors.ts** - All error processing here
- **Verify API endpoints** - In constants, called through helpers/request
- **Test with network tab** - But API calls through helpers only

### Component Not Re-rendering:
- Add key props to lists
- Check if state updates are immutable
- Use React DevTools

---

## ✅ Pre-Demo Checklist

### Code Quality:
- [ ] All API endpoints in `constants/api.ts`
- [ ] All messages in `constants/messages.ts`  
- [ ] **🚨 ALL API calls use `helpers/request.ts`**
- [ ] **🚨 ALL errors use `helpers/errors.ts`**
- [ ] **🤖 DETAILED LOGGING everywhere** (API, errors, state changes)
- [ ] Hooks are in `hooks/` folder
- [ ] No hardcoded URLs or messages
- [ ] **NO direct fetch() calls anywhere**
- [ ] **NO inline error handling**
- [ ] **AI debug panel** added to main components

### Functionality:
- [ ] Loading states work
- [ ] Error messages are user-friendly
- [ ] Can add/edit/delete data
- [ ] **Console logs provide full context**
- [ ] **Emergency debug function** available
- [ ] Works on mobile

### Demo Preparation:
- [ ] Have test data ready
- [ ] Prepare for network issues
- [ ] **AI context logs** working
- [ ] **Performance logs** show timing
- [ ] Know how to reset state
- [ ] Debug panels hidden
- [ ] Backup plan ready

---

## 🎪 Demo Day Tips

### Before Demo:
1. **Test everything** - Full user flow
2. **Prepare fallback data** - If API fails
3. **Have reset button** - Fresh start
4. **Clear console** - No errors
5. **Test offline** - Graceful degradation

### During Demo:
1. **Show, don't tell** - Let them use it
2. **Have backup data** - Pre-populated examples
3. **Know shortcuts** - Quick ways to show features
4. **Stay calm** - Things will break
5. **Focus on working parts** - Skip broken features

### Emergency Fixes:
- **Hard refresh** - Ctrl+F5 clears everything
- **Use fallback data** - Better than empty screens
- **Skip broken features** - Show what works
- **Blame the network** - Classic excuse
- **Have mobile ready** - Backup platform

---

## 🏆 Success Formula

**Folder Structure + Constants + Helpers + Hooks = Winning Hackathon Project**

### Why This Works:
- **Organized** - Easy to find and fix things
- **Consistent** - Same patterns everywhere
- **Debuggable** - Detailed logs for instant AI help
- **AI-Friendly** - Full context in every log
- **Scalable** - Add features without breaking
- **Demo-ready** - Professional looking code

### Final Reminders:
- **🚨 USE THE FOLDERS** - constants, helpers, hooks, lib
- **🚨 USE helpers/request.ts** - For ALL API calls (even with SWR)
- **🚨 USE helpers/errors.ts** - For ALL error handling (even with Zustand)
- **🤖 LOG EVERYTHING** - Detailed logs for AI assistance
- **NO HARDCODING** - Everything through constants
- **NO DIRECT FETCH** - Everything through helpers/request
- **NO INLINE ERRORS** - Everything through helpers/errors
- **🤖 COPY LOGS TO AI** - When stuck, paste console logs to AI
- **📊 PERFORMANCE LOGS** - Track timing for optimization
- **🚨 EMERGENCY DEBUG** - Use window.emergencyDebug() when broken
- **LOG EVERYTHING** - Console logs save demos
- **KEEP IT SIMPLE** - Working > perfect

**Now go build something amazing! 🚀**
