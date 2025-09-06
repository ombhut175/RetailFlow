'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi } from '@/lib/api/inventory';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, FormMode } from '@/types/inventory';

// Form validation schema
const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true)
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  mode: FormMode;
  category?: Category | null;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  onCancel: () => void;
}

export function CategoryForm({ mode, category, onSubmit, onCancel }: CategoryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true
    }
  });

  // Reset form when category changes
  useEffect(() => {
    if (category && (mode === 'edit' || mode === 'view')) {
      form.reset({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        description: '',
        is_active: true
      });
    }
  }, [category, mode, form]);

  const handleSubmit = async (data: CategoryFormData) => {
    if (mode === 'view') return;

    setIsSubmitting(true);
    
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        is_active: data.is_active
      };

      if (mode === 'create') {
        await categoriesApi.createCategory(payload as CreateCategoryRequest);
        toast({
          title: 'Success',
          description: 'Category created successfully'
        });
      } else if (mode === 'edit' && category) {
        await categoriesApi.updateCategory(category.id, payload as UpdateCategoryRequest);
        toast({
          title: 'Success',
          description: 'Category updated successfully'
        });
      }

      onSubmit(payload);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode} category`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  disabled={isReadOnly}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A unique name for this category (max 100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter category description (optional)"
                  disabled={isReadOnly}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description for this category (max 500 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status Field */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Active Status
                </FormLabel>
                <FormDescription>
                  {field.value 
                    ? 'This category is active and can be used for products' 
                    : 'This category is inactive and hidden from product selection'
                  }
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isReadOnly}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* View Mode Info */}
        {mode === 'view' && category && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <p>{new Date(category.created_at).toLocaleString()}</p>
              </div>
              {category.updated_at && (
                <div>
                  <span className="font-medium text-muted-foreground">Updated:</span>
                  <p>{new Date(category.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">ID:</span>
              <p className="font-mono text-xs break-all">{category.id}</p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {mode !== 'view' && (
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Category' : 'Update Category'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}