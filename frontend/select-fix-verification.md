# Select Component Console Error Fix

## Issue Fixed
Resolved the console error: "A <Select.Item /> must have a value prop that is not an empty string."

## Root Cause
Multiple SelectItem components were using empty string values (`value=""`) which is not allowed by the Radix UI Select component.

## Files Modified

### 1. ProductFilters.tsx
- Changed `<SelectItem value="">All categories</SelectItem>` to `<SelectItem value="__all__">All categories</SelectItem>`
- Changed `<SelectItem value="">All statuses</SelectItem>` to `<SelectItem value="__all__">All statuses</SelectItem>`
- Changed `<SelectItem value="">All products</SelectItem>` to `<SelectItem value="__all__">All products</SelectItem>`
- Updated filter logic to handle `__all__` values properly

### 2. ProductForm.tsx
- Changed `<SelectItem value="">No category</SelectItem>` to `<SelectItem value="__none__">No category</SelectItem>`
- Updated form submission logic to handle `__none__` value

### 3. PurchaseOrderFilters.tsx
- Changed `<SelectItem value="">All statuses</SelectItem>` to `<SelectItem value="__all__">All statuses</SelectItem>`
- Updated filter logic to handle `__all__` value

## Solution Strategy
- Used `__all__` for "All" or "Any" options in filters
- Used `__none__` for "No selection" or "None" options
- Updated all related logic to treat these special values as undefined/null when processing

## Verification
- Products page loads without console errors
- Categories page loads without console errors
- Filter functionality works correctly
- Form submission handles special values properly

## Status
✅ Console error resolved
✅ All Select components now have valid non-empty string values
✅ Filter and form logic updated to handle special values