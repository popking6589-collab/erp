import React, { useState } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  GitBranch,
  Layers,
  UserCheck,
  Package,
  Boxes,
  Truck,
  FileText,
  RotateCcw,
  ShoppingCart,
  ArrowLeftRight,
  Sliders,
  Landmark,
  Receipt,
  CreditCard,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    accounts,
    customers,
    items,
    salesInvoices,
    salesReturns,
    purchaseInvoices,
    purchaseReturns,
    warehouses
  } = useApp();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    finance: true,
    inventory: true,
    sales: true,
    reports: true
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const navItem = (id: ScreenId, label: string, icon: React.ReactNode, count?: number) => {
    const isActive = currentScreen === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setCurrentScreen(id)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition cursor-pointer group ${
          isActive
            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} transition`}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {count !== undefined && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white border-l border-slate-200 h-[calc(100vh-80px)] overflow-y-auto p-3 flex flex-col justify-between shadow-sm no-print">
      <div className="space-y-4">
        {/* Main Dashboard Button */}
        {navItem('dashboard', 'الرئيسية ولوحة المؤشرات', <LayoutDashboard className="w-4 h-4" />)}

        {/* Section 1: دليل الحسابات والمالية */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('finance')}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-700 cursor-pointer"
          >
            <span>شجرة الحسابات والمالية</span>
            {expandedSections.finance ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {expandedSections.finance && (
            <div className="mt-1 space-y-1 pr-1 border-r border-slate-100">
              {navItem('accounts', 'شجرة الحسابات والدليل', <GitBranch className="w-4 h-4" />, accounts.length)}
              {navItem('cash_bank', 'تكويد الخزائن والبنوك', <Landmark className="w-4 h-4" />)}
              {navItem('receipt_voucher', 'سندات القبض (نقدي/شيك)', <Receipt className="w-4 h-4" />)}
              {navItem('payment_voucher', 'سندات الصرف', <CreditCard className="w-4 h-4" />)}
              {navItem('journal_entries', 'قيود اليومية العامة', <BookOpen className="w-4 h-4" />)}
            </div>
          )}
        </div>

        {/* Section 2: الفواتير والمبيعات */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('sales')}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-700 cursor-pointer"
          >
            <span>فواتير البيع والشراء</span>
            {expandedSections.sales ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {expandedSections.sales && (
            <div className="mt-1 space-y-1 pr-1 border-r border-slate-100">
              {navItem('operations_hub', 'مركز وسجل العمليات', <Layers className="w-4 h-4 text-teal-600" />, salesInvoices.length + purchaseInvoices.length)}
              {navItem('sales_invoice', 'فاتورة مبيعات', <FileText className="w-4 h-4" />, salesInvoices.length)}
              {navItem('sales_return', 'مردودات مبيعات', <RotateCcw className="w-4 h-4" />, salesReturns.length)}
              {navItem('purchase_invoice', 'فاتورة مشتريات', <ShoppingCart className="w-4 h-4" />, purchaseInvoices.length)}
              {navItem('purchase_return', 'مردودات مشتريات', <RotateCcw className="w-4 h-4" />, purchaseReturns.length)}
            </div>
          )}
        </div>

        {/* Section 3: المخازن والجهات */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('inventory')}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-700 cursor-pointer"
          >
            <span>المخازن والأصناف والجهات</span>
            {expandedSections.inventory ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {expandedSections.inventory && (
            <div className="mt-1 space-y-1 pr-1 border-r border-slate-100">
              {navItem('warehouses', 'تكويد المخازن', <Boxes className="w-4 h-4" />, warehouses.length)}
              {navItem('items', 'تكويد الأصناف', <Package className="w-4 h-4" />, items.length)}
              {navItem('customers', 'تكويد العملاء', <Users className="w-4 h-4" />, customers.length)}
              {navItem('suppliers', 'تكويد الموردين', <Truck className="w-4 h-4" />)}
              {navItem('stock_adjustments', 'تسويات جردية', <Sliders className="w-4 h-4" />)}
              {navItem('warehouse_transfer', 'تحويل بين المخازن', <ArrowLeftRight className="w-4 h-4" />)}
            </div>
          )}
        </div>

        {/* Section 4: التهيئة والإدارة والموظفين */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('general')}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-700 cursor-pointer"
          >
            <span>التهيئة والإدارة والموارد البشرية</span>
            {expandedSections.general ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
          {expandedSections.general && (
            <div className="mt-1 space-y-1 pr-1 border-r border-slate-100">
              {navItem('system_admin', 'مركز التهيئة والإدارة العامة', <Settings className="w-4 h-4 text-blue-600" />)}
              {navItem('company', 'بيانات وشعار الشركة', <Building2 className="w-4 h-4" />)}
              {navItem('jobs', 'تكويد الوظائف', <Briefcase className="w-4 h-4" />)}
              {navItem('departments', 'أقسام العمل', <Layers className="w-4 h-4" />)}
              {navItem('employees', 'تكويد الموظفين', <UserCheck className="w-4 h-4" />)}
              {navItem('users', 'المستخدمين والصلاحيات', <ShieldCheck className="w-4 h-4" />)}
            </div>
          )}
        </div>

        {/* Section 5: التقارير والقوائم */}
        <div>
          {navItem('reports', 'التقارير والقوائم الختامية', <BarChart3 className="w-4 h-4 text-indigo-600" />)}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-blue-600 font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>منظومة البيان المحاسبية</span>
        </div>
        <p className="text-[10px] text-slate-400">نظام القيود المزدوجة المتوافق مع معايير المحاسبة المصرية والدولية</p>
      </div>
    </aside>
  );
};
