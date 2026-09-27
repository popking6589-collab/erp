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
  JournalEntry,
  AuditLog,
  FiscalYear
} from '../types';

export const initialCompany: CompanyInfo = {
  name: 'شركة النور للتجارة والتوزيع ذ.م.م',
  logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=160&auto=format&fit=crop&q=80',
  address: 'مبنى النور الإداري - شارع التسعين الشمالي - التجمع الخامس - القاهرة',
  phone: '01001234567 / 0228123456',
  taxNumber: '482-910-332',
  commercialRegister: '109842',
  email: 'info@alnoor-trading.com',
  notes: 'الموزع المعتمد للأجهزة والأدوات والمواد الاستهلاكية في الشرق الأوسط'
};

export const initialAccounts: AccountNode[] = [
  // 1. الأصول
  { code: '1', nameAr: 'الأصول', nameEn: 'Assets', parentCode: null, category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 1, isParent: true, openingBalance: 1250000, linkedModule: 'general' },
  { code: '11', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', parentCode: '1', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 2, isParent: true, openingBalance: 850000, linkedModule: 'general' },
  { code: '111', nameAr: 'النقدية وما في حكمها', nameEn: 'Cash and Cash Equivalents', parentCode: '11', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 3, isParent: true, openingBalance: 320000, linkedModule: 'cash_bank' },
  { code: '1111', nameAr: 'الخزينة الرئيسية - المركز الرئيسي', nameEn: 'Main Cash Safe', parentCode: '111', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 120000, linkedModule: 'cash_bank' },
  { code: '1112', nameAr: 'البنك الأهلي المصري - جاري', nameEn: 'NBE Current Account', parentCode: '111', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 150000, linkedModule: 'cash_bank' },
  { code: '1113', nameAr: 'بنك مصر - جاري', nameEn: 'Banque Misr Account', parentCode: '111', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 50000, linkedModule: 'cash_bank' },
  { code: '1114', nameAr: 'شيكات تحت التحصيل', nameEn: 'Checks Under Collection', parentCode: '111', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 0, linkedModule: 'cash_bank' },

  { code: '112', nameAr: 'العملاء والمدينون', nameEn: 'Accounts Receivable', parentCode: '11', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 3, isParent: true, openingBalance: 280000, linkedModule: 'customers' },
  { code: '1121', nameAr: 'عملاء تجاريون - قطاع عام وخاص', nameEn: 'Trade Customers', parentCode: '112', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 280000, linkedModule: 'customers' },

  { code: '113', nameAr: 'المخزون السلعي', nameEn: 'Inventory', parentCode: '11', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 3, isParent: true, openingBalance: 250000, linkedModule: 'inventory' },
  { code: '1131', nameAr: 'مخزون بضاعة بغرض البيع', nameEn: 'Merchandise Inventory', parentCode: '113', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 250000, linkedModule: 'inventory' },

  { code: '12', nameAr: 'الأصول غير المتداولة (الثابتة)', nameEn: 'Fixed Assets', parentCode: '1', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 2, isParent: true, openingBalance: 400000, linkedModule: 'general' },
  { code: '121', nameAr: 'أثاث وتجهيزات مكتبية', nameEn: 'Furniture & Fixtures', parentCode: '12', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 3, isParent: false, openingBalance: 150000, linkedModule: 'general' },
  { code: '122', nameAr: 'أجهزة حاسب آلي وإلكترونيات', nameEn: 'Computers & Equipment', parentCode: '12', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 3, isParent: false, openingBalance: 120000, linkedModule: 'general' },
  { code: '123', nameAr: 'سيارات نقل وتوزيع', nameEn: 'Vehicles', parentCode: '12', category: 'asset', nature: 'debit', statement: 'balance_sheet', level: 3, isParent: false, openingBalance: 130000, linkedModule: 'general' },

  // 2. الخصوم والالتزامات
  { code: '2', nameAr: 'الالتزامات والخصوم', nameEn: 'Liabilities', parentCode: null, category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 1, isParent: true, openingBalance: 350000, linkedModule: 'general' },
  { code: '21', nameAr: 'الالتزامات المتداولة', nameEn: 'Current Liabilities', parentCode: '2', category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 2, isParent: true, openingBalance: 350000, linkedModule: 'general' },
  { code: '211', nameAr: 'الموردون والدائنون التجاريون', nameEn: 'Accounts Payable', parentCode: '21', category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 3, isParent: true, openingBalance: 310000, linkedModule: 'suppliers' },
  { code: '2111', nameAr: 'موردو بضائع محليين', nameEn: 'Local Merchandise Suppliers', parentCode: '211', category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 310000, linkedModule: 'suppliers' },

  { code: '212', nameAr: 'أرصدة دائنة أخرى والضرائب', nameEn: 'Taxes & Other Liabilities', parentCode: '21', category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 3, isParent: true, openingBalance: 40000, linkedModule: 'taxes' },
  { code: '2121', nameAr: 'مصلحة الضرائب - ضريبة القيمة المضافة 14%', nameEn: 'VAT Payable (14%)', parentCode: '212', category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 35000, linkedModule: 'taxes' },
  { code: '2122', nameAr: 'مصلحة الضرائب - ضريبة الخصم والإضافة 1%', nameEn: 'Withholding Tax 1%', parentCode: '212', category: 'liability', nature: 'credit', statement: 'balance_sheet', level: 4, isParent: false, openingBalance: 5000, linkedModule: 'taxes' },

  // 3. حقوق الملكية
  { code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', parentCode: null, category: 'equity', nature: 'credit', statement: 'balance_sheet', level: 1, isParent: true, openingBalance: 900000, linkedModule: 'general' },
  { code: '31', nameAr: 'رأس المال المدفوع', nameEn: 'Paid-in Capital', parentCode: '3', category: 'equity', nature: 'credit', statement: 'balance_sheet', level: 2, isParent: false, openingBalance: 800000, linkedModule: 'general' },
  { code: '32', nameAr: 'الأرباح المحتجزة / المبقاة', nameEn: 'Retained Earnings', parentCode: '3', category: 'equity', nature: 'credit', statement: 'balance_sheet', level: 2, isParent: false, openingBalance: 100000, linkedModule: 'general' },

  // 4. الإيرادات
  { code: '4', nameAr: 'الإيرادات', nameEn: 'Revenue', parentCode: null, category: 'revenue', nature: 'credit', statement: 'income_statement', level: 1, isParent: true, openingBalance: 0, linkedModule: 'sales' },
  { code: '41', nameAr: 'إيرادات المبيعات', nameEn: 'Sales Revenue', parentCode: '4', category: 'revenue', nature: 'credit', statement: 'income_statement', level: 2, isParent: true, openingBalance: 0, linkedModule: 'sales' },
  { code: '411', nameAr: 'مبيعات البضائع التجارية', nameEn: 'Commercial Sales', parentCode: '41', category: 'revenue', nature: 'credit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'sales' },
  { code: '412', nameAr: 'مردودات ومسموحات المبيعات (مدينة)', nameEn: 'Sales Returns & Allowances', parentCode: '41', category: 'revenue', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'sales' },
  { code: '413', nameAr: 'خصم مسموح به (مدين)', nameEn: 'Sales Discounts Allowed', parentCode: '41', category: 'revenue', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'sales' },

  // 5. المصروفات
  { code: '5', nameAr: 'المصروفات والتكاليف', nameEn: 'Expenses', parentCode: null, category: 'expense', nature: 'debit', statement: 'income_statement', level: 1, isParent: true, openingBalance: 0, linkedModule: 'expenses' },
  { code: '51', nameAr: 'تكلفة البضاعة المباعة', nameEn: 'Cost of Goods Sold (COGS)', parentCode: '5', category: 'expense', nature: 'debit', statement: 'income_statement', level: 2, isParent: true, openingBalance: 0, linkedModule: 'cogs' },
  { code: '511', nameAr: 'مشتريات بضائع بغرض البيع', nameEn: 'Merchandise Purchases', parentCode: '51', category: 'expense', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'purchases' },
  { code: '512', nameAr: 'مردودات ومسموحات المشتريات (دائنة)', nameEn: 'Purchase Returns', parentCode: '51', category: 'expense', nature: 'credit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'purchases' },
  { code: '513', nameAr: 'خصم مكتسب (دائن)', nameEn: 'Purchase Discounts Earned', parentCode: '51', category: 'expense', nature: 'credit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'purchases' },

  { code: '52', nameAr: 'المصروفات العمومية والإدارية', nameEn: 'General & Administrative Expenses', parentCode: '5', category: 'expense', nature: 'debit', statement: 'income_statement', level: 2, isParent: true, openingBalance: 0, linkedModule: 'expenses' },
  { code: '521', nameAr: 'مرتبات وأجور العاملين', nameEn: 'Salaries & Wages', parentCode: '52', category: 'expense', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'expenses' },
  { code: '522', nameAr: 'إيجار المقرات والمخازن', nameEn: 'Rent Expense', parentCode: '52', category: 'expense', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'expenses' },
  { code: '523', nameAr: 'كهرباء ومياه ومرافق', nameEn: 'Utilities Expense', parentCode: '52', category: 'expense', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'expenses' },
  { code: '524', nameAr: 'مصروفات انتقال وشحن وضيافة', nameEn: 'Travel & Freight', parentCode: '52', category: 'expense', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'expenses' },
  { code: '525', nameAr: 'أرباح / خسائر تسويات جردية', nameEn: 'Inventory Adjustment Loss/Gain', parentCode: '52', category: 'expense', nature: 'debit', statement: 'income_statement', level: 3, isParent: false, openingBalance: 0, linkedModule: 'expenses' },
];

export const initialJobs: JobTitle[] = [
  { id: 'job-1', code: 'J-001', title: 'المدير التنفيذي والعام', notes: 'الإشراف الكامل على كافة قطاعات الشركة' },
  { id: 'job-2', code: 'J-002', title: 'المدير المالي ورئيس الحسابات', notes: 'إدارة السجلات المالية والميزانيات' },
  { id: 'job-3', code: 'J-003', title: 'محاسب مالي ومبيعات', notes: 'تسجيل الفواتير والقيود اليومية' },
  { id: 'job-4', code: 'J-004', title: 'مندوب مبيعات خارجي', notes: 'متابعة العملاء والتحصيل الميداني' },
  { id: 'job-5', code: 'J-005', title: 'مسؤول وأمين مخزن', notes: 'إدارة حركة البضائع والصادر والوارد' },
  { id: 'job-6', code: 'J-006', title: 'مسؤول المشتريات والتوريدات', notes: 'التنسيق مع كبار الموردين' },
];

export const initialDepartments: Department[] = [
  { id: 'dept-1', code: 'D-01', name: 'الإدارة العليا والتخطيط', notes: 'القرارات الاستراتيجية' },
  { id: 'dept-2', code: 'D-02', name: 'الإدارة المالية والحسابات', notes: 'التقارير المالية والتدقيق' },
  { id: 'dept-3', code: 'D-03', name: 'إدارة المبيعات والتسويق', notes: 'المبيعات وتوزيع المنتجات' },
  { id: 'dept-4', code: 'D-04', name: 'إدارة المشتريات واللوجستيات', notes: 'توريد البضائع والمفاوضات' },
  { id: 'dept-5', code: 'D-05', name: 'إدارة المخازن والمستودعات', notes: 'التخزين والتسليم' },
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    code: 'EMP-101',
    name: 'أحمد محمود السعيد',
    jobId: 'job-1',
    jobTitle: 'المدير التنفيذي والعام',
    departmentId: 'dept-1',
    departmentName: 'الإدارة العليا والتخطيط',
    salary: 35000,
    birthDate: '1982-05-14',
    nationalId: '28205140102345',
    address: 'مدينة نصر - الحي السابع - القاهرة',
    qualification: 'بكالوريوس إدارة أعمال وماجستير MBA',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '01011122334',
    hireDate: '2018-01-01'
  },
  {
    id: 'emp-2',
    code: 'EMP-102',
    name: 'محمود عبد الرحمن فهمي',
    jobId: 'job-2',
    jobTitle: 'المدير المالي ورئيس الحسابات',
    departmentId: 'dept-2',
    departmentName: 'الإدارة المالية والحسابات',
    salary: 22000,
    birthDate: '1986-11-20',
    nationalId: '28611200109988',
    address: 'المعادي الجديدة - دجلة - القاهرة',
    qualification: 'بكالوريوس تجارة شعبة محاسبة - جامعة القاهرة',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '01122334455',
    hireDate: '2019-03-15'
  },
  {
    id: 'emp-3',
    code: 'EMP-103',
    name: 'طارق حسام الدين',
    jobId: 'job-4',
    jobTitle: 'مندوب مبيعات خارجي',
    departmentId: 'dept-3',
    departmentName: 'إدارة المبيعات والتسويق',
    salary: 9500,
    birthDate: '1993-08-12',
    nationalId: '29308120104433',
    address: 'الدقي - شارع مصدق - الجيزة',
    qualification: 'ليسانس حقوق',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    phone: '01233445566',
    hireDate: '2021-06-01'
  },
  {
    id: 'emp-4',
    code: 'EMP-104',
    name: 'كريم وائل المنصوري',
    jobId: 'job-4',
    jobTitle: 'مندوب مبيعات خارجي',
    departmentId: 'dept-3',
    departmentName: 'إدارة المبيعات والتسويق',
    salary: 9200,
    birthDate: '1995-02-18',
    nationalId: '29502180108877',
    address: 'سموحة - الإسكندرية',
    qualification: 'بكالوريوس نظم معلومات إدارية',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    phone: '01099887766',
    hireDate: '2022-02-10'
  },
  {
    id: 'emp-5',
    code: 'EMP-105',
    name: 'سعيد إبراهيم الشناوي',
    jobId: 'job-5',
    jobTitle: 'مسؤول وأمين مخزن',
    departmentId: 'dept-5',
    departmentName: 'إدارة المخازن والمستودعات',
    salary: 8000,
    birthDate: '1990-09-05',
    nationalId: '29009050106655',
    address: 'العبور - الحي الثاني - القليوبية',
    qualification: 'دبلوم فني تجاري صناعي',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    phone: '01555667788',
    hireDate: '2020-09-01'
  },
  {
    id: 'emp-6',
    code: 'EMP-106',
    name: 'ياسر محمد رضوان',
    jobId: 'job-5',
    jobTitle: 'مسؤول وأمين مخزن',
    departmentId: 'dept-5',
    departmentName: 'إدارة المخازن والمستودعات',
    salary: 7800,
    birthDate: '1992-04-10',
    nationalId: '29204100101122',
    address: 'المنطقة الصناعية - برج العرب - الإسكندرية',
    qualification: 'معهد فني تجاري',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    phone: '01144556677',
    hireDate: '2021-11-15'
  }
];

const allScreenIds = [
  'dashboard', 'system_admin', 'operations_hub', 'company', 'users', 'accounts', 'jobs', 'departments',
  'employees', 'warehouses', 'items', 'customers', 'suppliers',
  'sales_invoice', 'sales_return', 'purchase_invoice', 'purchase_return',
  'stock_adjustments', 'warehouse_transfer', 'cash_bank', 'receipt_voucher',
  'payment_voucher', 'journal_entries', 'reports'
] as const;

export const createFullPermissions = () => {
  const perms: Record<string, { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean; canPrint: boolean }> = {};
  allScreenIds.forEach(id => {
    perms[id] = { canView: true, canAdd: true, canEdit: true, canDelete: true, canPrint: true };
  });
  return perms as any;
};

export const initialUsers: AppUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: '123',
    employeeId: 'emp-1',
    employeeName: 'أحمد محمود السعيد',
    isActive: true,
    isAdmin: true,
    permissions: createFullPermissions(),
    createdAt: '2026-01-01'
  },
  {
    id: 'user-accountant',
    username: 'accountant',
    password: '123',
    employeeId: 'emp-2',
    employeeName: 'محمود عبد الرحمن فهمي',
    isActive: true,
    isAdmin: false,
    permissions: createFullPermissions(),
    createdAt: '2026-01-05'
  }
];

export const initialWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-01',
    name: 'المستودع الرئيسي - المنطقة الصناعية بالتجمع',
    address: 'القطعة 42 المنطقة الصناعية - التجمع الثالث - القاهرة الجديدة',
    managerEmployeeId: 'emp-5',
    managerName: 'سعيد إبراهيم الشناوي',
    phone: '01555667788'
  },
  {
    id: 'wh-2',
    code: 'WH-02',
    name: 'مستودع فرع الإسكندرية والوجه البحري',
    address: 'المنطقة الصناعية الرابعة - برج العرب الجديدة - الإسكندرية',
    managerEmployeeId: 'emp-6',
    managerName: 'ياسر محمد رضوان',
    phone: '01144556677'
  }
];

