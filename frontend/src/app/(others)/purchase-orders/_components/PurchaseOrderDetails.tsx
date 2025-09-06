'use client';

import React from 'react';
import { Edit, CheckCircle, Package, Calendar, User, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase-orders';
import hackLog from '@/lib/logger';

interface PurchaseOrderDetailsProps {
  purchaseOrder: PurchaseOrder;
  onEdit: () => void;
  onReceive: (order: PurchaseOrder) => void;
}

export function PurchaseOrderDetails({ 
  purchaseOrder, 
  onEdit, 
  onReceive 
}: PurchaseOrderDetailsProps) {

  // Component mount logging
  React.useEffect(() => {
    hackLog.componentMount('PurchaseOrderDetails', {
      orderId: purchaseOrder.id,
      orderNumber: purchaseOrder.order_number,
      timestamp: new Date().toISOString()
    });
  }, [purchaseOrder.id, purchaseOrder.order_number]);

  // Get status badge variant
  const getStatusBadgeVariant = (status: PurchaseOrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case PurchaseOrderStatus.PENDING:
        return "outline";
      case PurchaseOrderStatus.CONFIRMED:
        return "default";
      case PurchaseOrderStatus.RECEIVED:
        return "secondary";
      case PurchaseOrderStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  // Format currency
  const formatCurrency = (amount: string | null): string => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate totals for items
  const calculateItemsTotal = () => {
    if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
      return { totalOrdered: 0, totalReceived: 0, totalValue: 0 };
    }

    return purchaseOrder.items.reduce((totals, item) => {
      return {
        totalOrdered: totals.totalOrdered + item.quantity_ordered,
        totalReceived: totals.totalReceived + item.quantity_received,
        totalValue: totals.totalValue + parseFloat(item.total_cost)
      };
    }, { totalOrdered: 0, totalReceived: 0, totalValue: 0 });
  };

  const itemTotals = calculateItemsTotal();

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold">{purchaseOrder.order_number}</h3>
          <p className="text-muted-foreground">
            Created on {formatDate(purchaseOrder.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(purchaseOrder.status)}>
            {purchaseOrder.status}
          </Badge>
          <Button onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {purchaseOrder.status === PurchaseOrderStatus.CONFIRMED && (
            <Button 
              onClick={() => onReceive(purchaseOrder)} 
              variant="outline"
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Received
            </Button>
          )}
        </div>
      </div>

      {/* Purchase Order Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Supplier Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="font-medium">{purchaseOrder.supplier.name}</p>
            </div>
            {purchaseOrder.supplier.contact_person && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <p>{purchaseOrder.supplier.contact_person}</p>
              </div>
            )}
            {purchaseOrder.supplier.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{purchaseOrder.supplier.email}</p>
              </div>
            )}
            {purchaseOrder.supplier.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p>{purchaseOrder.supplier.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Order Date</label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(purchaseOrder.order_date)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(purchaseOrder.expected_delivery_date)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p className="flex items-center gap-2 text-lg font-bold">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(purchaseOrder.total_amount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {purchaseOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {purchaseOrder.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      {purchaseOrder.items && purchaseOrder.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''} in this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty Ordered</TableHead>
                    <TableHead className="text-right">Qty Received</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {item.product.sku}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity_ordered.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.quantity_received.toLocaleString()}
                          {item.quantity_received >= item.quantity_ordered ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : item.quantity_received > 0 ? (
                            <div className="h-4 w-4 rounded-full border-2 border-yellow-500 bg-yellow-100" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_cost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total_cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Items Summary */}
            <Separator className="my-4" />
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold">{itemTotals.totalOrdered.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Items Ordered</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold">{itemTotals.totalReceived.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Items Received</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold">{formatCurrency(itemTotals.totalValue.toString())}</div>
                <div className="text-sm text-muted-foreground">Calculated Total Value</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold">
                  {itemTotals.totalOrdered > 0 
                    ? Math.round((itemTotals.totalReceived / itemTotals.totalOrdered) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Fulfillment Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p>{formatDate(purchaseOrder.created_at)}</p>
              <p className="text-sm text-muted-foreground">by {purchaseOrder.created_by}</p>
            </div>
            {purchaseOrder.updated_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p>{formatDate(purchaseOrder.updated_at)}</p>
                {purchaseOrder.updated_by && (
                  <p className="text-sm text-muted-foreground">by {purchaseOrder.updated_by}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
