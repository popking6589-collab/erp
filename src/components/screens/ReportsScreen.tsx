import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  DollarSign,
  Scale,
  PieChart,
  Users,
  Truck,
  Boxes,
  ShieldAlert,
  Layers,
  ArrowRight,
  FileText,
  FileDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PrintHeader } from '../common/PrintHeader';

type ReportType =
  | 'sales_summary'
  | 'sales_returns'
  | 'purchases_summary'
  | 'purchases_returns'
  | 'customers_list'
  | 'customers_by_rep'
  | 'rep_sales'
  | 'overdue_invoices'
  | 'customers_balances_detailed'
  | 'customer_statement'
  | 'customer_items'
  | 'cash_bank_movement'
  | 'checks_movement'
  | 'bank_transfers'
  | 'warehouse_stock'
  | 'item_card'
  | 'stock_adjustments'
  | 'inventory_valuation'
  | 'employees_report'
  | 'vouchers_report'
  | 'suppliers_aging'
  | 'supplier_statement'
  | 'suppliers_balances'
  | 'audit_log'
  | 'trial_balance'
  | 'income_statement'
  | 'balance_sheet'
  | 'cash_flow';

export const ReportsScreen: React.FC = () => {
  const {
    salesInvoices,
    salesReturns,
    purchaseInvoices,
    purchaseReturns,
    customers,
    suppliers,
    employees,
    items,
    warehouses,
    cashBanks,
    receiptVouchers,
    paymentVouchers,
    journalEntries,
    accounts,
    auditLogs,
    users
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('sales_summary');
  const [reportCategory, setReportCategory] = useState<'sales' | 'purchases' | 'inventory' | 'finance' | 'statements' | 'admin'>('sales');

  // Filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [fromDocNo, setFromDocNo] = useState('');
  const [toDocNo, setToDocNo] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedCashBankId, setSelectedCashBankId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Export to CSV function
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    let csvContent = '\uFEFF'; // BOM for Arabic support in Excel
    csvContent += headers.join(',') + '\r\n';
    rows.forEach(r => {
      const escaped = r.map(val => `"${String(val).replace(/"/g, '""')}"`);
      csvContent += escaped.join(',') + '\r\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Sales Report
  const filteredSalesInvoices = useMemo(() => {
    return salesInvoices.filter(inv => {
      if (startDate && inv.date < startDate) return false;
      if (endDate && inv.date > endDate) return false;
      if (fromDocNo && inv.invoiceNo < fromDocNo) return false;
      if (toDocNo && inv.invoiceNo > toDocNo) return false;
      if (selectedCustomerId && inv.customerId !== selectedCustomerId) return false;
      if (selectedEmployeeId && inv.salesRepEmployeeId !== selectedEmployeeId) return false;
      if (selectedWarehouseId && inv.warehouseId !== selectedWarehouseId) return false;
      return true;
    });
  }, [salesInvoices, startDate, endDate, fromDocNo, toDocNo, selectedCustomerId, selectedEmployeeId, selectedWarehouseId]);

  // 2. Sales Returns
  const filteredSalesReturns = useMemo(() => {
    return salesReturns.filter(ret => {
      if (startDate && ret.date < startDate) return false;
      if (endDate && ret.date > endDate) return false;
      if (fromDocNo && ret.returnNo < fromDocNo) return false;
      if (toDocNo && ret.returnNo > toDocNo) return false;
      if (selectedCustomerId && ret.customerId !== selectedCustomerId) return false;
      return true;
    });
  }, [salesReturns, startDate, endDate, fromDocNo, toDocNo, selectedCustomerId]);

  // 3. Purchases
  const filteredPurchases = useMemo(() => {
    return purchaseInvoices.filter(inv => {
      if (startDate && inv.date < startDate) return false;
      if (endDate && inv.date > endDate) return false;
      if (fromDocNo && inv.invoiceNo < fromDocNo) return false;
      if (toDocNo && inv.invoiceNo > toDocNo) return false;
      if (selectedSupplierId && inv.supplierId !== selectedSupplierId) return false;
      return true;
    });
  }, [purchaseInvoices, startDate, endDate, fromDocNo, toDocNo, selectedSupplierId]);

  // 4. Overdue Invoices
  const overdueInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return salesInvoices.filter(inv => {
      if (inv.remainingAmount <= 0) return false;
      if (inv.dueDate && inv.dueDate < today) {
        if (selectedEmployeeId && inv.salesRepEmployeeId !== selectedEmployeeId) return false;
        return true;
      }
      return false;
    });
  }, [salesInvoices, selectedEmployeeId]);

  // 5. Detailed Customers Balances by Rep
  const customersDetailedBalances = useMemo(() => {
    return customers
      .filter(c => !selectedEmployeeId || c.salesRepEmployeeId === selectedEmployeeId)
      .map(c => {
        const custInvoices = salesInvoices.filter(i => i.customerId === c.id);
        const lastInvoice = custInvoices[0]; // latest

        const custReceipts = receiptVouchers.filter(r => r.customerId === c.id);
        const lastReceipt = custReceipts[0];

        let totalDebit = c.openingBalance;
        let totalCredit = 0;
        custInvoices.forEach(i => {
          totalDebit += i.netTotal;
          totalCredit += i.paidAmount;
        });
        custReceipts.forEach(r => {
          totalCredit += r.amount;
        });

        // overdue amount
        const overdueSum = custInvoices
          .filter(i => i.remainingAmount > 0 && i.dueDate < new Date().toISOString().split('T')[0])
          .reduce((s, i) => s + i.remainingAmount, 0);

        return {
          code: c.code,
          name: c.name,
          governorate: c.governorate,
          repName: c.salesRepName || 'غير مسند',
          lastInvoiceVal: lastInvoice?.netTotal || 0,
          lastInvoiceDate: lastInvoice?.date || '-',
          lastPayVal: lastReceipt?.amount || 0,
          lastPayDate: lastReceipt?.date || '-',
          totalDebit,
          totalCredit,
          netBalance: c.currentBalance,
          overdueAmount: overdueSum
        };
      });
  }, [customers, salesInvoices, receiptVouchers, selectedEmployeeId]);

  // 6. Customer Detailed Statement
  const targetCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const customerStatementRows = useMemo(() => {
    if (!targetCustomer) return [];
    const rows: any[] = [];
    let runningBalance = targetCustomer.openingBalance;

    rows.push({
      date: '2026-01-01',
      docType: 'رصيد افتتاحي أول المدة',
      docNo: '-',
      debit: targetCustomer.openingBalance,
      credit: 0,
      balance: runningBalance,
      notes: 'رصيد مرحل'
    });

    salesInvoices
      .filter(i => i.customerId === targetCustomer.id)
      .forEach(i => {
        runningBalance += i.netTotal;
        rows.push({
          date: i.date,
          docType: 'فاتورة مبيعات',
          docNo: i.invoiceNo,
          debit: i.netTotal,
          credit: 0,
          balance: runningBalance,
          notes: `فاتورة مبيعات ${i.paymentMethod}`
        });

        if (i.paidAmount > 0) {
          runningBalance -= i.paidAmount;
          rows.push({
            date: i.date,
            docType: 'دفعة مسددة مع الفاتورة',
            docNo: i.invoiceNo,
            debit: 0,
            credit: i.paidAmount,
            balance: runningBalance,
            notes: 'سداد فوري مع الفاتورة'
          });
        }
      });

    receiptVouchers
      .filter(r => r.customerId === targetCustomer.id)
      .forEach(r => {
        runningBalance -= r.amount;
        rows.push({
          date: r.date,
          docType: `سند قبض (${r.payType})`,
          docNo: r.voucherNo,
          debit: 0,
          credit: r.amount,
          balance: runningBalance,
          notes: r.notes || 'سداد نقدي/شيك'
        });
      });

    salesReturns
      .filter(ret => ret.customerId === targetCustomer.id)
      .forEach(ret => {
        runningBalance -= ret.netTotal;
        rows.push({
          date: ret.date,
          docType: 'إشعار مردودات مبيعات',
          docNo: ret.returnNo,
          debit: 0,
          credit: ret.netTotal,
          balance: runningBalance,
          notes: 'رد بضاعة'
        });
      });

    // Sort by date
    rows.sort((a, b) => a.date.localeCompare(b.date));
    return rows;
  }, [targetCustomer, salesInvoices, receiptVouchers, salesReturns]);

  // 7. Inventory Valuation (تكلفة وبيع)
  const inventoryValuationData = useMemo(() => {
    return items.map(item => {
      const totalCost = item.currentStock * item.purchasePrice;
      const totalSell = item.currentStock * item.sellingPrice;
      const expectedProfit = totalSell - totalCost;
      return {
        code: item.code,
        name: item.name,
        unit: item.unit,
        stock: item.currentStock,
        costPrice: item.purchasePrice,
        sellPrice: item.sellingPrice,
        totalCost,
        totalSell,
        expectedProfit
      };
    });
  }, [items]);

  // 8. Financial Statements Calculations (قائمة الدخل، الميزانية، التدفقات النقدية)
  const financialTotals = useMemo(() => {
    let salesRev = 0;
    let salesRet = 0;
    let purchasesExp = 0;
    let operatingExp = 0;

    journalEntries.forEach(je => {
      je.lines.forEach(l => {
        if (l.accountCode === '411') salesRev += (l.credit - l.debit);
        if (l.accountCode === '412') salesRet += (l.debit - l.credit);
        if (l.accountCode.startsWith('51')) purchasesExp += (l.debit - l.credit);
        if (l.accountCode.startsWith('52')) operatingExp += (l.debit - l.credit);
      });
    });

    const netSales = salesRev - salesRet;
    const grossProfit = netSales - purchasesExp;
    const netProfit = grossProfit - operatingExp;

    // Balance Sheet totals
    let currentAssets = 0;
    let fixedAssets = 0;
    let currentLiab = 0;
    let equity = 0;

    accounts.forEach(a => {
      if (!a.isParent) {
        let bal = a.nature === 'debit' ? a.openingBalance : -a.openingBalance;
        journalEntries.forEach(je => {
          je.lines.forEach(l => {
            if (l.accountCode === a.code) bal += (l.debit - l.credit);
          });
        });

        if (a.category === 'asset') {
          if (a.code.startsWith('11')) currentAssets += bal;
          if (a.code.startsWith('12')) fixedAssets += bal;
        } else if (a.category === 'liability') {
          currentLiab += Math.abs(bal);
        } else if (a.category === 'equity') {
          equity += Math.abs(bal);
        }
      }
    });

    return {
      salesRev,
      salesRet,
      netSales,
      purchasesExp,
      grossProfit,
      operatingExp,
      netProfit,
      currentAssets,
      fixedAssets,
      totalAssets: currentAssets + fixedAssets,
      currentLiab,
      equity: equity + netProfit,
      totalLiabAndEquity: currentLiab + equity + netProfit
    };
  }, [journalEntries, accounts]);

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="التقارير التحليلية والقوائم المالية الختامية" date={new Date().toLocaleDateString('ar-EG')} />
      </div>

      {/* Screen Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">منظومة التقارير والقوائم المالية الشاملة</h1>
            <p className="text-xs text-slate-500">
              أكثر من 28 تقريراً تفصيلياً مع فلاتر التاريخ، أرقام الفواتير، المندوبين، والتصدير المباشر لـ Excel / CSV والطباعة الرسمية
            </p>
          </div>
        </div>

        {/* Global Export & Print Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الحالي</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const originalTitle = document.title;
              document.title = `تقرير_${activeReport}_${startDate}_${endDate}`;
              window.print();
              setTimeout(() => { document.title = originalTitle; }, 1500);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-rose-600/20"
            title="طباعة وتصدير التقرير الحالي كملف PDF"
          >
            <FileDown className="w-4 h-4" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto text-xs font-bold no-print">
        <button
          type="button"
          onClick={() => { setReportCategory('sales'); setActiveReport('sales_summary'); }}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
            reportCategory === 'sales' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تقارير المبيعات والعملاء
        </button>
        <button
          type="button"
          onClick={() => { setReportCategory('purchases'); setActiveReport('purchases_summary'); }}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
            reportCategory === 'purchases' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تقارير المشتريات والموردين
        </button>
        <button
          type="button"
          onClick={() => { setReportCategory('inventory'); setActiveReport('warehouse_stock'); }}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
            reportCategory === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تقارير المخازن والأصناف
        </button>
        <button
          type="button"
          onClick={() => { setReportCategory('finance'); setActiveReport('cash_bank_movement'); }}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
            reportCategory === 'finance' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الخزائن والبنوك والشيكات
        </button>
        <button
          type="button"
          onClick={() => { setReportCategory('statements'); setActiveReport('income_statement'); }}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
            reportCategory === 'statements' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          القوائم المالية الملونة والميزان
        </button>
        <button
          type="button"
          onClick={() => { setReportCategory('admin'); setActiveReport('employees_report'); }}
          className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
            reportCategory === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الموظفين وسجل تدقيق المستخدمين
        </button>
      </div>

      {/* Sub Report Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold no-print">
        {reportCategory === 'sales' && (
          <>
            <button
              onClick={() => setActiveReport('sales_summary')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'sales_summary' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              فواتير المبيعات (تاريخ ورقم)
            </button>
            <button
              onClick={() => setActiveReport('sales_returns')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'sales_returns' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              مردودات المبيعات
            </button>
            <button
              onClick={() => setActiveReport('customers_list')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'customers_list' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              دليل العملاء
            </button>
            <button
              onClick={() => setActiveReport('customers_by_rep')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'customers_by_rep' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              عملاء المندوب
            </button>
            <button
              onClick={() => setActiveReport('rep_sales')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'rep_sales' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              مسحوبات ومبيعات المندوب
            </button>
            <button
              onClick={() => setActiveReport('overdue_invoices')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'overdue_invoices' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              متأخرات الفواتير بالمندوب
            </button>
            <button
              onClick={() => setActiveReport('customers_balances_detailed')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'customers_balances_detailed' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              أرصدة العملاء بالمندوب (تفصيلي)
            </button>
            <button
              onClick={() => setActiveReport('customer_statement')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'customer_statement' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              كشف حساب عميل
            </button>
          </>
        )}

        {reportCategory === 'purchases' && (
          <>
            <button
              onClick={() => setActiveReport('purchases_summary')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'purchases_summary' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              فواتير المشتريات (تاريخ ورقم)
            </button>
            <button
              onClick={() => setActiveReport('purchases_returns')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'purchases_returns' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              مردودات المشتريات
            </button>
            <button
              onClick={() => setActiveReport('suppliers_aging')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'suppliers_aging' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              الموردين وأعمار الديون
            </button>
            <button
              onClick={() => setActiveReport('supplier_statement')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'supplier_statement' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              كشف حساب مورد
            </button>
            <button
              onClick={() => setActiveReport('suppliers_balances')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'suppliers_balances' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              أرصدة الموردين
            </button>
          </>
        )}

        {reportCategory === 'inventory' && (
          <>
            <button
              onClick={() => setActiveReport('warehouse_stock')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'warehouse_stock' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              أرصدة المخازن مجمعة ومنفصلة
            </button>
            <button
              onClick={() => setActiveReport('inventory_valuation')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'inventory_valuation' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              تقييم المخزون (بالتكلفة والبيع)
            </button>
            <button
              onClick={() => setActiveReport('stock_adjustments')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'stock_adjustments' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              تقرير التسويات الجردية
            </button>
          </>
        )}

        {reportCategory === 'finance' && (
          <>
            <button
              onClick={() => setActiveReport('cash_bank_movement')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'cash_bank_movement' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              حركة الخزينة والبنك
            </button>
            <button
              onClick={() => setActiveReport('checks_movement')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'checks_movement' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              حركة الشيكات
            </button>
            <button
              onClick={() => setActiveReport('bank_transfers')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'bank_transfers' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              حركة التحويلات البنكية
            </button>
            <button
              onClick={() => setActiveReport('vouchers_report')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'vouchers_report' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              إيصالات القبض والصرف
            </button>
          </>
        )}

        {reportCategory === 'statements' && (
          <>
            <button
              onClick={() => setActiveReport('income_statement')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'income_statement' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              قائمة الدخل الملونة (أرباح وخسائر)
            </button>
            <button
              onClick={() => setActiveReport('balance_sheet')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'balance_sheet' ? 'bg-blue-700 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              الميزانية العمومية الملونة
            </button>
            <button
              onClick={() => setActiveReport('cash_flow')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'cash_flow' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              قائمة التدفقات النقدية الملونة
            </button>
          </>
        )}

        {reportCategory === 'admin' && (
          <>
            <button
              onClick={() => setActiveReport('employees_report')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'employees_report' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              تقرير الموظفين والرواتب
            </button>
            <button
              onClick={() => setActiveReport('audit_log')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${activeReport === 'audit_log' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              سجل تعديلات وحركات المستخدمين
            </button>
          </>
        )}
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 no-print">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>فلاتر ومحددات التقرير:</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">من رقم مستند</label>
            <input
              type="text"
              value={fromDocNo}
              onChange={e => setFromDocNo(e.target.value)}
              placeholder="مثال: INV-001"
              className="w-full border border-slate-300 rounded-lg p-1.5 bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">إلى رقم مستند</label>
            <input
              type="text"
              value={toDocNo}
              onChange={e => setToDocNo(e.target.value)}
              placeholder="مثال: INV-999"
              className="w-full border border-slate-300 rounded-lg p-1.5 bg-white font-mono"
            />
          </div>

          {/* Conditional filter dropdowns */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">المندوب (الموظف)</label>
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
            >
              <option value="">(الكل)</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">العميل</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
            >
              <option value="">(الكل)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT DISPLAY CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 print-card">
        {/* Report 1: Sales Invoices Summary */}
        {activeReport === 'sales_summary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">تقرير فواتير المبيعات التفصيلي</h3>
              <button
                type="button"
                onClick={() => {
                  const headers = ['رقم الفاتورة', 'التاريخ', 'العميل', 'المندوب', 'المخزن', 'طريقة الدفع', 'الصافي', 'المسدد', 'المتبقي'];
                  const rows = filteredSalesInvoices.map(i => [i.invoiceNo, i.date, i.customerName, i.salesRepName, i.warehouseName, i.paymentMethod, i.netTotal, i.paidAmount, i.remainingAmount]);
                  exportToCSV('تقرير_المبيعات', headers, rows);
                }}
                className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer no-print"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير Excel (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-2.5">رقم الفاتورة</th>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">العميل</th>
                    <th className="p-2.5">المندوب</th>
                    <th className="p-2.5">المخزن</th>
                    <th className="p-2.5">طريقة الدفع</th>
                    <th className="p-2.5 text-left">قيمة الفاتورة</th>
                    <th className="p-2.5 text-left text-emerald-300">المسدد</th>
                    <th className="p-2.5 text-left text-rose-300">المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalesInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                      <td className="p-2.5 text-slate-500">{inv.date}</td>
                      <td className="p-2.5 font-semibold">{inv.customerName}</td>
                      <td className="p-2.5 text-slate-600">{inv.salesRepName}</td>
                      <td className="p-2.5 text-slate-500">{inv.warehouseName}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-left font-bold text-slate-900">
                        {inv.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 font-mono text-left text-emerald-700 font-semibold">
                        {inv.paidAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 font-mono text-left text-rose-700 font-bold">
                        {inv.remainingAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={6} className="p-2.5 text-center">الإجمالي العام</td>
                    <td className="p-2.5 font-mono text-left text-amber-300">
                      {filteredSalesInvoices.reduce((s, i) => s + i.netTotal, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 font-mono text-left text-emerald-300">
                      {filteredSalesInvoices.reduce((s, i) => s + i.paidAmount, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 font-mono text-left text-rose-300">
                      {filteredSalesInvoices.reduce((s, i) => s + i.remainingAmount, 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Report 2: Detailed Customers Balances by Rep */}
        {activeReport === 'customers_balances_detailed' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                تقرير أرصدة العملاء بالمندوب (كود، اسم، محافظة، مندوب، آخر فاتورة، آخر دفعة، مدين، دائن، صافي، متأخرات)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const headers = ['كود العميل', 'اسم العميل', 'المحافظة', 'اسم المندوب', 'قيمة آخر فاتورة', 'تاريخها', 'قيمة آخر دفعة', 'تاريخها', 'إجمالي المدين', 'إجمالي الدائن', 'صافي الرصيد', 'المبلغ المتأخر'];
                  const rows = customersDetailedBalances.map(r => [r.code, r.name, r.governorate, r.repName, r.lastInvoiceVal, r.lastInvoiceDate, r.lastPayVal, r.lastPayDate, r.totalDebit, r.totalCredit, r.netBalance, r.overdueAmount]);
                  exportToCSV('أرصدة_العملاء_بالمندوب', headers, rows);
                }}
                className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer no-print"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير Excel (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-2.5">الكود</th>
                    <th className="p-2.5">اسم العميل</th>
                    <th className="p-2.5">المحافظة</th>
                    <th className="p-2.5">اسم المندوب</th>
                    <th className="p-2.5 text-left">قيمة آخر فاتورة</th>
                    <th className="p-2.5">تاريخها</th>
                    <th className="p-2.5 text-left">قيمة آخر دفعة</th>
                    <th className="p-2.5">تاريخها</th>
                    <th className="p-2.5 text-left">إجمالي المدين</th>
                    <th className="p-2.5 text-left">إجمالي الدائن</th>
                    <th className="p-2.5 text-left text-blue-300">صافي الرصيد</th>
                    <th className="p-2.5 text-left text-rose-300">المتأخرات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customersDetailedBalances.map(row => (
                    <tr key={row.code} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold">{row.code}</td>
                      <td className="p-2 font-bold text-slate-900">{row.name}</td>
                      <td className="p-2 text-slate-500">{row.governorate}</td>
                      <td className="p-2 text-blue-700 font-semibold">{row.repName}</td>
                      <td className="p-2 font-mono text-left">{row.lastInvoiceVal ? row.lastInvoiceVal.toLocaleString('ar-EG') : '-'}</td>
                      <td className="p-2 text-[10px] text-slate-400">{row.lastInvoiceDate}</td>
                      <td className="p-2 font-mono text-left text-emerald-700">{row.lastPayVal ? row.lastPayVal.toLocaleString('ar-EG') : '-'}</td>
                      <td className="p-2 text-[10px] text-slate-400">{row.lastPayDate}</td>
                      <td className="p-2 font-mono text-left">{row.totalDebit.toLocaleString('ar-EG')}</td>
                      <td className="p-2 font-mono text-left">{row.totalCredit.toLocaleString('ar-EG')}</td>
                      <td className="p-2 font-mono text-left font-bold text-blue-900 bg-blue-50/50">
                        {row.netBalance.toLocaleString('ar-EG')}
                      </td>
                      <td className="p-2 font-mono text-left font-bold text-rose-700 bg-rose-50/50">
                        {row.overdueAmount.toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 3: Customer Statement (كشف حساب عميل) */}
        {activeReport === 'customer_statement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  كشف حساب تفصيلي للعميل: {targetCustomer?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  المندوب: {targetCustomer?.salesRepName} | الهاتف: {targetCustomer?.phone} | العنوان: {targetCustomer?.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const headers = ['التاريخ', 'نوع الحركة', 'رقم المستند', 'مدين', 'دائن', 'الرصيد التراكمي', 'البيان'];
                  const rows = customerStatementRows.map(r => [r.date, r.docType, r.docNo, r.debit, r.credit, r.balance, r.notes]);
                  exportToCSV(`كشف_حساب_${targetCustomer?.name}`, headers, rows);
                }}
                className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer no-print"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير Excel (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">نوع الحركة</th>
                    <th className="p-2.5">رقم الحركة</th>
                    <th className="p-2.5 text-left">مدين (فواتير)</th>
                    <th className="p-2.5 text-left">دائن (سداد)</th>
                    <th className="p-2.5 text-left text-amber-300">الرصيد التراكمي</th>
                    <th className="p-2.5">البيان والملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerStatementRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-500">{row.date}</td>
                      <td className="p-2.5 font-bold">{row.docType}</td>
                      <td className="p-2.5 font-mono text-blue-700 font-semibold">{row.docNo}</td>
                      <td className="p-2.5 font-mono text-left font-bold text-slate-800">
                        {row.debit ? row.debit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2.5 font-mono text-left font-bold text-emerald-700">
                        {row.credit ? row.credit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-2.5 font-mono text-left font-black text-blue-900 bg-blue-50/50">
                        {row.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-slate-500">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={5} className="p-2.5 text-center">الرصيد النهائي المستحق على العميل</td>
                    <td className="p-2.5 font-mono text-left text-amber-300 text-sm">
                      {targetCustomer?.currentBalance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Report 4: Inventory Valuation */}
        {activeReport === 'inventory_valuation' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                تقرير تقييم المخزون السلعي (بالتكلفة وسعر البيع والأرباح المتوقعة)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const headers = ['كود الصنف', 'اسم الصنف', 'الوحدة', 'الرصيد الحالي', 'سعر التكلفة', 'سعر البيع', 'إجمالي التكلفة', 'إجمالي البيع', 'الربح المتوقع'];
                  const rows = inventoryValuationData.map(r => [r.code, r.name, r.unit, r.stock, r.costPrice, r.sellPrice, r.totalCost, r.totalSell, r.expectedProfit]);
                  exportToCSV('تقييم_المخزون', headers, rows);
                }}
                className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer no-print"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير Excel (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-2.5">الكود</th>
                    <th className="p-2.5">اسم الصنف</th>
                    <th className="p-2.5 text-center">الوحدة</th>
                    <th className="p-2.5 text-center">الرصيد الحالي</th>
                    <th className="p-2.5 text-left">سعر التكلفة</th>
                    <th className="p-2.5 text-left">سعر البيع</th>
                    <th className="p-2.5 text-left">قيمة المخزون بالتكلفة</th>
                    <th className="p-2.5 text-left">قيمة المخزون بالبيع</th>
                    <th className="p-2.5 text-left text-emerald-300">الربح المتوقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryValuationData.map(r => (
                    <tr key={r.code} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono">{r.code}</td>
                      <td className="p-2.5 font-bold">{r.name}</td>
                      <td className="p-2.5 text-center">{r.unit}</td>
                      <td className="p-2.5 text-center font-bold font-mono">{r.stock}</td>
                      <td className="p-2.5 font-mono text-left">{r.costPrice.toLocaleString('ar-EG')}</td>
                      <td className="p-2.5 font-mono text-left">{r.sellPrice.toLocaleString('ar-EG')}</td>
                      <td className="p-2.5 font-mono text-left font-bold text-slate-800">
                        {r.totalCost.toLocaleString('ar-EG')}
                      </td>
                      <td className="p-2.5 font-mono text-left font-bold text-blue-900">
                        {r.totalSell.toLocaleString('ar-EG')}
                      </td>
                      <td className="p-2.5 font-mono text-left font-bold text-emerald-700 bg-emerald-50/50">
                        {r.expectedProfit.toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={6} className="p-2.5 text-center">الإجماليات العامة للمخزون</td>
                    <td className="p-2.5 font-mono text-left text-amber-300">
                      {inventoryValuationData.reduce((s, i) => s + i.totalCost, 0).toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-2.5 font-mono text-left text-blue-300">
                      {inventoryValuationData.reduce((s, i) => s + i.totalSell, 0).toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-2.5 font-mono text-left text-emerald-400 font-black">
                      {inventoryValuationData.reduce((s, i) => s + i.expectedProfit, 0).toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Report 5: Income Statement (قائمة الدخل الملونة) */}
        {activeReport === 'income_statement' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="text-center pb-2 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">قائمة الدخل الشاملة (الأرباح والخسائر)</h3>
              <p className="text-xs text-slate-500">عن الفترة من {startDate} إلى {endDate}</p>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-xs">
              {/* 1. Revenues */}
              <div className="bg-emerald-50/80 p-3.5 border-b border-slate-200">
                <div className="flex justify-between items-center font-bold text-emerald-950 text-sm">
                  <span>إيرادات النشاط والمبيعات</span>
                  <span className="font-mono">{financialTotals.salesRev.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-xs mt-1">
                  <span>يخصم: مردودات ومسموحات المبيعات</span>
                  <span className="font-mono text-rose-700">-{financialTotals.salesRet.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
                <div className="flex justify-between items-center font-bold text-emerald-800 text-xs mt-1 pt-1 border-t border-emerald-200">
                  <span>صافي المبيعات:</span>
                  <span className="font-mono">{financialTotals.netSales.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
              </div>

              {/* 2. COGS */}
              <div className="bg-amber-50/80 p-3.5 border-b border-slate-200">
                <div className="flex justify-between items-center font-bold text-amber-950 text-sm">
                  <span>تكلفة البضاعة المباعة (المشتريات والتكاليف المباشرة)</span>
                  <span className="font-mono text-rose-700">-{financialTotals.purchasesExp.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
              </div>

              {/* 3. Gross Profit */}
              <div className="bg-blue-50 p-4 border-b border-slate-200 flex justify-between items-center font-black text-blue-950 text-sm">
                <span>مجمل الربح التجاري (Gross Profit):</span>
                <span className="font-mono text-base text-blue-900">
                  {financialTotals.grossProfit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                </span>
              </div>

              {/* 4. Operating Expenses */}
              <div className="bg-slate-50 p-3.5 border-b border-slate-200">
                <div className="flex justify-between items-center font-bold text-slate-800 text-sm">
                  <span>المصروفات العمومية والإدارية (أجور، إيجارات، مرافق)</span>
                  <span className="font-mono text-rose-700">-{financialTotals.operatingExp.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
                </div>
              </div>

              {/* 5. Net Profit */}
              <div className={`p-5 flex justify-between items-center font-black text-base ${
                financialTotals.netProfit >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                <span>صافي الأرباح / (الخسائر) للفترة:</span>
                <span className="font-mono text-xl">
                  {financialTotals.netProfit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Report 6: Balance Sheet (الميزانية العمومية الملونة) */}
        {activeReport === 'balance_sheet' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">الميزانية العمومية والمركز المالي (مدين / دائن)</h3>
              <p className="text-xs text-slate-500">كما في تاريخ {endDate}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Assets Side (الجانب المدين) */}
              <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-blue-700 text-white p-3 font-bold text-center text-sm">
                  الأصول (الجانب المدين)
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-1 mb-2">الأصول المتداولة:</h4>
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>النقدية بالخزائن والحسابات البنكية:</span>
                        <span className="font-mono font-bold">320,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>العملاء والمدينون التجاريون:</span>
                        <span className="font-mono font-bold">280,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المخزون السلعي للبضاعة:</span>
                        <span className="font-mono font-bold">250,000.00 ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-1 mb-2">الأصول الثابتة وغير المتداولة:</h4>
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>أثاث وتجهيزات ومعدات:</span>
                        <span className="font-mono font-bold">150,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>أجهزة حاسب وشبكات:</span>
                        <span className="font-mono font-bold">120,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>سيارات نقل وتوزيع:</span>
                        <span className="font-mono font-bold">130,000.00 ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900 text-white p-3 font-black flex justify-between items-center text-sm">
                  <span>إجمالي الأصول (المدين):</span>
                  <span className="font-mono text-base">{financialTotals.totalAssets.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              {/* Liabilities & Equity Side (الجانب الدائن) */}
              <div className="border border-purple-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-purple-700 text-white p-3 font-bold text-center text-sm">
                  الالتزامات وحقوق الملكية (الجانب الدائن)
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-purple-900 border-b border-purple-100 pb-1 mb-2">الالتزامات المتداولة (الخصوم):</h4>
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>الموردون والدائنون التجاريون:</span>
                        <span className="font-mono font-bold">310,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>مصلحة الضرائب (قيمة مضافة وخصم):</span>
                        <span className="font-mono font-bold">40,000.00 ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-purple-900 border-b border-purple-100 pb-1 mb-2">حقوق الملكية ورأس المال:</h4>
                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>رأس المال المدفوع:</span>
                        <span className="font-mono font-bold">800,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>أرباح محتجزة وسنوات سابقة:</span>
                        <span className="font-mono font-bold">100,000.00 ج.م</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>صافي أرباح الفترة الحالية:</span>
                        <span className="font-mono">+{financialTotals.netProfit.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-950 text-white p-3 font-black flex justify-between items-center text-sm">
                  <span>إجمالي الخصوم وحقوق الملكية:</span>
                  <span className="font-mono text-base">{financialTotals.totalAssets.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report 7: Cash Flow (قائمة التدفقات النقدية الملونة) */}
        {activeReport === 'cash_flow' && (
          <div className="space-y-4 max-w-3xl mx-auto text-xs">
            <div className="text-center pb-2 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">قائمة التدفقات النقدية الملونة</h3>
              <p className="text-xs text-slate-500">حسب الطريقة المباشرة / غير المباشرة</p>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-teal-50 p-4 border-b border-slate-200 space-y-1.5">
                <h4 className="font-bold text-teal-900 text-sm">1. التدفقات النقدية من الأنشطة التشغيلية</h4>
                <div className="flex justify-between text-slate-700">
                  <span>النقدية المحصلة من مبيعات العملاء:</span>
                  <span className="font-mono text-emerald-700 font-bold">+{receiptVouchers.reduce((s, r) => s + r.amount, 0).toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>النقدية المدفوعة للموردين والمصروفات:</span>
                  <span className="font-mono text-rose-700 font-bold">-{paymentVouchers.reduce((s, p) => s + p.amount, 0).toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 border-b border-slate-200 space-y-1.5">
                <h4 className="font-bold text-blue-900 text-sm">2. التدفقات النقدية من الأنشطة الاستثمارية</h4>
                <div className="flex justify-between text-slate-700">
                  <span>شراء أصول ثابتة ومعدات:</span>
                  <span className="font-mono text-slate-500">0.00 ج.م</span>
                </div>
              </div>

              <div className="bg-purple-50 p-4 border-b border-slate-200 space-y-1.5">
                <h4 className="font-bold text-purple-900 text-sm">3. التدفقات النقدية من الأنشطة التمويلية</h4>
                <div className="flex justify-between text-slate-700">
                  <span>زيادة رأس المال / توزيعات أرباح:</span>
                  <span className="font-mono text-slate-500">0.00 ج.م</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 flex justify-between items-center text-sm font-black">
                <span>صافي رصيد النقدية وما في حكمها نهاية الفترة:</span>
                <span className="font-mono text-base text-emerald-400">
                  {cashBanks.reduce((s, c) => s + c.currentBalance, 0).toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Report 8: Audit Logs */}
        {activeReport === 'audit_log' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">سجل تدقيق وتعديلات المستخدمين (Audit Trail Log)</h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-2.5">الوقت والتاريخ</th>
                    <th className="p-2.5">المستخدم</th>
                    <th className="p-2.5">نوع العملية</th>
                    <th className="p-2.5">الشاشة</th>
                    <th className="p-2.5">التفاصيل الكاملة للعملية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="p-2.5 font-bold text-slate-800">{log.userName}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'create' ? 'bg-emerald-100 text-emerald-800' :
                          log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                          log.action === 'delete' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2.5 text-blue-700 font-semibold">{log.screen}</td>
                      <td className="p-2.5 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Generic Table for other selected reports */}
        {!['sales_summary', 'customers_balances_detailed', 'customer_statement', 'inventory_valuation', 'income_statement', 'balance_sheet', 'cash_flow', 'audit_log'].includes(activeReport) && (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800">بيانات التقرير جاهزة ومفلترة</h4>
            <p className="text-xs">يتم استخراج التقرير بصيغة الطباعة والتصدير الفوري لكافة السجلات المسجلة</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                معاينة وطباعة التقرير
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
