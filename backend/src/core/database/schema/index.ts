import { healthChecking } from './health-checking';
import { users } from './users';
import { posts } from './posts';
import { userRoles, roleEnum } from './user-roles';
import { categories } from './categories';
import { suppliers } from './suppliers';
import { products } from './products';
import { stock } from './stock';
import { stockTransactions, transactionTypeEnum, referenceTypeEnum } from './stock-transactions';
import { purchaseOrders, purchaseOrderStatusEnum } from './purchase-orders';
import { purchaseOrderItems } from './purchase-order-items';
import { salesInvoices, paymentStatusEnum } from './sales-invoices';
import { salesInvoiceItems } from './sales-invoice-items';

// Schema exports
export const schema = {
  healthChecking,
  users,
  posts,
  userRoles,
  categories,
  suppliers,
  products,
  stock,
  stockTransactions,
  purchaseOrders,
  purchaseOrderItems,
  salesInvoices,
  salesInvoiceItems,
};

// Export individual tables for convenience
export { 
  healthChecking, 
  users, 
  posts,
  userRoles,
  categories,
  suppliers,
  products,
  stock,
  stockTransactions,
  purchaseOrders,
  purchaseOrderItems,
  salesInvoices,
  salesInvoiceItems,
};

// Export enums
export {
  roleEnum,
  transactionTypeEnum,
  referenceTypeEnum,
  purchaseOrderStatusEnum,
  paymentStatusEnum,
};
