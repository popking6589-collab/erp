import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  Briefcase,
  Layers,
  UserCheck,
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  FileDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Activity,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PrintHeader } from '../common/PrintHeader';

export const SystemAdminScreen: React.FC = () => {
  const {
    company,
    currentUser,
    currentFiscalYear,
    fiscalYears,
    switchFiscalYear,
    closeCurrentYearAndOpenNew,
    resetAllTransactionsOnly,
    resetFactoryData,
    openResetModal,
    openYearCloseModal,
    setCurrentScreen,
    users,
    accounts,
    salesInvoices,
    purchaseInvoices,
    auditLogs
  } = useApp();

  // Reset confirmation state inside screen
  const [resetType, setResetType] = useState<'transactions' | 'factory'>('transactions');
  const [confirmInput, setConfirmInput] = useState('');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Year close state inside screen
  const [newYearInput, setNewYearInput] = useState(currentFiscalYear.year + 1);
  const [isConfirmingYearClose, setIsConfirmingYearClose] = useState(false);

  // Handle in-screen reset
  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = resetType === 'transactions' ? 'تأكيد الحذف' : 'إعادة تهيئة';
    if (confirmInput.trim() !== expected) {
      setStatusMsg({ type: 'error', text: `يرجى كتابة "${expected}" بدقة للتأكيد` });
      return;
    }

    if (resetType === 'transactions') {
      const res = resetAllTransactionsOnly();
      setStatusMsg({ type: res.success ? 'success' : 'error', text: res.message });
    } else {
      const res = resetFactoryData();
      setStatusMsg({ type: res.success ? 'success' : 'error', text: res.message });
    }
    setConfirmInput('');
    setIsConfirmingReset(false);
  };

  // Handle in-screen year close
  const handleExecuteYearClose = (e: React.FormEvent) => {
    e.preventDefault();
    const res = closeCurrentYearAndOpenNew(Number(newYearInput));
    setStatusMsg({ type: res.success ? 'success' : 'error', text: res.message });
    setIsConfirmingYearClose(false);
  };

  // Backup data to JSON file
  const handleExportBackup = () => {
    const backupObj: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ALBAYAN_ERP_')) {
        try {
          backupObj[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          backupObj[key] = localStorage.getItem(key);
        }
      }
    }
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_البيان_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'تم تصدير وتنزيل ملف النسخة الاحتياطية بنجاح' });
  };

  // Restore backup from JSON file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let count = 0;
        Object.entries(parsed).forEach(([k, v]) => {
          if (k.startsWith('ALBAYAN_ERP_')) {
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
            count++;
          }
        });
        setStatusMsg({ type: 'success', text: `تم استيراد ${count} جداول بنجاح! يرجى إعادة تحميل الصفحة لتطبيق التغييرات.` });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setStatusMsg({ type: 'error', text: 'فشل في قراءة ملف النسخة الاحتياطية. تأكد أنه ملف JSON صالح' });
      }
    };
    reader.readAsText(file);
  };

  const handlePrintPdf = () => {
    const prev = document.title;
    document.title = `تقرير_التهيئة_وإدارة_النظام_${company.name}_${new Date().toISOString().split('T')[0]}`;
    window.print();
    setTimeout(() => { document.title = prev; }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Printable Header */}
      <div className="print-only">
        <PrintHeader title="تقرير لوحة التهيئة والإدارة العامة والرقابة" docNumber="SYS-ADMIN" date={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Screen Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl shadow-lg shadow-blue-600/20">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">مركز التهيئة والإدارة العامة</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                لوحة الإدارة
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              التحكم الشامل في تهيئة النظام، إقفال السنوات المالية، تصفير الداتا وإعادة الضبط، والنسخ الاحتياطي
            </p>
          </div>
        </div>

        {/* Global Print & Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة التقرير</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* Alert or Status Message */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl font-bold flex items-center justify-between gap-2 shadow-sm ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        } no-print`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span className="text-sm">{statusMsg.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMsg(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 no-print">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold text-slate-500">حالة النظام</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>نشط وجاهز</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">قواعد بيانات محلية مشفرة</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-slate-500">السنة المالية الحالية</span>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {currentFiscalYear.year} {currentFiscalYear.isClosed ? '(مقفلة)' : '(نشطة)'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">تبدأ {currentFiscalYear.startDate}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold text-slate-500">المستخدمين المسجلين</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {users.length} مستخدم
          </div>
          <div className="text-[10px] text-indigo-700 font-bold">{users.filter(u => u.isAdmin).length} مسؤول نظام</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-slate-500">الحركات والعمليات</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {salesInvoices.length + purchaseInvoices.length} فاتورة
          </div>
          <div className="text-[10px] text-slate-400 font-medium">{accounts.length} حساب بدليل الحسابات</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold text-slate-500">سجل الرقابة (Audit)</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono">
            {auditLogs.length} حركة مدققة
          </div>
          <div className="text-[10px] text-slate-400 font-medium">تسجيل كامل للعمليات</div>
        </div>
      </div>

      {/* Main Admin Operations: Two Heavyweight Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: تصفير وحذف الداتا وإعادة تهيئة النظام */}
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-rose-100 text-rose-600 rounded-2xl">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">تصفير الداتا وإعادة تهيئة النظام</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                حذف الفواتير والعمليات مع الحفاظ على الدليل المحاسبي والبطاقات، أو استعادة ضبط المصنع الكامل
              </p>
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>حدد نوع إعادة التهيئة المطلوب:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setResetType('transactions'); setIsConfirmingReset(false); }}
                className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                  resetType === 'transactions'
                    ? 'bg-white border-rose-500 text-rose-900 shadow-sm ring-2 ring-rose-200'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="font-black mb-1">1. حذف العمليات والفواتير فقط</div>
                <div className="text-[11px] font-normal text-slate-500">
                  تصفير الفواتير والحركات المالية والمخزنية مع بقاء الدليل الحسابي والعملاء والموردين والأصناف
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setResetType('factory'); setIsConfirmingReset(false); }}
                className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                  resetType === 'factory'
                    ? 'bg-white border-rose-500 text-rose-900 shadow-sm ring-2 ring-rose-200'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="font-black mb-1">2. استعادة ضبط المصنع الكامل</div>
                <div className="text-[11px] font-normal text-slate-500">
                  حذف كامل للبيانات واسترجاع النسخة التجريبية الأولى بكافة بطاقاتها وحساباتها
                </div>
              </button>
            </div>
          </div>

          {!isConfirmingReset ? (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingReset(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>بدء عملية التهيئة ({resetType === 'transactions' ? 'حذف العمليات' : 'ضبط المصنع'})</span>
              </button>

              <button
                type="button"
                onClick={openResetModal}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                فتح النافذة المنبثقة التفصيلية
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteReset} className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 animate-in fade-in">
              <div className="text-xs text-rose-300 font-bold">
                ⚠️ لتأكيد العملية نهائياً، يرجى كتابة <span className="text-white underline font-mono font-black">{resetType === 'transactions' ? 'تأكيد الحذف' : 'إعادة تهيئة'}</span> أدناه:
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                  placeholder={resetType === 'transactions' ? 'اكتب: تأكيد الحذف' : 'اكتب: إعادة تهيئة'}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  تنفيذ نهائي
                </button>
                <button
                  type="button"
                  onClick={() => { setIsConfirmingReset(false); setConfirmInput(''); }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card 2: الإقفال السنوي المحاسبي ونقل الأرصدة */}
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-amber-100 text-amber-700 rounded-2xl">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">الإقفال السنوي ونقل الأرصدة الافتتاحية</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إقفال أرباح وخسائر السنة المالية الحالية وترحيل الأرصدة الختامية كأرصدة افتتاحية للعام الجديد
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">السنة المالية النشطة الحالية:</span>
              <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                {currentFiscalYear.year} ({currentFiscalYear.isClosed ? 'مقفلة' : 'نشطة'})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">السنوات المالية المسجلة:</span>
              <div className="flex gap-1.5 font-mono">
                {fiscalYears.map(fy => (
                  <button
                    key={fy.id}
                    type="button"
                    onClick={() => switchFiscalYear(fy.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      fy.id === currentFiscalYear.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fy.year}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              عند الإقفال: يتم إقفال حسابات الإيرادات والمصروفات، احتساب صافي الربح في الأرباح المرحلة، ونقل أرصدة الأصول والخصوم كقيد افتتاحي آلي بالعام الجديد.
            </p>
          </div>

          {!isConfirmingYearClose ? (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingYearClose(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>إقفال عام {currentFiscalYear.year} وفتح عام {currentFiscalYear.year + 1}</span>
              </button>

              <button
                type="button"
                onClick={openYearCloseModal}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                فتح نافذة المعاينة والقيد الافتتاحي
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteYearClose} className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 animate-in fade-in">
              <div className="text-xs text-amber-300 font-bold">
                تأكيد فتح السنة المالية الجديدة ونقل الأرصدة:
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newYearInput}
                  onChange={e => setNewYearInput(Number(e.target.value))}
                  className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  اعتماد الإقفال الآن
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingYearClose(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Setup Cards Navigation Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 no-print">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>شاشات وبطاقات التهيئة الأساسية للمنشأة</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setCurrentScreen('company')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-right transition cursor-pointer group flex items-start gap-3"
          >
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 group-hover:text-blue-700 text-sm">بيانات وشعار الشركة</div>
              <div className="text-[11px] text-slate-500 mt-0.5">الهوية المؤسسية والسجل والضرائب</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('users')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 text-right transition cursor-pointer group flex items-start gap-3"
          >
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 group-hover:text-rose-700 text-sm">المستخدمين والصلاحيات</div>
              <div className="text-[11px] text-slate-500 mt-0.5">كلمات المرور والصلاحيات التفصيلية</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('employees')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-right transition cursor-pointer group flex items-start gap-3"
          >
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 group-hover:text-purple-700 text-sm">تكويد الموظفين والمندوبين</div>
              <div className="text-[11px] text-slate-500 mt-0.5">الرواتب والصور وربطهم بالمبيعات</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCurrentScreen('jobs')}
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-right transition cursor-pointer group flex items-start gap-3"
          >
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-sm">تكويد الوظائف والأقسام</div>
              <div className="text-[11px] text-slate-500 mt-0.5">الهيكل الإداري والمسميات الوظيفية</div>
            </div>
          </button>
        </div>
      </div>

      {/* Backup, Restore & Audit Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Backup and Restore Box */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">النسخ الاحتياطي واستعادة البيانات</h3>
              <p className="text-[11px] text-slate-500">تصدير قاعدة البيانات محلياً كملف JSON واستعادتها بأي وقت</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/10 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل نسخة احتياطية كاملة (Backup JSON)</span>
            </button>

            <div className="relative">
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>استرجاع نسخة احتياطية من ملف (Restore JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Audit Log Quick View */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">سجل الرقابة الإدارية والأمان (أحدث العمليات)</h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentScreen('reports')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              تقرير التدقيق الكامل
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="p-2">الوقت والتاريخ</th>
                  <th className="p-2">المستخدم</th>
                  <th className="p-2">الشاشة</th>
                  <th className="p-2">البيان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.slice(0, 10).map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-2 font-bold text-slate-800 whitespace-nowrap">{log.userName}</td>
                    <td className="p-2 text-indigo-700 whitespace-nowrap">{log.screen}</td>
                    <td className="p-2 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