export const initialItems: Item[] = [
  {
    id: 'item-1',
    code: 'ITM-001',
    name: 'شاشة حاسب آلي 27 بوصة IPS 4K Ultra HD',
    purchasePrice: 4200,
    sellingPrice: 5600,
    unit: 'قطعة',
    minQuantity: 5,
    openingStock: 45,
    currentStock: 45,
    category: 'شاشات وإلكترونيات',
    barcode: '62210001001'
  },
  {
    id: 'item-2',
    code: 'ITM-002',
    name: 'طابعة ليزر متعددة الوظائف واي فاي دقيقة',
    purchasePrice: 6500,
    sellingPrice: 8400,
    unit: 'جهاز',
    minQuantity: 3,
    openingStock: 25,
    currentStock: 25,
    category: 'طابعات وتصوير',
    barcode: '62210001002'
  },
  {
    id: 'item-3',
    code: 'ITM-003',
    name: 'حبارة ليزر سوداء أصلية عالية الكثافة',
    purchasePrice: 450,
    sellingPrice: 700,
    unit: 'قطعة',
    minQuantity: 15,
    openingStock: 120,
    currentStock: 120,
    category: 'أحبار واستهلاكيات',
    barcode: '62210001003'
  },
  {
    id: 'item-4',
    code: 'ITM-004',
    name: 'وحدة تخزين سريعة SSD 1TB NVMe High Speed',
    purchasePrice: 1600,
    sellingPrice: 2250,
    unit: 'قطعة',
    minQuantity: 10,
    openingStock: 80,
    currentStock: 80,
    category: 'وحدات تخزين',
    barcode: '62210001004'
  },
  {
    id: 'item-5',
    code: 'ITM-005',
    name: 'لوحة مفاتيح وماوس لاسلكي احترافي للأعمال',
    purchasePrice: 380,
    sellingPrice: 590,
    unit: 'طقم',
    minQuantity: 20,
    openingStock: 150,
    currentStock: 150,
    category: 'إكسسوارات',
    barcode: '62210001005'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-001',
    name: 'مجموعة الأهرام للحلول التكنولوجية',
    phone: '01020304050',
    governorate: 'القاهرة',
    address: 'شارع مصطفى النحاس - مدينة نصر',
    salesRepEmployeeId: 'emp-3',
    salesRepName: 'طارق حسام الدين',
    openingBalance: 45000,
    currentBalance: 45000,
    linkedAccountCode: '1121',
    notes: 'عميل مميز - سداد شهري منتظم'
  },
  {
    id: 'cust-2',
    code: 'CUST-002',
    name: 'شركة النيل للأنظمة الهندسية المتطورة',
    phone: '01223344556',
    governorate: 'الجيزة',
    address: 'ميدان المساحة - الدقي',
    salesRepEmployeeId: 'emp-3',
    salesRepName: 'طارق حسام الدين',
    openingBalance: 32000,
    currentBalance: 32000,
    linkedAccountCode: '1121',
    notes: 'ائتمان 30 يوماً'
  },
  {
    id: 'cust-3',
    code: 'CUST-003',
    name: 'مؤسسة الدلتا للتجارة والتوريدات الفنية',
    phone: '01112233889',
    governorate: 'الإسكندرية',
    address: 'طريق الجيش - سيدي بشر',
    salesRepEmployeeId: 'emp-4',
    salesRepName: 'كريم وائل المنصوري',
    openingBalance: 68000,
    currentBalance: 68000,
    linkedAccountCode: '1121',
    notes: 'توزيع في نطاق الساحل والبحيرة'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'supp-1',
    code: 'SUP-001',
    name: 'شركة العالمية للاستيراد وتجارة التكنولوجيا',
    phone: '01005544332',
    governorate: 'القاهرة',
    address: 'المنطقة الحرة بمدينة نصر',
    salesRepEmployeeId: 'emp-3',
    salesRepName: 'طارق حسام الدين',
    openingBalance: 120000,
    currentBalance: 120000,
    linkedAccountCode: '2111',
    notes: 'مورد معتمد للشاشات ومعدات الحاسب'
  },
  {
    id: 'supp-2',
    code: 'SUP-002',
    name: 'المتحدة للأجهزة والحلول المكتبية',
    phone: '01229988776',
    governorate: 'الجيزة',
    address: 'شارع الهرم الرئيسي',
    salesRepEmployeeId: 'emp-4',
    salesRepName: 'كريم وائل المنصوري',
    openingBalance: 85000,
    currentBalance: 85000,
    linkedAccountCode: '2111',
    notes: 'مورد الطابعات والأحبار الأصلية'
  }
];

