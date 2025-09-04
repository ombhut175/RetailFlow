// Application routes and navigation paths

// Main app routes
export const ROUTES = {
  // Main pages
  HOME: '/',
  TESTING: '/testing',
  
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  
  // Style guide and docs
  STYLEGUIDE: '/styleguide',
  
  // API routes (for external linking/reference)
  API: {
    TESTING: '/api/test/testing',
    SUPABASE_STATUS: '/api/test/supabase-status',
    DATABASE_STATUS: '/api/test/database-status',
  }
} as const;

// Navigation items for menus/sidebars
export const NAV_ITEMS = [
  {
    title: 'Home',
    href: ROUTES.HOME,
    icon: 'home',
  },
  {
    title: 'Testing Dashboard',
    href: ROUTES.TESTING,
    icon: 'activity',
  },
  {
    title: 'Style Guide',
    href: ROUTES.STYLEGUIDE,
    icon: 'palette',
  },
] as const;
