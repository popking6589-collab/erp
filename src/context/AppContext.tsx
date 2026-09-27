import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanyInfo,
  AppUser,
  AccountNode,
  JobTitle,
  Department,
  Employee,
  Warehouse,
  Item,
  Customer,
  Supplier,
  CashBank,
  SalesInvoice,
  SalesReturn,
  PurchaseInvoice,
  PurchaseReturn,
  StockAdjustment,
  WarehouseTransfer,
  ReceiptVoucher,
  PaymentVoucher,
  JournalEntry,
  AuditLog,
  FiscalYear,
  ScreenId,
  PaymentMethod,
  InvoicePayment
} from '../types';
import {
  initialCompany,
  initialAccounts,
  initialJobs,
  initialDepartments,
  initialEmployees,
  initialUsers,
  initialWarehouses,
  initialItems,
  initialCustomers,
  initialSuppliers,
  initialCashBanks,
  initialFiscalYears,
  initialJournalEntries,
  initialSalesInvoices,
  initialAuditLogs
} from '../data/initialData';

interface AppContextType {
  // Current screen & user
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  currentUser: AppUser | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  canAccess: (screenId: ScreenId, action?: 'view' | 'add' | 'edit' | 'delete' | 'print') => boolean;

  // Company
  company: CompanyInfo;
  updateCompany: (info: Partial<CompanyInfo>) => void;

  // Fiscal Years
  fiscalYears: FiscalYear[];
  currentFiscalYear: FiscalYear;
  switchFiscalYear: (yearId: string) => void;
  closeCurrentYearAndOpenNew: (newYear: number) => { success: boolean; message: string };

  // System Administration & Reset
  isYearCloseModalOpen: boolean;
  setIsYearCloseModalOpen: (open: boolean) => void;
  openYearCloseModal: () => void;
  closeYearCloseModal: () => void;
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;
  openResetModal: () => void;
  closeResetModal: () => void;
  resetAllTransactionsOnly: () => { success: boolean; message: string };
  resetFactoryData: () => { success: boolean; message: string };

  // Master Data
  accounts: AccountNode[];
  addAccount: (account: AccountNode) => void;
  updateAccount: (code: string, account: Partial<AccountNode>) => void;
  deleteAccount: (code: string) => boolean;

  jobs: JobTitle[];
  addJob: (job: JobTitle) => void;
  updateJob: (id: string, job: Partial<JobTitle>) => void;
  deleteJob: (id: string) => boolean;

  departments: Department[];
  addDepartment: (dept: Department) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => boolean;

  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => boolean;

  users: AppUser[];
  addUser: (user: AppUser) => void;
  updateUser: (id: string, user: Partial<AppUser>) => void;
  deleteUser: (id: string) => boolean;

  warehouses: Warehouse[];
  addWarehouse: (wh: Warehouse) => void;
  updateWarehouse: (id: string, wh: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => boolean;

  items: Item[];
  addItem: (item: Item) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => boolean;

  customers: Customer[];
  addCustomer: (cust: Customer) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  suppliers: Supplier[];
  addSupplier: (supp: Supplier) => void;
  updateSupplier: (id: string, supp: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => boolean;

  cashBanks: CashBank[];
  addCashBank: (cb: CashBank) => void;
  updateCashBank: (id: string, cb: Partial<CashBank>) => void;
  deleteCashBank: (id: string) => boolean;

  // Operational Modules
  selectedOperationTarget: { screen: ScreenId; id?: string; invoiceNo?: string } | null;
  setSelectedOperationTarget: (target: { screen: ScreenId; id?: string; invoiceNo?: string } | null) => void;
  recordInvoicePayment: (
    type: 'sales' | 'purchase',
    invoiceId: string,
    payment: {
      amount: number;
      paymentMethod: PaymentMethod;
      cashBankId: string;
      referenceNumber?: string;
      notes?: string;
    }
  ) => { success: boolean; message: string };

  salesInvoices: SalesInvoice[];
  addSalesInvoice: (invoice: SalesInvoice) => void;
  updateSalesInvoice: (id: string, invoice: SalesInvoice) => void;
  deleteSalesInvoice: (id: string) => void;

  salesReturns: SalesReturn[];
  addSalesReturn: (ret: SalesReturn) => void;
  updateSalesReturn: (id: string, ret: SalesReturn) => void;
  deleteSalesReturn: (id: string) => void;

  purchaseInvoices: PurchaseInvoice[];
  addPurchaseInvoice: (invoice: PurchaseInvoice) => void;
  updatePurchaseInvoice: (id: string, invoice: PurchaseInvoice) => void;
  deletePurchaseInvoice: (id: string) => void;

  purchaseReturns: PurchaseReturn[];
  addPurchaseReturn: (ret: PurchaseReturn) => void;
  updatePurchaseReturn: (id: string, ret: PurchaseReturn) => void;
  deletePurchaseReturn: (id: string) => void;

  stockAdjustments: StockAdjustment[];
  addStockAdjustment: (adj: StockAdjustment) => void;
  updateStockAdjustment: (id: string, adj: StockAdjustment) => void;
  deleteStockAdjustment: (id: string) => void;

  warehouseTransfers: WarehouseTransfer[];
  addWarehouseTransfer: (transfer: WarehouseTransfer) => void;
  updateWarehouseTransfer: (id: string, transfer: WarehouseTransfer) => void;
  deleteWarehouseTransfer: (id: string) => void;

  receiptVouchers: ReceiptVoucher[];
  addReceiptVoucher: (voucher: ReceiptVoucher) => void;
  updateReceiptVoucher: (id: string, voucher: ReceiptVoucher) => void;
  deleteReceiptVoucher: (id: string) => void;

  paymentVouchers: PaymentVoucher[];
  addPaymentVoucher: (voucher: PaymentVoucher) => void;
  updatePaymentVoucher: (id: string, voucher: PaymentVoucher) => void;
  deletePaymentVoucher: (id: string) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;

  auditLogs: AuditLog[];
  logAction: (action: 'create' | 'update' | 'delete' | 'close_year', screen: string, details: string) => void;

  // Fast helper lookups
  getAccountByCode: (code: string) => AccountNode | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
  getItemById: (id: string) => Item | undefined;
  getWarehouseById: (id: string) => Warehouse | undefined;
  getEmployeeById: (id: string) => Employee | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'ALBAYAN_ERP_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [users, setUsers] = useState<AppUser[]>(() => loadFromStorage('users', initialUsers));
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const savedUsers = loadFromStorage('users', initialUsers);
    return savedUsers[0] || null;
  });