export const initialCashBanks: CashBank[] = [
  {
    id: 'cb-1',
    code: 'CB-01',
    name: 'الخزينة الرئيسية - مبنى الإدارة',
    type: 'خزينة نقدية',
    openingBalance: 120000,
    currentBalance: 120000,
    linkedAccountCode: '1111',
    notes: 'عهدة مدير الخزينة اليومية'
  },
  {
    id: 'cb-2',
    code: 'CB-02',
    name: 'البنك الأهلي المصري - حساب الشركات جاري',
    type: 'حساب بنكي',
    accountNumber: '1098234710001',
    bankBranch: 'فرع شارع التسعين - التجمع',
    openingBalance: 150000,
    currentBalance: 150000,
    linkedAccountCode: '1112',
    notes: 'الحساب الرئيسي للتحويلات وسداد الموردين'
  },
  {
    id: 'cb-3',
    code: 'CB-03',
    name: 'بنك مصر - حساب العمليات',
    type: 'حساب بنكي',
    accountNumber: '4029184510002',
    bankBranch: 'فرع المعادي الجديدة',
    openingBalance: 50000,
    currentBalance: 50000,
    linkedAccountCode: '1113',
    notes: 'حساب مخصص للشيكات والتحصيلات الإلكترونية'
  }
];

