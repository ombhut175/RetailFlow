'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api/inventory';
import { Product, Category, CreateProductRequest, UpdateProductRequest, FormMode } from '@/types/inventory';
import { Package, DollarSign, Hash, Barcode, Tag, FileText } from 'lucide-react';

interface ProductFormProps {
  mode: FormMode;
  product?: Product | null;
  categories: Category[];
  onSubmit: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  sku: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  unit_price: string;
  cost_price?: string;
  minimum_stock_level: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  unit_price?: string;
  cost_price?: string;
  minimum_stock_level?: string;
}

export function ProductForm({ mode, product, categories, onSubmit, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    barcode: '',
    category_id: '',
    description: '',
    unit_price: '',
    cost_price: '',
    minimum_stock_level: '0',
    is_active: true
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when product changes
  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        category_id: product.category_id?.toString() || '',
        description: product.description || '',
        unit_price: product.unit_price,
        cost_price: product.cost_price || '',
        minimum_stock_level: product.minimum_stock_level.toString(),
        is_active: product.is_active
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        category_id: '',
        description: '',
        unit_price: '',
        cost_price: '',
        minimum_stock_level: '0',
        is_active: true
      });
    }
    setErrors({});
  }, [product, mode]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Product name must be less than 200 characters';
    }

    // SKU validation
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (formData.sku.length > 50) {
      newErrors.sku = 'SKU must be less than 50 characters';
    } else if (!/^[A-Z0-9-_]+$/.test(formData.sku)) {
      newErrors.sku = 'SKU can only contain uppercase letters, numbers, hyphens, and underscores';
    }

    // Barcode validation (optional)
    if (formData.barcode && formData.barcode.length > 100) {
      newErrors.barcode = 'Barcode must be less than 100 characters';
    }

    // Description validation (optional)
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Unit price validation
    if (!formData.unit_price.trim()) {
      newErrors.unit_price = 'Unit price is required';
    } else {
      const price = parseFloat(formData.unit_price);
      if (isNaN(price) || price < 0) {
        newErrors.unit_price = 'Unit price must be a valid positive number';
      } else if (price > 999999.99) {
        newErrors.unit_price = 'Unit price must be less than $999,999.99';
      }
    }

    // Cost price validation (optional)
    if (formData.cost_price && formData.cost_price.trim()) {
      const costPrice = parseFloat(formData.cost_price);
      if (isNaN(costPrice) || costPrice < 0) {
        newErrors.cost_price = 'Cost price must be a valid positive number';
      } else if (costPrice > 999999.99) {
        newErrors.cost_price = 'Cost price must be less than $999,999.99';
      }
    }

    // Minimum stock level validation
    if (!formData.minimum_stock_level.trim()) {
      newErrors.minimum_stock_level = 'Minimum stock level is required';
    } else {
      const stockLevel = parseInt(formData.minimum_stock_level);
      if (isNaN(stockLevel) || stockLevel < 0) {
        newErrors.minimum_stock_level = 'Minimum stock level must be a valid non-negative number';
      } else if (stockLevel > 999999) {
        newErrors.minimum_stock_level = 'Minimum stock level must be less than 999,999';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onCancel();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        barcode: formData.barcode?.trim() || undefined,
        category_id: (formData.category_id && formData.category_id !== '__none__') ? formData.category_id : undefined,
        description: formData.description?.trim() || undefined,
        unit_price: parseFloat(formData.unit_price),
        cost_price: formData.cost_price?.trim() ? parseFloat(formData.cost_price) : undefined,
        minimum_stock_level: parseInt(formData.minimum_stock_level),
        is_active: formData.is_active
      };

      if (mode === 'create') {
        await productsApi.createProduct(requestData as CreateProductRequest);
        toast({
          title: 'Success',
          description: 'Product created successfully'
        });
      } else if (mode === 'edit' && product) {
        await productsApi.updateProduct(product.id, requestData as UpdateProductRequest);
        toast({
          title: 'Success',
          description: 'Product updated successfully'
        });
      }

      onSubmit();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode} product`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price for display
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(price));
  };

  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential product details and identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                disabled={isReadOnly}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                SKU *
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                placeholder="Enter SKU (e.g., PROD-001)"
                disabled={isReadOnly}
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku}</p>
              )}
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode" className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                Barcode
              </Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Enter barcode (optional)"
                disabled={isReadOnly}
                className={errors.barcode ? 'border-destructive' : ''}
              />
              {errors.barcode && (
                <p className="text-sm text-destructive">{errors.barcode}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </Label>
              {isReadOnly ? (
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {product?.category ? (
                    <Badge variant="outline">{product.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">No category assigned</span>
                  )}
                </div>
              ) : (
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger className={errors.category_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter product description (optional)"
              disabled={isReadOnly}
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing & Inventory
          </CardTitle>
          <CardDescription>
            Price settings and stock management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Unit Price */}
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', e.target.value)}
                placeholder="0.00"
                disabled={isReadOnly}
                className={errors.unit_price ? 'border-destructive' : ''}
              />
              {errors.unit_price && (
                <p className="text-sm text-destructive">{errors.unit_price}</p>
              )}
            </div>

            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                value={formData.cost_price}
                onChange={(e) => handleInputChange('cost_price', e.target.value)}
                placeholder="0.00"
                disabled={isReadOnly}
                className={errors.cost_price ? 'border-destructive' : ''}
              />
              {errors.cost_price && (
                <p className="text-sm text-destructive">{errors.cost_price}</p>
              )}
            </div>

            {/* Minimum Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="minimum_stock_level">Minimum Stock Level *</Label>
              <Input
                id="minimum_stock_level"
                type="number"
                min="0"
                max="999999"
                value={formData.minimum_stock_level}
                onChange={(e) => handleInputChange('minimum_stock_level', e.target.value)}
                placeholder="0"
                disabled={isReadOnly}
                className={errors.minimum_stock_level ? 'border-destructive' : ''}
              />
              {errors.minimum_stock_level && (
                <p className="text-sm text-destructive">{errors.minimum_stock_level}</p>
              )}
            </div>
          </div>

          {/* Profit Margin Display (if both prices are provided) */}
          {formData.unit_price && formData.cost_price && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Profit Analysis</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Profit Margin:</span>
                  <div className="font-medium">
                    {formatPrice((parseFloat(formData.unit_price) - parseFloat(formData.cost_price)).toString())}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Profit %:</span>
                  <div className="font-medium">
                    {(((parseFloat(formData.unit_price) - parseFloat(formData.cost_price)) / parseFloat(formData.unit_price)) * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Markup %:</span>
                  <div className="font-medium">
                    {(((parseFloat(formData.unit_price) - parseFloat(formData.cost_price)) / parseFloat(formData.cost_price)) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Settings</CardTitle>
          <CardDescription>
            Product availability and system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Status</Label>
              <div className="text-sm text-muted-foreground">
                {formData.is_active ? 'Product is available for sale' : 'Product is hidden from sales'}
              </div>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Information (View mode only) */}
      {mode === 'view' && product && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
            <CardDescription>
              Creation and modification history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Created</Label>
                <div className="text-sm">
                  {formatDate(product.created_at)}
                  {product.created_by && (
                    <div className="text-muted-foreground">by {product.created_by}</div>
                  )}
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <div className="text-sm">
                  {product.updated_at ? formatDate(product.updated_at) : 'Never'}
                  {product.updated_by && (
                    <div className="text-muted-foreground">by {product.updated_by}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {mode === 'view' ? 'Close' : 'Cancel'}
        </Button>
        {mode !== 'view' && (
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
          </Button>
        )}
      </div>
    </form>
  );
}