import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Boxes,
  Landmark,
  FileText,
  AlertCircle,
  GitBranch,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  ShieldCheck,
  Printer,
  FileDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';
import { PrintHeader } from '../common/PrintHeader';

export const DashboardScreen: React.FC = () => {
  const {
    company,
    currentUser,
    setCurrentScreen,
    salesInvoices,
    purchaseInvoices,
    customers,
    suppliers,
    items,
    warehouses,
    cashBanks,
    currentFiscalYear
  } = useApp();

  const totalSales = salesInvoices.reduce((s, i) => s + i.netTotal, 0);
  const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.netTotal, 0);
  const totalCashBank = cashBanks.reduce((s, c) => s + c.currentBalance, 0);
  const totalCustomersDue = customers.reduce((s, c) => s + c.currentBalance, 0);
  const totalSuppliersDue = suppliers.reduce((s, s1) => s + s1.currentBalance, 0);
  const lowStockItems = items.filter(i => i.currentStock <= i.minQuantity);

  return (
    <div className="space-y-6">
      {/* Printable Header */}
      <div className="print-only">
        <PrintHeader title="لوحة التحكم والمؤشرات المالية والتشغيلية" docNumber="DASH-OVERVIEW" date={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                {currentFiscalYear.name}
              </span>
              <span className="text-xs text-slate-400">مرحباً بك مجدداً،</span>
            </div>
            <h1 className="text-2xl font-black">
              {currentUser?.employeeName || currentUser?.username || 'مدير المنظومة'}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              أهلاً بك في {company.name}. منظومتك المحاسبية المتكاملة لإدارة المبيعات، المخازن، الحسابات والشجرة المالية.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCurrentScreen('sales_invoice')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>+ فاتورة مبيعات</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen('accounts')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>شجرة الحسابات</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
              title="طباعة لوحة المؤشرات"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>طباعة</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const prev = document.title;
                document.title = `لوحة_المؤشرات_${company.name}_${new Date().toISOString().split('T')[0]}`;
                window.print();
                setTimeout(() => { document.title = prev; }, 1500);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition cursor-pointer"
              title="طباعة وتصدير كملف PDF"
            >
              <FileDown className="w-4 h-4" />
              <span>طباعة PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales */}
        <div
          onClick={() => setCurrentScreen('sales_invoice')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي المبيعات</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalSales.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{salesInvoices.length} فواتير مسجلة</span>
          </div>
        </div>

        {/* Card 2: Cash & Banks */}
        <div
          onClick={() => setCurrentScreen('cash_bank')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">سيولة الخزائن والبنوك</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalCashBank.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>في {cashBanks.length} خزائن وحسابات بنكية</span>
          </div>
        </div>

        {/* Card 3: Customers Receivables */}
        <div
          onClick={() => setCurrentScreen('customers')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">أرصدة العملاء (مدينون)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalCustomersDue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            <span>{customers.length} عملاء مسجلين</span>
          </div>
        </div>

        {/* Card 4: Suppliers Payables */}
        <div
          onClick={() => setCurrentScreen('suppliers')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">مستحقات الموردين (دائنون)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalSuppliersDue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">
            <span>{suppliers.length} موردين معتمدين</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Latest Invoices & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Latest Sales Invoices */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>آخر فواتير المبيعات الصادرة</span>
            </h2>
            <button
              type="button"
              onClick={() => setCurrentScreen('sales_invoice')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              عرض الكل وإصدار فاتورة ←
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="p-2.5">رقم الفاتورة</th>
                  <th className="p-2.5">العميل</th>
                  <th className="p-2.5">المندوب</th>
                  <th className="p-2.5 text-left">القيمة</th>
                  <th className="p-2.5 text-center">طريقة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesInvoices.slice(0, 5).map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => setCurrentScreen('sales_invoice')}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="p-2.5 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{inv.customerName}</td>
                    <td className="p-2.5 text-slate-500">{inv.salesRepName}</td>
                    <td className="p-2.5 font-mono text-left font-bold text-slate-900">
                      {inv.netTotal.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Shortage Alert */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>تنبيهات نواقص المخزون</span>
            </h2>
            <button
              type="button"
              onClick={() => setCurrentScreen('items')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              الأصناف
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              جميع الأصناف والمخزون أعلى من الحد الأدنى للطلب 👍
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setCurrentScreen('items')}
                  className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 hover:bg-rose-100/60 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-rose-900">{item.name}</p>
                    <p className="text-[10px] text-rose-600">كود: {item.code} | الحد الأدنى: {item.minQuantity} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-xs font-mono font-bold">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          اختصارات الوصول السريع للشاشات الرئيسية:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setCurrentScreen('company')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition font-bold text-slate-700 flex flex-col items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>بيانات الشركة</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('accounts')}
            className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition font-bold text-slate-700 flex flex-col items-center gap-2 cursor-pointer"
          >
            <GitBranch className="w-5 h-5 text-amber-600" />
            <span>شجرة الحسابات</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('sales_invoice')}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition font-bold text-slate-700 flex flex-col items-center gap-2 cursor-pointer"
          >
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>فاتورة مبيعات</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('receipt_voucher')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition font-bold text-slate-700 flex flex-col items-center gap-2 cursor-pointer"
          >
            <Landmark className="w-5 h-5 text-blue-600" />
            <span>سندات القبض</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('warehouses')}
            className="p-3 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition font-bold text-slate-700 flex flex-col items-center gap-2 cursor-pointer"
          >
            <Boxes className="w-5 h-5 text-cyan-600" />
            <span>تكويد المخازن</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('reports')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition font-bold text-slate-700 flex flex-col items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>التقارير الشاملة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