export const initialFiscalYears: FiscalYear[] = [
  {
    id: 'fy-2026',
    year: 2026,
    name: 'السنة المالية 2026 (الحالية)',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isClosed: false
  },
  {
    id: 'fy-2025',
    year: 2025,
    name: 'السنة المالية 2025 (مقفلة)',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isClosed: true,
    closedAt: '2025-12-31'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'je-init-1',
    entryNo: 'JV-2026-0001',
    date: '2026-01-01',
    description: 'قيد إثبات الأرصدة الافتتاحية للميزانية العمومية للعام المالي 2026',
    sourceType: 'year_close',
    sourceDocNo: 'OPENING-2026',
    lines: [
      { id: 'l-1', accountCode: '1111', accountName: 'الخزينة الرئيسية - المركز الرئيسي', debit: 120000, credit: 0, notes: 'رصيد افتتاحي نقدية' },
      { id: 'l-2', accountCode: '1112', accountName: 'البنك الأهلي المصري - جاري', debit: 150000, credit: 0, notes: 'رصيد افتتاحي بنكي' },
      { id: 'l-3', accountCode: '1113', accountName: 'بنك مصر - جاري', debit: 50000, credit: 0, notes: 'رصيد افتتاحي بنكي' },
      { id: 'l-4', accountCode: '1121', accountName: 'عملاء تجاريون - قطاع عام وخاص', debit: 280000, credit: 0, notes: 'أرصدة مدينين افتتاحية' },
      { id: 'l-5', accountCode: '1131', accountName: 'مخزون بضاعة بغرض البيع', debit: 250000, credit: 0, notes: 'مخزون بضاعة أول المدة' },
      { id: 'l-6', accountCode: '121', accountName: 'أثاث وتجهيزات مكتبية', debit: 150000, credit: 0, notes: 'أصول ثابتة' },
      { id: 'l-7', accountCode: '122', accountName: 'أجهزة حاسب آلي وإلكترونيات', debit: 120000, credit: 0, notes: 'أصول ثابتة' },
      { id: 'l-8', accountCode: '123', accountName: 'سيارات نقل وتوزيع', debit: 130000, credit: 0, notes: 'أصول ثابتة' },
      { id: 'l-9', accountCode: '2111', accountName: 'موردو بضائع محليين', debit: 0, credit: 310000, notes: 'أرصدة موردين افتتاحية' },
      { id: 'l-10', accountCode: '2121', accountName: 'مصلحة الضرائب - ضريبة القيمة المضافة 14%', debit: 0, credit: 35000, notes: 'أمانات ضرائب' },
      { id: 'l-11', accountCode: '2122', accountName: 'مصلحة الضرائب - ضريبة الخصم والإضافة 1%', debit: 0, credit: 5000, notes: 'أمانات ضرائب' },
      { id: 'l-12', accountCode: '31', accountName: 'رأس المال المدفوع', debit: 0, credit: 800000, notes: 'رأس مال الشركاء' },
      { id: 'l-13', accountCode: '32', accountName: 'الأرباح المحتجزة / المبقاة', debit: 0, credit: 100000, notes: 'أرباح سنوات سابقة' },
    ],
    totalDebit: 1250000,
    totalCredit: 1250000,
    isBalanced: true,
    createdAt: '2026-01-01'
  }
];

