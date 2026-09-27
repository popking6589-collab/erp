export type ScreenId =
  | 'dashboard'
  | 'system_admin'
  | 'operations_hub'
  | 'company'
  | 'users'
  | 'accounts'
  | 'jobs'
  | 'departments'
  | 'employees'
  | 'warehouses'
  | 'items'
  | 'customers'
  | 'suppliers'
  | 'sales_invoice'
  | 'sales_return'
  | 'purchase_invoice'
  | 'purchase_return'
  | 'stock_adjustments'
  | 'warehouse_transfer'
  | 'cash_bank'
  | 'receipt_voucher'
  | 'payment_voucher'
  | 'journal_entries'
  | 'reports';

export interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  taxNumber: string;
  commercialRegister: string;
  email: string;
  notes?: string;
}

export interface UserPermission {
  screenId: ScreenId;
  screenName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPrint: boolean;
}

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  employeeId?: string;
  employeeName?: string;
  isActive: boolean;
  isAdmin: boolean;
  permissions: Record<ScreenId, {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canPrint: boolean;
  }>;
  createdAt: string;
}

export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountNature = 'debit' | 'credit';
export type FinancialStatement = 'balance_sheet' | 'income_statement';
export type LinkedModuleType = 'cash_bank' | 'customers' | 'suppliers' | 'sales' | 'purchases' | 'inventory' | 'cogs' | 'taxes' | 'expenses' | 'general';

export interface AccountNode {
  code: string;
  nameAr: string;
  nameEn?: string;
  parentCode?: string | null;
  category: AccountCategory;
  nature: AccountNature;
  statement: FinancialStatement;
  level: number;
  isParent: boolean;
  linkedModule?: LinkedModuleType;
  openingBalance: number;
  currentDebit?: number;
  currentCredit?: number;
  currentBalance?: number;
  notes?: string;
}

export interface JobTitle {
  id: string;
  code: string;
  title: string;
  notes?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  notes?: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  jobId: string;
  jobTitle?: string;
  departmentId: string;
  departmentName?: string;
  salary: number;
  birthDate: string;
  nationalId: string;
  address: string;
  qualification: string;
  photoUrl: string;
  phone?: string;
  hireDate?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  managerEmployeeId: string;
  managerName?: string;
  phone?: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  unit: string;
  minQuantity: number;
  openingStock: number;
  currentStock: number;
  category?: string;
  barcode?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  governorate: string;
  address: string;
  salesRepEmployeeId: string;
  salesRepName?: string;
  openingBalance: number;
  currentBalance: number;
  linkedAccountCode?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  governorate: string;
  address: string;
  salesRepEmployeeId: string;
  salesRepName?: string;
  openingBalance: number;
  currentBalance: number;
  linkedAccountCode?: string;
  notes?: string;
}

export type PaymentMethod = 'نقدي' | 'آجل' | 'فيزا' | 'تحويل بنكي';

export interface InvoiceItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discountPercent: number;
  discountAmount: number;
  net: number;
}

export interface InvoicePayment {
  id: string;
  paymentMethod: PaymentMethod;
  cashBankId: string;
  cashBankName: string;
  amount: number;
  referenceNo?: string;
  date: string;
  notes?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  paymentTermsDays: number;
  warehouseId: string;
  warehouseName: string;
  customerId: string;
  customerName: string;
  salesRepEmployeeId: string;
  salesRepName: string;
  items: InvoiceItem[];
  subtotal: number;
  invoiceDiscountPercent: number;
  invoiceDiscountAmount: number;
  taxPercent: number;
  taxAmount: number;
  withholdingTaxPercent: number; // 1% اشعار خصم
  withholdingTaxAmount: number;
  netTotal: number;
  paymentMethod: PaymentMethod;
  payments: InvoicePayment[];
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  journalEntryId?: string;
}

export interface SalesReturn {
  id: string;
  returnNo: string;
  invoiceId?: string;
  invoiceNo?: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  customerId: string;
  customerName: string;
  salesRepEmployeeId: string;
  salesRepName: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  netTotal: number;
  payments: InvoicePayment[];
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  warehouseId: string;
  warehouseName: string;
  supplierId: string;
  supplierName: string;
  salesRepEmployeeId: string;
  salesRepName: string;
  items: InvoiceItem[];
  subtotal: number;
  invoiceDiscountAmount: number;
  taxPercent: number;
  taxAmount: number;
  withholdingTaxPercent: number;
  withholdingTaxAmount: number;
  netTotal: number;
  paymentMethod: PaymentMethod;
  payments: InvoicePayment[];
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  returnNo: string;
  invoiceId?: string;
  invoiceNo?: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  supplierId: string;
  supplierName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  netTotal: number;
  payments: InvoicePayment[];
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export type AdjustmentType = 'إضافة' | 'صرف';

export interface StockAdjustmentItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  bookQuantity: number;
  physicalQuantity: number;
  diffQuantity: number;
  costPrice: number;
  diffTotal: number;
}

export interface StockAdjustment {
  id: string;
  docNo: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  type: AdjustmentType;
  items: StockAdjustmentItem[];
  totalDiffValue: number;
  notes?: string;
  createdAt: string;
}

export interface WarehouseTransferItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface WarehouseTransfer {
  id: string;
  transferNo: string;
  date: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  items: WarehouseTransferItem[];
  totalCost: number;
  notes?: string;
  createdAt: string;
}

export type CashBankType = 'خزينة نقدية' | 'حساب بنكي';

export interface CashBank {
  id: string;
  code: string;
  name: string;
  type: CashBankType;
  accountNumber?: string;
  bankBranch?: string;
  openingBalance: number;
  currentBalance: number;
  linkedAccountCode: string;
  notes?: string;
}

export type VoucherPayType = 'نقدي' | 'شيك' | 'تحويل بنكي';

export interface ReceiptVoucher {
  id: string;
  voucherNo: string;
  date: string;
  cashBankId: string;
  cashBankName: string;
  payType: VoucherPayType;
  checkNumber?: string;
  checkDueDate?: string;
  transferRefNumber?: string;
  customerId?: string;
  customerName?: string;
  accountCode: string;
  accountName: string;
  amount: number;
  settledInvoices?: {
    invoiceId: string;
    invoiceNo: string;
    paidAmount: number;
  }[];
  notes?: string;
  createdAt: string;
}

export interface PaymentVoucher {
  id: string;
  voucherNo: string;
  date: string;
  cashBankId: string;
  cashBankName: string;
  payType: VoucherPayType;
  checkNumber?: string;
  checkDueDate?: string;
  transferRefNumber?: string;
  supplierId?: string;
  supplierName?: string;
  accountCode: string;
  accountName: string;
  amount: number;
  settledInvoices?: {
    invoiceId: string;
    invoiceNo: string;
    paidAmount: number;
  }[];
  notes?: string;
  createdAt: string;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  notes: string;
}

export interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  description: string;
  sourceType: 'manual' | 'sales' | 'sales_return' | 'purchase' | 'purchase_return' | 'receipt' | 'payment' | 'adjustment' | 'transfer' | 'year_close';
  sourceDocNo?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'close_year';
  screen: string;
  details: string;
}

export interface FiscalYear {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
}