  const [company, setCompany] = useState<CompanyInfo>(() => loadFromStorage('company', initialCompany));
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(() => loadFromStorage('fiscalYears', initialFiscalYears));
  const [currentFiscalYearId, setCurrentFiscalYearId] = useState<string>(() => {
    const years = loadFromStorage('fiscalYears', initialFiscalYears);
    const active = years.find(y => !y.isClosed) || years[0];
    return active ? active.id : 'fy-2026';
  });

  const [accounts, setAccounts] = useState<AccountNode[]>(() => loadFromStorage('accounts', initialAccounts));
  const [jobs, setJobs] = useState<JobTitle[]>(() => loadFromStorage('jobs', initialJobs));
  const [departments, setDepartments] = useState<Department[]>(() => loadFromStorage('departments', initialDepartments));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('employees', initialEmployees));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => loadFromStorage('warehouses', initialWarehouses));
  const [items, setItems] = useState<Item[]>(() => loadFromStorage('items', initialItems));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', initialCustomers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('suppliers', initialSuppliers));
  const [cashBanks, setCashBanks] = useState<CashBank[]>(() => loadFromStorage('cashBanks', initialCashBanks));

  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() => loadFromStorage('salesInvoices', initialSalesInvoices));
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(() => loadFromStorage('salesReturns', []));
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => loadFromStorage('purchaseInvoices', []));
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => loadFromStorage('purchaseReturns', []));
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => loadFromStorage('stockAdjustments', []));
  const [warehouseTransfers, setWarehouseTransfers] = useState<WarehouseTransfer[]>(() => loadFromStorage('warehouseTransfers', []));
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>(() => loadFromStorage('receiptVouchers', []));
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>(() => loadFromStorage('paymentVouchers', []));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadFromStorage('journalEntries', initialJournalEntries));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', initialAuditLogs));
  const [selectedOperationTarget, setSelectedOperationTarget] = useState<{ screen: ScreenId; id?: string; invoiceNo?: string } | null>(null);

  // Modals for System Administration
  const [isYearCloseModalOpen, setIsYearCloseModalOpen] = useState(false);
  const openYearCloseModal = () => setIsYearCloseModalOpen(true);
  const closeYearCloseModal = () => setIsYearCloseModalOpen(false);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const openResetModal = () => setIsResetModalOpen(true);
  const closeResetModal = () => setIsResetModalOpen(false);

  // System Wipe & Reset
  const resetAllTransactionsOnly = (): { success: boolean; message: string } => {
    setSalesInvoices([]);
    setSalesReturns([]);
    setPurchaseInvoices([]);
    setPurchaseReturns([]);
    setStockAdjustments([]);
    setWarehouseTransfers([]);
    setReceiptVouchers([]);
    setPaymentVouchers([]);
    setJournalEntries(initialJournalEntries.filter(j => j.sourceType === 'manual' || j.sourceType === 'year_close'));

    setCustomers(prev => prev.map(c => ({ ...c, currentBalance: c.openingBalance })));
    setSuppliers(prev => prev.map(s => ({ ...s, currentBalance: s.openingBalance })));
    setItems(prev => prev.map(i => ({ ...i, currentStock: i.openingStock })));
    setCashBanks(prev => prev.map(cb => ({ ...cb, currentBalance: cb.openingBalance })));
    setAccounts(prev => prev.map(a => ({ ...a, currentDebit: 0, currentCredit: 0, currentBalance: a.openingBalance })));

    logAction('delete', 'التهيئة والإدارة', 'تم تصفير وحذف جميع الفواتير والحركات والعمليات المالية والمخزنية');
    return { success: true, message: 'تم بنجاح حذف جميع الحركات والعمليات مع الإبقاء على الدليل والبطاقات الأساسية' };
  };

  const resetFactoryData = (): { success: boolean; message: string } => {
    localStorage.clear();
    setCompany(initialCompany);
    setUsers(initialUsers);
    setAccounts(initialAccounts);
    setJobs(initialJobs);
    setDepartments(initialDepartments);
    setEmployees(initialEmployees);
    setWarehouses(initialWarehouses);
    setItems(initialItems);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setCashBanks(initialCashBanks);
    setSalesInvoices(initialSalesInvoices);
    setSalesReturns([]);
    setPurchaseInvoices([]);
    setPurchaseReturns([]);
    setStockAdjustments([]);
    setWarehouseTransfers([]);
    setReceiptVouchers([]);
    setPaymentVouchers([]);
    setJournalEntries(initialJournalEntries);
    setFiscalYears(initialFiscalYears);
    setAuditLogs(initialAuditLogs);
    setCurrentFiscalYearId(initialFiscalYears[0].id);

    logAction('delete', 'التهيئة والإدارة', 'تمت استعادة ضبط المصنع بالكامل وحذف كافة البيانات المدخلة');
    return { success: true, message: 'تمت استعادة ضبط المصنع بنجاح وتهيئة النظام بالكامل' };
  };

  // Sync to local storage on changes
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'company', JSON.stringify(company)); }, [company]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'fiscalYears', JSON.stringify(fiscalYears)); }, [fiscalYears]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'warehouses', JSON.stringify(warehouses)); }, [warehouses]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'cashBanks', JSON.stringify(cashBanks)); }, [cashBanks]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'salesInvoices', JSON.stringify(salesInvoices)); }, [salesInvoices]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'salesReturns', JSON.stringify(salesReturns)); }, [salesReturns]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'purchaseInvoices', JSON.stringify(purchaseInvoices)); }, [purchaseInvoices]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'purchaseReturns', JSON.stringify(purchaseReturns)); }, [purchaseReturns]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'stockAdjustments', JSON.stringify(stockAdjustments)); }, [stockAdjustments]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'warehouseTransfers', JSON.stringify(warehouseTransfers)); }, [warehouseTransfers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'receiptVouchers', JSON.stringify(receiptVouchers)); }, [receiptVouchers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'paymentVouchers', JSON.stringify(paymentVouchers)); }, [paymentVouchers]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'journalEntries', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);

  const currentFiscalYear = fiscalYears.find(y => y.id === currentFiscalYearId) || fiscalYears[0];

  const logAction = (action: 'create' | 'update' | 'delete' | 'close_year', screen: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'medium' }),
      userId: currentUser?.id || 'sys',
      userName: currentUser ? `${currentUser.employeeName || currentUser.username} (${currentUser.username})` : 'النظام الآلي',
      action,
      screen,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = (username: string, password?: string) => {
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.isActive);
    if (found) {
      if (found.password && password && found.password !== password) {
        return false;
      }
      setCurrentUser(found);
      logAction('update', 'تسجيل الدخول', `قام المستخدم ${found.username} بتسجيل الدخول`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAction('update', 'تسجيل الخروج', `قام المستخدم ${currentUser.username} بتسجيل الخروج`);
    }
    setCurrentUser(null);
  };

  const canAccess = (screenId: ScreenId, action: 'view' | 'add' | 'edit' | 'delete' | 'print' = 'view'): boolean => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    const perm = currentUser.permissions?.[screenId];
    if (!perm) return true;
    if (action === 'view') return perm.canView;
    if (action === 'add') return perm.canAdd;
    if (action === 'edit') return perm.canEdit;
    if (action === 'delete') return perm.canDelete;
    if (action === 'print') return perm.canPrint;
    return true;
  };

  const updateCompany = (info: Partial<CompanyInfo>) => {
    setCompany(prev => ({ ...prev, ...info }));
    logAction('update', 'شاشة تكويد الشركة', 'تم تحديث بيانات الشركة الأساسية');
  };

  const switchFiscalYear = (yearId: string) => {
    const target = fiscalYears.find(y => y.id === yearId);
    if (target) {
      setCurrentFiscalYearId(target.id);
      logAction('update', 'السنوات المالية', `تم الانتقال إلى ${target.name}`);
    }
  };

  // Close Fiscal Year
  const closeCurrentYearAndOpenNew = (newYearNum: number) => {
    // 1. Mark current as closed
    const updatedYears = fiscalYears.map(y => {
      if (y.id === currentFiscalYear.id) {
        return { ...y, isClosed: true, closedAt: new Date().toISOString().split('T')[0] };
      }
      return y;
    });

    const newYearId = `fy-${newYearNum}`;
    const newYearObj: FiscalYear = {
      id: newYearId,
      year: newYearNum,
      name: `السنة المالية ${newYearNum} (الحالية)`,
      startDate: `${newYearNum}-01-01`,
      endDate: `${newYearNum}-12-31`,
      isClosed: false
    };

    // Calculate Net Profit to move to Retained Earnings
    // Revenue - Expenses
    let totalRevenue = 0;
    let totalExpenses = 0;
    journalEntries.forEach(entry => {
      entry.lines.forEach(l => {
        if (l.accountCode.startsWith('4')) {
          totalRevenue += (l.credit - l.debit);
        } else if (l.accountCode.startsWith('5')) {
          totalExpenses += (l.debit - l.credit);
        }
      });
    });
    const netProfit = totalRevenue - totalExpenses;

    // Create Opening Journal Entry in new year
    const openingLines: any[] = [];
    accounts.forEach(acc => {
      if (acc.statement === 'balance_sheet' && !acc.isParent) {
        let bal = acc.openingBalance;
        // add journal movements
        journalEntries.forEach(je => {
          je.lines.forEach(ln => {
            if (ln.accountCode === acc.code) {
              if (acc.nature === 'debit') {
                bal += (ln.debit - ln.credit);
              } else {
                bal += (ln.credit - ln.debit);
              }
            }
          });
        });

        // Retained earnings update
        if (acc.code === '32') {
          bal += netProfit;
        }

        if (bal !== 0) {
          if (acc.nature === 'debit' && bal > 0) {
            openingLines.push({
              id: 'op-' + acc.code,
              accountCode: acc.code,
              accountName: acc.nameAr,
              debit: Math.abs(bal),
              credit: 0,
              notes: 'رصيد افتتاحي مرحل'
            });
          } else {
            openingLines.push({
              id: 'op-' + acc.code,
              accountCode: acc.code,
              accountName: acc.nameAr,
              debit: 0,
              credit: Math.abs(bal),
              notes: 'رصيد افتتاحي مرحل'
            });
          }
        }
      }
    });

    const totalDebit = openingLines.reduce((s, x) => s + x.debit, 0);
    const totalCredit = openingLines.reduce((s, x) => s + x.credit, 0);

    const openingEntry: JournalEntry = {
      id: `je-open-${newYearNum}`,
      entryNo: `JV-${newYearNum}-0001`,
      date: `${newYearNum}-01-01`,
      description: `قيد إثبات الأرصدة الافتتاحية للميزانية العمومية المنقولة بعد إقفال عام ${currentFiscalYear.year}`,
      sourceType: 'year_close',
      sourceDocNo: `CLOSE-${currentFiscalYear.year}`,
      lines: openingLines,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      createdAt: `${newYearNum}-01-01`
    };

    setFiscalYears([...updatedYears, newYearObj]);
    setCurrentFiscalYearId(newYearId);
    setJournalEntries(prev => [openingEntry, ...prev]);

    logAction('close_year', 'الإقفال السنوي', `تم إقفال السنة المالية ${currentFiscalYear.year} بنجاح وترحيل الأرصدة الافتتاحية لعام ${newYearNum}`);
    return { success: true, message: `تم إقفال السنة المالية بنجاح وفتح السنة الجديدة ${newYearNum} برقم قيد افتتاحي ${openingEntry.entryNo}` };
  };

  // Accounts
  const addAccount = (account: AccountNode) => {
    setAccounts(prev => {
      const exists = prev.some(a => a.code === account.code);
      if (exists) return prev;
      return [...prev, account];
    });
    logAction('create', 'دليل الحسابات', `إضافة الحساب ${account.code} - ${account.nameAr}`);
  };

  const updateAccount = (code: string, updated: Partial<AccountNode>) => {
    setAccounts(prev => prev.map(a => a.code === code ? { ...a, ...updated } : a));
    logAction('update', 'دليل الحسابات', `تعديل الحساب ${code}`);
  };

  const deleteAccount = (code: string) => {
    // Check if account has children
    const hasChildren = accounts.some(a => a.parentCode === code);
    if (hasChildren) return false;
    setAccounts(prev => prev.filter(a => a.code !== code));
    logAction('delete', 'دليل الحسابات', `حذف الحساب ${code}`);
    return true;
  };

  // Jobs
  const addJob = (job: JobTitle) => {
    setJobs(prev => [...prev, job]);
    logAction('create', 'شاشة الوظائف', `إضافة وظيفة ${job.title}`);
  };
  const updateJob = (id: string, updated: Partial<JobTitle>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j));
    logAction('update', 'شاشة الوظائف', `تعديل وظيفة ${id}`);
  };
  const deleteJob = (id: string) => {
    const isUsed = employees.some(e => e.jobId === id);
    if (isUsed) return false;
    setJobs(prev => prev.filter(j => j.id !== id));
    logAction('delete', 'شاشة الوظائف', `حذف وظيفة ${id}`);
    return true;
  };

  // Departments
  const addDepartment = (dept: Department) => {
    setDepartments(prev => [...prev, dept]);
    logAction('create', 'شاشة الأقسام', `إضافة قسم ${dept.name}`);
  };
  const updateDepartment = (id: string, updated: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    logAction('update', 'شاشة الأقسام', `تعديل قسم ${id}`);
  };
  const deleteDepartment = (id: string) => {
    const isUsed = employees.some(e => e.departmentId === id);
    if (isUsed) return false;
    setDepartments(prev => prev.filter(d => d.id !== id));
    logAction('delete', 'شاشة الأقسام', `حذف قسم ${id}`);
    return true;
  };

  // Employees
  const addEmployee = (emp: Employee) => {
    setEmployees(prev => [...prev, emp]);
    logAction('create', 'شاشة الموظفين', `إضافة موظف ${emp.name}`);
  };
  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    logAction('update', 'شاشة الموظفين', `تعديل موظف ${id}`);
  };
  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    logAction('delete', 'شاشة الموظفين', `حذف موظف ${id}`);
    return true;
  };

  // Users
  const addUser = (user: AppUser) => {
    setUsers(prev => [...prev, user]);
    logAction('create', 'شاشة المستخدمين', `إضافة مستخدم جديد ${user.username}`);
  };
  const updateUser = (id: string, updated: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    logAction('update', 'شاشة المستخدمين', `تعديل مستخدم ${id}`);
  };
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logAction('delete', 'شاشة المستخدمين', `حذف مستخدم ${id}`);
    return true;
  };

  // Warehouses
  const addWarehouse = (wh: Warehouse) => {
    setWarehouses(prev => [...prev, wh]);
    logAction('create', 'شاشة المخازن', `إضافة مستودع ${wh.name}`);
  };
  const updateWarehouse = (id: string, updated: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
    logAction('update', 'شاشة المخازن', `تعديل مستودع ${id}`);
  };
  const deleteWarehouse = (id: string) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
    logAction('delete', 'شاشة المخازن', `حذف مستودع ${id}`);
    return true;
  };

  // Items
  const addItem = (item: Item) => {
    setItems(prev => [...prev, item]);
    logAction('create', 'شاشة الأصناف', `إضافة صنف ${item.code} - ${item.name}`);
  };
  const updateItem = (id: string, updated: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
    logAction('update', 'شاشة الأصناف', `تعديل صنف ${id}`);
  };
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    logAction('delete', 'شاشة الأصناف', `حذف صنف ${id}`);
    return true;
  };

  // Customers
  const addCustomer = (cust: Customer) => {
    setCustomers(prev => [...prev, cust]);
    logAction('create', 'شاشة العملاء', `إضافة عميل ${cust.name}`);
  };
  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    logAction('update', 'شاشة العملاء', `تعديل عميل ${id}`);
  };
  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    logAction('delete', 'شاشة العملاء', `حذف عميل ${id}`);
    return true;
  };

  // Suppliers
  const addSupplier = (supp: Supplier) => {
    setSuppliers(prev => [...prev, supp]);
    logAction('create', 'شاشة الموردين', `إضافة مورد ${supp.name}`);
  };
  const updateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    logAction('update', 'شاشة الموردين', `تعديل مورد ${id}`);
  };
  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    logAction('delete', 'شاشة الموردين', `حذف مورد ${id}`);
    return true;
  };

  // Cash & Banks
  const addCashBank = (cb: CashBank) => {
    setCashBanks(prev => [...prev, cb]);
    logAction('create', 'شاشة الخزائن والبنوك', `إضافة حساب/خزينة ${cb.name}`);
  };
  const updateCashBank = (id: string, updated: Partial<CashBank>) => {
    setCashBanks(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    logAction('update', 'شاشة الخزائن والبنوك', `تعديل ${id}`);
  };
  const deleteCashBank = (id: string) => {
    setCashBanks(prev => prev.filter(c => c.id !== id));
    logAction('delete', 'شاشة الخزائن والبنوك', `حذف ${id}`);
    return true;
  };

  // Sales Invoices
  const addSalesInvoice = (invoice: SalesInvoice) => {
    // 1. Deduct stock from warehouse
    setItems(prevItems => {
      return prevItems.map(item => {
        const line = invoice.items.find(i => i.itemId === item.id);
        if (line) {
          return { ...item, currentStock: item.currentStock - line.quantity };
        }
        return item;
      });
    });

    // 2. Update Customer balance
    setCustomers(prevCust => {
      return prevCust.map(c => {
        if (c.id === invoice.customerId) {
          return { ...c, currentBalance: c.currentBalance + invoice.remainingAmount };
        }
        return c;
      });
    });

    // 3. Update Cash/Bank if payments exist
    if (invoice.payments && invoice.payments.length > 0) {
      setCashBanks(prevCb => {
        return prevCb.map(cb => {
          const sum = invoice.payments
            .filter(p => p.cashBankId === cb.id)
            .reduce((s, p) => s + p.amount, 0);
          if (sum > 0) {
            return { ...cb, currentBalance: cb.currentBalance + sum };
          }
          return cb;
        });
      });
    }

    // 4. Generate Auto Journal Entry
    const lines: any[] = [];
    if (invoice.paidAmount > 0) {
      lines.push({
        id: 'jel-1',
        accountCode: '1111',
        accountName: 'الخزينة والنقدية',
        debit: invoice.paidAmount,
        credit: 0,
        notes: `دفعة محصلة نقداً/بنك - فاتورة ${invoice.invoiceNo}`
      });
    }
    if (invoice.remainingAmount > 0) {
      lines.push({
        id: 'jel-2',
        accountCode: '1121',
        accountName: `العملاء - ${invoice.customerName}`,
        debit: invoice.remainingAmount,
        credit: 0,
        notes: `آجل مستحق - فاتورة ${invoice.invoiceNo}`
      });
    }
    if (invoice.withholdingTaxAmount > 0) {
      lines.push({
        id: 'jel-3',
        accountCode: '2122',
        accountName: 'مصلحة الضرائب - ضريبة الخصم 1%',
        debit: invoice.withholdingTaxAmount,
        credit: 0,
        notes: `إشعار خصم 1% - فاتورة ${invoice.invoiceNo}`
      });
    }
    // Sales Revenue Credit
    lines.push({
      id: 'jel-4',
      accountCode: '411',
      accountName: 'إيراد المبيعات التجارية',
      debit: 0,
      credit: invoice.subtotal - (invoice.invoiceDiscountAmount || 0),
      notes: `إيراد مبيعات فاتورة ${invoice.invoiceNo}`
    });
    // VAT Credit
    if (invoice.taxAmount > 0) {
      lines.push({
        id: 'jel-5',
        accountCode: '2121',
        accountName: 'مصلحة الضرائب - ضريبة القيمة المضافة 14%',
        debit: 0,
        credit: invoice.taxAmount,
        notes: `ضريبة ق.م فاتورة ${invoice.invoiceNo}`
      });
    }

    const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = lines.reduce((s, l) => s + l.credit, 0);

    const autoJE: JournalEntry = {
      id: 'je-sales-' + invoice.id,
      entryNo: `JV-SL-${invoice.invoiceNo}`,
      date: invoice.date,
      description: `قيد إثبات مبيعات فاتورة رقم ${invoice.invoiceNo} للعميل ${invoice.customerName}`,
      sourceType: 'sales',
      sourceDocNo: invoice.invoiceNo,
      lines,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.5,
      createdAt: invoice.date
    };

    setJournalEntries(prev => [autoJE, ...prev]);
    setSalesInvoices(prev => [invoice, ...prev]);
    logAction('create', 'فاتورة مبيعات', `إصدار فاتورة مبيعات رقم ${invoice.invoiceNo} بقيمة ${invoice.netTotal.toLocaleString('ar-EG')} ج.م للعميل ${invoice.customerName}`);
  };

  const updateSalesInvoice = (id: string, invoice: SalesInvoice) => {
    setSalesInvoices(prev => prev.map(inv => inv.id === id ? invoice : inv));
    logAction('update', 'فاتورة مبيعات', `تعديل فاتورة مبيعات رقم ${invoice.invoiceNo}`);
  };

  const deleteSalesInvoice = (id: string) => {
    const inv = salesInvoices.find(i => i.id === id);
    if (!inv) return;
    // Revert stock
    setItems(prevItems => {
      return prevItems.map(item => {
        const line = inv.items.find(i => i.itemId === item.id);
        if (line) {
          return { ...item, currentStock: item.currentStock + line.quantity };
        }
        return item;
      });
    });
    // Revert customer
    setCustomers(prevCust => {
      return prevCust.map(c => {
        if (c.id === inv.customerId) {
          return { ...c, currentBalance: Math.max(0, c.currentBalance - inv.remainingAmount) };
        }
        return c;
      });
    });
    // Revert journal entry
    setJournalEntries(prev => prev.filter(je => je.sourceDocNo !== inv.invoiceNo));
    setSalesInvoices(prev => prev.filter(i => i.id !== id));
    logAction('delete', 'فاتورة مبيعات', `حذف فاتورة مبيعات رقم ${inv.invoiceNo}`);
  };

  // Sales Returns
  const addSalesReturn = (ret: SalesReturn) => {
    // Add items back to warehouse
    setItems(prevItems => {
      return prevItems.map(item => {
        const line = ret.items.find(i => i.itemId === item.id);
        if (line) {
          return { ...item, currentStock: item.currentStock + line.quantity };
        }
        return item;
      });
    });
    // Reduce customer balance or cash
    setCustomers(prevCust => {
      return prevCust.map(c => {
        if (c.id === ret.customerId) {
          return { ...c, currentBalance: Math.max(0, c.currentBalance - (ret.netTotal - ret.paidAmount)) };
        }
        return c;
      });
    });
    setSalesReturns(prev => [ret, ...prev]);
    logAction('create', 'مردودات مبيعات', `تسجيل إشعار مردودات مبيعات رقم ${ret.returnNo}`);
  };

  const updateSalesReturn = (id: string, ret: SalesReturn) => {
    setSalesReturns(prev => prev.map(r => r.id === id ? ret : r));
    logAction('update', 'مردودات مبيعات', `تعديل مردودات مبيعات رقم ${ret.returnNo}`);
  };

  const deleteSalesReturn = (id: string) => {
    setSalesReturns(prev => prev.filter(r => r.id !== id));
    logAction('delete', 'مردودات مبيعات', `حذف مردودات مبيعات ${id}`);
  };

  // Purchase Invoices
  const addPurchaseInvoice = (invoice: PurchaseInvoice) => {
    // Increase stock
    setItems(prevItems => {
      return prevItems.map(item => {
        const line = invoice.items.find(i => i.itemId === item.id);
        if (line) {
          return { ...item, currentStock: item.currentStock + line.quantity };
        }
        return item;
      });
    });
    // Increase Supplier Balance
    setSuppliers(prevSupp => {
      return prevSupp.map(s => {
        if (s.id === invoice.supplierId) {
          return { ...s, currentBalance: s.currentBalance + invoice.remainingAmount };
        }
        return s;
      });
    });
    setPurchaseInvoices(prev => [invoice, ...prev]);
    logAction('create', 'فاتورة مشتريات', `إصدار فاتورة مشتريات رقم ${invoice.invoiceNo} من المورد ${invoice.supplierName}`);
  };

  const updatePurchaseInvoice = (id: string, invoice: PurchaseInvoice) => {
    setPurchaseInvoices(prev => prev.map(inv => inv.id === id ? invoice : inv));
    logAction('update', 'فاتورة مشتريات', `تعديل فاتورة مشتريات رقم ${invoice.invoiceNo}`);
  };

  const deletePurchaseInvoice = (id: string) => {
    setPurchaseInvoices(prev => prev.filter(inv => inv.id !== id));
    logAction('delete', 'فاتورة مشتريات', `حذف فاتورة مشتريات ${id}`);
  };

  const recordInvoicePayment = (
    type: 'sales' | 'purchase',
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentMethod: PaymentMethod;
      cashBankId: string;
      referenceNumber?: string;
      notes?: string;
    }
  ): { success: boolean; message: string } => {
    const payAmount = Number(paymentData.amount) || 0;
    if (payAmount <= 0) {
      return { success: false, message: 'مبلغ الدفعة يجب أن يكون أكبر من الصفر' };
    }
    const targetCashBank = cashBanks.find(cb => cb.id === paymentData.cashBankId);
    if (!targetCashBank) {
      return { success: false, message: 'يرجى اختيار الخزينة أو الحساب البنكي' };
    }

    const newPayment: InvoicePayment = {
      id: 'pay-' + Date.now(),
      amount: payAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod,
      cashBankId: targetCashBank.id,
      cashBankName: targetCashBank.name,
      referenceNo: paymentData.referenceNumber || '',
      notes: paymentData.notes || ''
    };

    if (type === 'sales') {
      const inv = salesInvoices.find(i => i.id === invoiceId || i.invoiceNo === invoiceId);
      if (!inv) return { success: false, message: 'لم يتم العثور على فاتورة المبيعات' };

      const updatedPayments = [...(inv.payments || []), newPayment];
      const newPaidTotal = updatedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const newRemaining = Math.max(0, inv.netTotal - newPaidTotal);

      const updatedInv: SalesInvoice = {
        ...inv,
        payments: updatedPayments,
        paidAmount: newPaidTotal,
        remainingAmount: newRemaining
      };

      setSalesInvoices(prev => prev.map(item => item.id === inv.id ? updatedInv : item));

      // Update customer balance (reduce debt)
      setCustomers(prev => prev.map(c => c.id === inv.customerId ? { ...c, currentBalance: Math.max(0, c.currentBalance - payAmount) } : c));

      // Update cashBank balance (increase cash received)
      setCashBanks(prev => prev.map(cb => cb.id === targetCashBank.id ? { ...cb, currentBalance: cb.currentBalance + payAmount } : cb));

      // Create Receipt Voucher
      const newVoucher: ReceiptVoucher = {
        id: 'rv-' + Date.now(),
        voucherNo: `RV-REC-${Date.now().toString().slice(-5)}`,
        date: newPayment.date,
        cashBankId: targetCashBank.id,
        cashBankName: targetCashBank.name,
        payType: (paymentData.paymentMethod === 'تحويل بنكي' ? 'تحويل بنكي' : 'نقدي'),
        customerId: inv.customerId,
        customerName: inv.customerName,
        accountCode: '1121',
        accountName: `العميل: ${inv.customerName}`,
        amount: payAmount,
        settledInvoices: [{ invoiceId: inv.id, invoiceNo: inv.invoiceNo, paidAmount: payAmount }],
        notes: `دفعة محصلة للفاتورة ${inv.invoiceNo} - ${paymentData.notes || ''}`,
        createdAt: new Date().toISOString()
      };
      setReceiptVouchers(prev => [newVoucher, ...prev]);

      logAction('update', 'سداد فاتورة مبيعات', `تسجيل دفعة بقيمة ${payAmount} ج.م للفاتورة ${inv.invoiceNo}`);
      return { success: true, message: `تم تسجيل الدفعة بقيمة ${payAmount} ج.م وسند القبض بنجاح` };
    } else {
      const inv = purchaseInvoices.find(i => i.id === invoiceId || i.invoiceNo === invoiceId);
      if (!inv) return { success: false, message: 'لم يتم العثور على فاتورة المشتريات' };

      const updatedPayments = [...(inv.payments || []), newPayment];
      const newPaidTotal = updatedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const newRemaining = Math.max(0, inv.netTotal - newPaidTotal);

      const updatedInv: PurchaseInvoice = {
        ...inv,
        payments: updatedPayments,
        paidAmount: newPaidTotal,
        remainingAmount: newRemaining
      };

      setPurchaseInvoices(prev => prev.map(item => item.id === inv.id ? updatedInv : item));

      // Update supplier balance (reduce payable debt)
      setSuppliers(prev => prev.map(s => s.id === inv.supplierId ? { ...s, currentBalance: Math.max(0, s.currentBalance - payAmount) } : s));

      // Update cashBank balance (reduce cash disbursed)
      setCashBanks(prev => prev.map(cb => cb.id === targetCashBank.id ? { ...cb, currentBalance: cb.currentBalance - payAmount } : cb));

      // Create Payment Voucher
      const newVoucher: PaymentVoucher = {
        id: 'pv-' + Date.now(),
        voucherNo: `PV-PAY-${Date.now().toString().slice(-5)}`,
        date: newPayment.date,
        cashBankId: targetCashBank.id,
        cashBankName: targetCashBank.name,
        payType: (paymentData.paymentMethod === 'تحويل بنكي' ? 'تحويل بنكي' : 'نقدي'),
        supplierId: inv.supplierId,
        supplierName: inv.supplierName,
        accountCode: '2111',
        accountName: `المورد: ${inv.supplierName}`,
        amount: payAmount,
        settledInvoices: [{ invoiceId: inv.id, invoiceNo: inv.invoiceNo, paidAmount: payAmount }],
        notes: `دفعة مسددة للفاتورة ${inv.invoiceNo} - ${paymentData.notes || ''}`,
        createdAt: new Date().toISOString()
      };
      setPaymentVouchers(prev => [newVoucher, ...prev]);

      logAction('update', 'سداد فاتورة مشتريات', `تسجيل دفعة بقيمة ${payAmount} ج.م للفاتورة ${inv.invoiceNo}`);
      return { success: true, message: `تم تسجيل الدفعة بقيمة ${payAmount} ج.م وسند الصرف بنجاح` };
    }
  };

  // Purchase Returns
  const addPurchaseReturn = (ret: PurchaseReturn) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        const line = ret.items.find(i => i.itemId === item.id);
        if (line) {
          return { ...item, currentStock: Math.max(0, item.currentStock - line.quantity) };
        }
        return item;
      });
    });
    setSuppliers(prevSupp => {
      return prevSupp.map(s => {
        if (s.id === ret.supplierId) {
          return { ...s, currentBalance: Math.max(0, s.currentBalance - ret.netTotal) };
        }
        return s;
      });
    });
    setPurchaseReturns(prev => [ret, ...prev]);
    logAction('create', 'مردودات مشتريات', `تسجيل مردودات مشتريات رقم ${ret.returnNo}`);
  };

  const updatePurchaseReturn = (id: string, ret: PurchaseReturn) => {
    setPurchaseReturns(prev => prev.map(r => r.id === id ? ret : r));
    logAction('update', 'مردودات مشتريات', `تعديل مردودات مشتريات ${ret.returnNo}`);
  };

  const deletePurchaseReturn = (id: string) => {
    setPurchaseReturns(prev => prev.filter(r => r.id !== id));
    logAction('delete', 'مردودات مشتريات', `حذف مردودات مشتريات ${id}`);
  };

  // Stock Adjustments
  const addStockAdjustment = (adj: StockAdjustment) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        const line = adj.items.find(i => i.itemId === item.id);
        if (line) {
          const delta = adj.type === 'إضافة' ? Math.abs(line.diffQuantity) : -Math.abs(line.diffQuantity);
          return { ...item, currentStock: item.currentStock + delta };
        }
        return item;
      });
    });
    setStockAdjustments(prev => [adj, ...prev]);
    logAction('create', 'تسويات جردية', `حفظ تسوية جردية رقم ${adj.docNo} - نوع: ${adj.type}`);
  };

  const updateStockAdjustment = (id: string, adj: StockAdjustment) => {
    setStockAdjustments(prev => prev.map(a => a.id === id ? adj : a));
    logAction('update', 'تسويات جردية', `تعديل تسوية جردية ${adj.docNo}`);
  };

  const deleteStockAdjustment = (id: string) => {
    setStockAdjustments(prev => prev.filter(a => a.id !== id));
    logAction('delete', 'تسويات جردية', `حذف تسوية جردية ${id}`);
  };

  // Warehouse Transfers
  const addWarehouseTransfer = (transfer: WarehouseTransfer) => {
    // Inventory is transferred
    setWarehouseTransfers(prev => [transfer, ...prev]);
    logAction('create', 'تحويل مخازن', `تحويل بضائع رقم ${transfer.transferNo} من ${transfer.fromWarehouseName} إلى ${transfer.toWarehouseName}`);
  };

  const updateWarehouseTransfer = (id: string, transfer: WarehouseTransfer) => {
    setWarehouseTransfers(prev => prev.map(t => t.id === id ? transfer : t));
    logAction('update', 'تحويل مخازن', `تعديل تحويل مخازن رقم ${transfer.transferNo}`);
  };

  const deleteWarehouseTransfer = (id: string) => {
    setWarehouseTransfers(prev => prev.filter(t => t.id !== id));
    logAction('delete', 'تحويل مخازن', `حذف تحويل مخازن ${id}`);
  };

  // Receipt Vouchers
  const addReceiptVoucher = (voucher: ReceiptVoucher) => {
    // Increase cash/bank
    setCashBanks(prev => {
      return prev.map(cb => {
        if (cb.id === voucher.cashBankId) {
          return { ...cb, currentBalance: cb.currentBalance + voucher.amount };
        }
        return cb;
      });
    });

    // If customer, decrease balance & update settled invoices
    if (voucher.customerId) {
      setCustomers(prev => {
        return prev.map(c => {
          if (c.id === voucher.customerId) {
            return { ...c, currentBalance: Math.max(0, c.currentBalance - voucher.amount) };
          }
          return c;
        });
      });

      if (voucher.settledInvoices && voucher.settledInvoices.length > 0) {
        setSalesInvoices(prev => {
          return prev.map(inv => {
            const match = voucher.settledInvoices?.find(s => s.invoiceId === inv.id);
            if (match) {
              const newPaid = inv.paidAmount + match.paidAmount;
              const newRem = Math.max(0, inv.netTotal - newPaid);
              return { ...inv, paidAmount: newPaid, remainingAmount: newRem };
            }
            return inv;
          });
        });
      }
    }

    // Auto Journal Entry
    const cb = cashBanks.find(c => c.id === voucher.cashBankId);
    const cbAcc = cb?.linkedAccountCode || '1111';
    const je: JournalEntry = {
      id: 'je-rec-' + voucher.id,
      entryNo: `JV-REC-${voucher.voucherNo}`,
      date: voucher.date,
      description: `سند قبض رقم ${voucher.voucherNo} من ${voucher.customerName || voucher.accountName} - ${voucher.payType}`,
      sourceType: 'receipt',
      sourceDocNo: voucher.voucherNo,
      lines: [
        {
          id: 'l-1',
          accountCode: cbAcc,
          accountName: voucher.cashBankName,
          debit: voucher.amount,
          credit: 0,
          notes: `إيداع نقدية/شيك/تحويل سند قبض ${voucher.voucherNo}`
        },
        {
          id: 'l-2',
          accountCode: voucher.accountCode || '1121',
          accountName: voucher.accountName,
          debit: 0,
          credit: voucher.amount,
          notes: `سداد من العميل/الحساب`
        }
      ],
      totalDebit: voucher.amount,
      totalCredit: voucher.amount,
      isBalanced: true,
      createdAt: voucher.date
    };

    setJournalEntries(prev => [je, ...prev]);
    setReceiptVouchers(prev => [voucher, ...prev]);
    logAction('create', 'سندات القبض', `تسجيل سند قبض رقم ${voucher.voucherNo} بمبلغ ${voucher.amount.toLocaleString('ar-EG')} ج.م`);
  };

  const updateReceiptVoucher = (id: string, voucher: ReceiptVoucher) => {
    setReceiptVouchers(prev => prev.map(v => v.id === id ? voucher : v));
    logAction('update', 'سندات القبض', `تعديل سند قبض رقم ${voucher.voucherNo}`);
  };

  const deleteReceiptVoucher = (id: string) => {
    setReceiptVouchers(prev => prev.filter(v => v.id !== id));
    logAction('delete', 'سندات القبض', `حذف سند قبض ${id}`);
  };

  // Payment Vouchers
  const addPaymentVoucher = (voucher: PaymentVoucher) => {
    // Decrease cash/bank
    setCashBanks(prev => {
      return prev.map(cb => {
        if (cb.id === voucher.cashBankId) {
          return { ...cb, currentBalance: cb.currentBalance - voucher.amount };
        }
        return cb;
      });
    });

    // If supplier, decrease supplier balance
    if (voucher.supplierId) {
      setSuppliers(prev => {
        return prev.map(s => {
          if (s.id === voucher.supplierId) {
            return { ...s, currentBalance: Math.max(0, s.currentBalance - voucher.amount) };
          }
          return s;
        });
      });
    }

    const cb = cashBanks.find(c => c.id === voucher.cashBankId);
    const cbAcc = cb?.linkedAccountCode || '1111';
    const je: JournalEntry = {
      id: 'je-pay-' + voucher.id,
      entryNo: `JV-PAY-${voucher.voucherNo}`,
      date: voucher.date,
      description: `سند صرف رقم ${voucher.voucherNo} إلى ${voucher.supplierName || voucher.accountName} - ${voucher.payType}`,
      sourceType: 'payment',
      sourceDocNo: voucher.voucherNo,
      lines: [
        {
          id: 'l-1',
          accountCode: voucher.accountCode || '2111',
          accountName: voucher.accountName,
          debit: voucher.amount,
          credit: 0,
          notes: `سداد للمورد/المصروف`
        },
        {
          id: 'l-2',
          accountCode: cbAcc,
          accountName: voucher.cashBankName,
          debit: 0,
          credit: voucher.amount,
          notes: `صرف من الخزينة/البنك سند صرف ${voucher.voucherNo}`
        }
      ],
      totalDebit: voucher.amount,
      totalCredit: voucher.amount,
      isBalanced: true,
      createdAt: voucher.date
    };

    setJournalEntries(prev => [je, ...prev]);
    setPaymentVouchers(prev => [voucher, ...prev]);
    logAction('create', 'سندات الصرف', `تسجيل سند صرف رقم ${voucher.voucherNo} بمبلغ ${voucher.amount.toLocaleString('ar-EG')} ج.م`);
  };

  const updatePaymentVoucher = (id: string, voucher: PaymentVoucher) => {
    setPaymentVouchers(prev => prev.map(v => v.id === id ? voucher : v));
    logAction('update', 'سندات الصرف', `تعديل سند صرف رقم ${voucher.voucherNo}`);
  };

  const deletePaymentVoucher = (id: string) => {
    setPaymentVouchers(prev => prev.filter(v => v.id !== id));
    logAction('delete', 'سندات الصرف', `حذف سند صرف ${id}`);
  };

  // Journal Entries
  const addJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
    logAction('create', 'قيود اليومية', `تسجيل قيد يومية رقم ${entry.entryNo} - ${entry.description}`);
  };

  const updateJournalEntry = (id: string, entry: JournalEntry) => {
    setJournalEntries(prev => prev.map(e => e.id === id ? entry : e));
    logAction('update', 'قيود اليومية', `تعديل قيد يومية رقم ${entry.entryNo}`);
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
    logAction('delete', 'قيود اليومية', `حذف قيد يومية ${id}`);
  };

  // Lookups
  const getAccountByCode = (code: string) => accounts.find(a => a.code === code);
  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getSupplierById = (id: string) => suppliers.find(s => s.id === id);
  const getItemById = (id: string) => items.find(i => i.id === id);
  const getWarehouseById = (id: string) => warehouses.find(w => w.id === id);
  const getEmployeeById = (id: string) => employees.find(e => e.id === id);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        currentUser,
        login,
        logout,
        canAccess,
        company,
        updateCompany,
        fiscalYears,
        currentFiscalYear,
        switchFiscalYear,
        closeCurrentYearAndOpenNew,
        isYearCloseModalOpen,
        setIsYearCloseModalOpen,
        openYearCloseModal,
        closeYearCloseModal,
        isResetModalOpen,
        setIsResetModalOpen,
        openResetModal,
        closeResetModal,
        resetAllTransactionsOnly,
        resetFactoryData,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        jobs,
        addJob,
        updateJob,
        deleteJob,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        users,
        addUser,
        updateUser,
        deleteUser,
        warehouses,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        items,
        addItem,
        updateItem,
        deleteItem,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        cashBanks,
        addCashBank,
        updateCashBank,
        deleteCashBank,
        selectedOperationTarget,
        setSelectedOperationTarget,
        recordInvoicePayment,
        salesInvoices,
        addSalesInvoice,
        updateSalesInvoice,
        deleteSalesInvoice,
        salesReturns,
        addSalesReturn,
        updateSalesReturn,
        deleteSalesReturn,
        purchaseInvoices,
        addPurchaseInvoice,
        updatePurchaseInvoice,
        deletePurchaseInvoice,
        purchaseReturns,
        addPurchaseReturn,
        updatePurchaseReturn,
        deletePurchaseReturn,
        stockAdjustments,
        addStockAdjustment,
        updateStockAdjustment,
        deleteStockAdjustment,
        warehouseTransfers,
        addWarehouseTransfer,
        updateWarehouseTransfer,
        deleteWarehouseTransfer,
        receiptVouchers,
        addReceiptVoucher,
        updateReceiptVoucher,
        deleteReceiptVoucher,
        paymentVouchers,
        addPaymentVoucher,
        updatePaymentVoucher,
        deletePaymentVoucher,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        auditLogs,
        logAction,
        getAccountByCode,
        getCustomerById,
        getSupplierById,
        getItemById,
        getWarehouseById,
        getEmployeeById
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