export const initialSalesInvoices: SalesInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2026-0001',
    date: '2026-02-15',
    dueDate: '2026-03-15',
    paymentTermsDays: 30,
    warehouseId: 'wh-1',
    warehouseName: 'المستودع الرئيسي - المنطقة الصناعية بالتجمع',
    customerId: 'cust-1',
    customerName: 'مجموعة الأهرام للحلول التكنولوجية',
    salesRepEmployeeId: 'emp-3',
    salesRepName: 'طارق حسام الدين',
    items: [
      {
        id: 'ii-1',
        itemId: 'item-1',
        itemCode: 'ITM-001',
        itemName: 'شاشة حاسب آلي 27 بوصة IPS 4K Ultra HD',
        quantity: 2,
        unitPrice: 5600,
        total: 11200,
        discountPercent: 0,
        discountAmount: 0,
        net: 11200
      },
      {
        id: 'ii-2',
        itemId: 'item-4',
        itemCode: 'ITM-004',
        itemName: 'وحدة تخزين سريعة SSD 1TB NVMe High Speed',
        quantity: 5,
        unitPrice: 2250,
        total: 11250,
        discountPercent: 0,
        discountAmount: 0,
        net: 11250
      }
    ],
    subtotal: 22450,
    invoiceDiscountPercent: 0,
    invoiceDiscountAmount: 0,
    taxPercent: 14,
    taxAmount: 3143,
    withholdingTaxPercent: 1,
    withholdingTaxAmount: 224.5,
    netTotal: 25368.5,
    paymentMethod: 'نقدي',
    payments: [
      {
        id: 'pay-1',
        paymentMethod: 'نقدي',
        cashBankId: 'cb-1',
        cashBankName: 'الخزينة الرئيسية - مبنى الإدارة',
        amount: 15000,
        referenceNo: 'REC-101',
        date: '2026-02-15',
        notes: 'دفعة نقدية مسددة مع الفاتورة'
      }
    ],
    paidAmount: 15000,
    remainingAmount: 10368.5,
    notes: 'تم التسليم من المستودع الرئيسي والتوقيع بالاستلام',
    createdAt: '2026-02-15'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-01-01 09:00:00',
    userId: 'user-admin',
    userName: 'أحمد محمود السعيد (admin)',
    action: 'create',
    screen: 'النظام المحاسبي',
    details: 'تهيئة الدليل المحاسبي وبدء السنة المالية 2026'
  },
  {
    id: 'log-2',
    timestamp: '2026-02-15 11:30:00',
    userId: 'user-admin',
    userName: 'أحمد محمود السعيد (admin)',
    action: 'create',
    screen: 'فاتورة مبيعات',
    details: 'إصدار فاتورة مبيعات رقم INV-2026-0001 للعميل مجموعة الأهرام'
  }
];
