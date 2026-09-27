import React, { useState, useRef, useEffect } from 'react';
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
  Calendar,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Lock,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenYearClose: () => void;
  onOpenReset?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, onOpenYearClose, onOpenReset }) => {
  const {
    company,
    currentUser,
    currentScreen,
    setCurrentScreen,
    fiscalYears,
    currentFiscalYear,
    switchFiscalYear,
    logout,
    salesInvoices,
    salesReturns,
    purchaseInvoices,
    purchaseReturns,
    stockAdjustments,
    warehouseTransfers
  } = useApp();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const navigateTo = (screen: ScreenId) => {
    setCurrentScreen(screen);
    setActiveDropdown(null);
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800 no-print" ref={dropdownRef}>
      {/* Top Branding and User Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs">
        {/* Company Identity */}
        <div className="flex items-center gap-3">
          {company.logo ? (
            <img src={company.logo} alt="Logo" className="w-8 h-8 rounded-md object-cover bg-white" />
          ) : (
            <Building2 className="w-6 h-6 text-blue-400" />
          )}
          <div>
            <span className="font-bold text-sm tracking-wide text-white">{company.name}</span>
            <span className="mr-2 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              س.ت: {company.commercialRegister} | ضريبي: {company.taxNumber}
            </span>
          </div>
        </div>

        {/* Current Year, User info & Switch/Logout */}
        <div className="flex items-center gap-3">
          {/* Fiscal Year Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">السنة المالية:</span>
            <select
              value={currentFiscalYear.id}
              onChange={(e) => switchFiscalYear(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              {fiscalYears.map(fy => (
                <option key={fy.id} value={fy.id} className="bg-slate-800 text-white">
                  {fy.year} {fy.isClosed ? '(مقفلة)' : '(نشطة)'}
                </option>
              ))}
            </select>
          </div>

          {/* User Status */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/90 pl-1 pr-2.5 py-1 rounded-lg border border-slate-700">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200">
                {currentUser.employeeName || currentUser.username}
              </span>
              {currentUser.isAdmin && (
                <span className="bg-indigo-900/80 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded border border-indigo-700 font-bold">
                  مدير النظام
                </span>
              )}
              <button
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="mr-1 text-slate-400 hover:text-rose-400 p-1 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-bold transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Top Navigation Dropdown Menus */}
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-visible text-sm py-1.5 flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentScreen === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </button>

          {/* Menu 1: التهيئة والإدارة */}
          <div
            className="relative inline-flex items-center rounded-lg bg-slate-800/40 hover:bg-slate-800 transition"
            onMouseEnter={() => setActiveDropdown('setup')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => navigateTo('system_admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-r-lg font-medium transition cursor-pointer ${
                currentScreen === 'system_admin' || ['company', 'users', 'jobs', 'departments', 'employees'].includes(currentScreen)
                  ? 'bg-slate-800 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="فتح مركز التهيئة والإدارة العامة"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>التهيئة والإدارة</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('setup');
              }}
              className={`px-1.5 py-2 rounded-l-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer border-r border-slate-700/50 ${
                activeDropdown === 'setup' ? 'bg-slate-800 text-blue-400' : ''
              }`}
              title="خيارات التهيئة والإدارة"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'setup' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'setup' && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => navigateTo('system_admin')}
                  className="w-full text-right px-4 py-2 hover:bg-blue-950/60 flex items-center justify-between text-blue-400 font-bold border-b border-slate-800 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    <span>مركز التهيئة والإدارة العامة</span>
                  </div>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded-full font-bold">
                    الرئيسية
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('company')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>تكويد اسم الشركة وبياناتها</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('jobs')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>تكويد الوظائف</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('departments')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>تكويد أقسام العمل</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('employees')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>تكويد الموظفين</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => navigateTo('users')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>المستخدمين والصلاحيات</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => { setActiveDropdown(null); onOpenReset?.(); }}
                  className="w-full text-right px-4 py-2 hover:bg-rose-950/40 flex items-center gap-2.5 text-rose-400 font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة تهيئة النظام وحذف الداتا</span>
                </button>
              </div>
            )}
          </div>

          {/* Menu 2: شجرة الحسابات والمالية */}
          <div
            className="relative inline-flex items-center rounded-lg bg-slate-800/40 hover:bg-slate-800 transition"
            onMouseEnter={() => setActiveDropdown('accounts')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => navigateTo('accounts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-r-lg font-medium transition cursor-pointer ${
                activeDropdown === 'accounts' || ['accounts', 'cash_bank', 'receipt_voucher', 'payment_voucher', 'journal_entries'].includes(currentScreen)
                  ? 'bg-slate-800 text-amber-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="فتح شجرة الحسابات والدليل المحاسبي"
            >
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>الحسابات والمالية</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('accounts');
              }}
              className={`px-1.5 py-2 rounded-l-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer border-r border-slate-700/50 ${
                activeDropdown === 'accounts' ? 'bg-slate-800 text-amber-400' : ''
              }`}
              title="خيارات الحسابات والمالية"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'accounts' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'accounts' && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => navigateTo('accounts')}
                  className="w-full text-right px-4 py-2 hover:bg-amber-950/60 flex items-center justify-between text-amber-300 font-bold border-b border-slate-800 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <span>شجرة الحسابات والدليل المحاسبي</span>
                  </div>
                  <span className="text-[10px] bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                    الدليل
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('cash_bank')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span>تكويد الخزائن والبنوك</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('receipt_voucher')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span>سندات القبض (نقدي / شيك / بنك)</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('payment_voucher')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  <span>سندات الصرف</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('journal_entries')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>قيود اليومية العامة</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => { setActiveDropdown(null); onOpenYearClose(); }}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-amber-400"
                >
                  <Calendar className="w-4 h-4" />
                  <span>الإقفال السنوي ونقل الأرصدة</span>
                </button>
              </div>
            )}
          </div>

          {/* Menu 3: البطاقات والمخازن */}
          <div
            className="relative inline-flex items-center rounded-lg bg-slate-800/40 hover:bg-slate-800 transition"
            onMouseEnter={() => setActiveDropdown('cards')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => navigateTo('items')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-r-lg font-medium transition cursor-pointer ${
                activeDropdown === 'cards' || ['warehouses', 'items', 'customers', 'suppliers', 'stock_adjustments', 'warehouse_transfer'].includes(currentScreen)
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="فتح تكويد الأصناف والأسعار"
            >
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span>الأصناف والمخازن والجهات</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('cards');
              }}
              className={`px-1.5 py-2 rounded-l-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer border-r border-slate-700/50 ${
                activeDropdown === 'cards' ? 'bg-slate-800 text-emerald-400' : ''
              }`}
              title="خيارات الأصناف والمخازن والجهات"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'cards' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'cards' && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => navigateTo('items')}
                  className="w-full text-right px-4 py-2 hover:bg-emerald-950/60 flex items-center justify-between text-emerald-300 font-bold border-b border-slate-800 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>تكويد الأصناف والأسعار</span>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                    الأصناف
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('warehouses')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>تكويد المخازن والمستودعات</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('customers')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>تكويد العملاء والمندوبين</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('suppliers')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Truck className="w-4 h-4 text-orange-400" />
                  <span>تكويد الموردين</span>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => navigateTo('stock_adjustments')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <Sliders className="w-4 h-4 text-violet-400" />
                  <span>تسويات جردية للمخزون</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('warehouse_transfer')}
                  className="w-full text-right px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 text-slate-200"
                >
                  <ArrowLeftRight className="w-4 h-4 text-teal-400" />
                  <span>تحويل بضائع بين المخازن</span>
                </button>
              </div>
            )}
          </div>

          {/* Menu 4: فواتير المبيعات والمشتريات والعمليات */}
          <div
            className="relative inline-flex items-center rounded-lg bg-slate-800/40 hover:bg-slate-800 transition"
            onMouseEnter={() => setActiveDropdown('operations')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => navigateTo('operations_hub')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-r-lg font-medium transition cursor-pointer ${
                activeDropdown === 'operations' || ['operations_hub', 'sales_invoice', 'sales_return', 'purchase_invoice', 'purchase_return', 'stock_adjustments', 'warehouse_transfer'].includes(currentScreen)
                  ? 'bg-slate-800 text-teal-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="فتح مركز وسجل العمليات الشامل"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>الفواتير والعمليات</span>
              <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700/60 px-1.5 py-0.2 rounded-full font-bold font-mono">
                {salesInvoices.length + purchaseInvoices.length}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown('operations');
              }}
              className={`px-1.5 py-2 rounded-l-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer border-r border-slate-700/50 ${
                activeDropdown === 'operations' ? 'bg-slate-800 text-teal-400' : ''
              }`}
              title="خيارات الفواتير والعمليات"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'operations' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'operations' && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => navigateTo('operations_hub')}
                  className="w-full text-right px-4 py-2 hover:bg-teal-950/60 flex items-center justify-between text-teal-300 font-bold border-b border-slate-800 mb-1"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>مركز وسجل العمليات الشامل</span>
                  </div>
                  <span className="text-[10px] bg-teal-900/60 text-teal-200 px-1.5 py-0.5 rounded-full font-bold">
                    شامل
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('sales_invoice')}
                  className="w-full text-right px-4 py-1.5 hover:bg-slate-800 flex items-center justify-between text-emerald-300 font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>فاتورة مبيعات جديدة</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {salesInvoices.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('sales_return')}
                  className="w-full text-right px-4 py-1.5 hover:bg-slate-800 flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <span>مردودات مبيعات</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {salesReturns.length}
                  </span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => navigateTo('purchase_invoice')}
                  className="w-full text-right px-4 py-1.5 hover:bg-slate-800 flex items-center justify-between text-blue-300 font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-blue-400" />
                    <span>فاتورة مشتريات جديدة</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {purchaseInvoices.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('purchase_return')}
                  className="w-full text-right px-4 py-1.5 hover:bg-slate-800 flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>مردودات مشتريات</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {purchaseReturns.length}
                  </span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => navigateTo('stock_adjustments')}
                  className="w-full text-right px-4 py-1.5 hover:bg-slate-800 flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-violet-400" />
                    <span>تسويات جردية للمخزون</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {stockAdjustments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('warehouse_transfer')}
                  className="w-full text-right px-4 py-1.5 hover:bg-slate-800 flex items-center justify-between text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowLeftRight className="w-4 h-4 text-teal-400" />
                    <span>تحويل بين المخازن</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {warehouseTransfers.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Menu 5: التقارير والقوائم المالية */}
          <button
            type="button"
            onClick={() => navigateTo('reports')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
              currentScreen === 'reports'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>التقارير والقوائم المالية</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
