import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Trash2, CheckCircle2, X, ShieldAlert, Database, RefreshCw, FileText, ShoppingCart, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemResetModal: React.FC<SystemResetModalProps> = ({ isOpen, onClose }) => {
  const {
    salesInvoices,
    salesReturns,
    purchaseInvoices,
    purchaseReturns,
    journalEntries,
    receiptVouchers,
    paymentVouchers,
    stockAdjustments,
    warehouseTransfers,
    customers,
    suppliers,
    items,
    accounts,
    resetAllTransactionsOnly,
    resetFactoryData
  } = useApp();

  const [resetMode, setResetMode] = useState<'transactions' | 'factory'>('transactions');
  const [confirmInput, setConfirmInput] = useState('');
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const requiredConfirmText = resetMode === 'transactions' ? 'تأكيد الحذف' : 'إعادة تهيئة';

  const handleExecute = () => {
    if (confirmInput.trim() !== requiredConfirmText) {
      alert(`يرجى كتابة "${requiredConfirmText}" بدقة لتأكيد العملية`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      let res;
      if (resetMode === 'transactions') {
        res = resetAllTransactionsOnly();
      } else {
        res = resetFactoryData();
      }
      setIsProcessing(false);
      setResultMsg({ success: res.success, text: res.message });
      setConfirmInput('');
    }, 400);
  };

  const handleClose = () => {
    setResultMsg(null);
    setConfirmInput('');
    onClose();
  };

  const totalTransactionsCount =
    salesInvoices.length +
    salesReturns.length +
    purchaseInvoices.length +
    purchaseReturns.length +
    journalEntries.length +
    receiptVouchers.length +
    paymentVouchers.length +
    stockAdjustments.length +
    warehouseTransfers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg">التهيئة والإدارة - حذف الداتا وإعادة تهيئة النظام</h2>
              <p className="text-xs text-rose-100 mt-0.5">تصفير الحركات والعمليات المالية أو استعادة ضبط المصنع الشامل</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-rose-200 hover:text-white p-1 rounded-xl transition cursor-pointer hover:bg-rose-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {resultMsg ? (
            <div className={`p-5 rounded-2xl border ${
              resultMsg.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            } space-y-4`}>
              <div className="flex items-center gap-2.5 font-black text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>تم إتمام عملية إعادة التهيئة بنجاح!</span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">{resultMsg.text}</p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  إغلاق ومتابعة العمل
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Option Mode Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setResetMode('transactions'); setConfirmInput(''); }}
                  className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                    resetMode === 'transactions'
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                      <span>1. تصفير الحركات والعمليات المالية</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">موصى به</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    حذف الفواتير والسندات والقيود المحاسبية وتصفير الأرصدة <strong>مع الحفاظ الكامل</strong> على شجرة الحسابات والعملاء والموردين والأصناف والمخازن.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => { setResetMode('factory'); setConfirmInput(''); }}
                  className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                    resetMode === 'factory'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-rose-600" />
                      <span>2. حذف جميع الداتا (ضبط المصنع)</span>
                    </span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.5 rounded">شامل</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    مسح كافة البيانات وإعادة النظام إلى نسخته الأولية الافتراضية لمنظومة البيان (حذف شامل لكافة التعديلات).
                  </p>
                </button>
              </div>

              {/* Data Counters Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <span className="font-bold text-slate-700 block text-[11px]">
                  سجل البيانات المتأثرة بعملية الحذف ({totalTransactionsCount} معاملة):
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">فواتير المبيعات والمرتجع</span>
                    <span className="font-bold text-slate-800 text-xs">{salesInvoices.length + salesReturns.length}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">فواتير الشراء والمرتجع</span>
                    <span className="font-bold text-slate-800 text-xs">{purchaseInvoices.length + purchaseReturns.length}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">قيود اليومية العامة</span>
                    <span className="font-bold text-slate-800 text-xs">{journalEntries.length}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">سندات القبض والصرف</span>
                    <span className="font-bold text-slate-800 text-xs">{receiptVouchers.length + paymentVouchers.length}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">حركات المخازن والتسويات</span>
                    <span className="font-bold text-slate-800 text-xs">{stockAdjustments.length + warehouseTransfers.length}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="text-slate-500 block text-[10px]">الأرصدة الحالية</span>
                    <span className="font-bold text-amber-700 text-xs">تصفير / إعادة افتتاح</span>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                resetMode === 'transactions'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>تحذير أمني هام: هذه العملية لا يمكن التراجع عنها بعد التنفيذ!</span>
                </div>
                <p className="text-[11px] leading-relaxed pr-6">
                  {resetMode === 'transactions'
                    ? 'سيتم حذف وتصفير جميع الفواتير والحركات المالية نهائياً للبدء بدورة محاسبية جديدة نظيفة، بينما تبقى بيانات الشركة والموظفين والعملاء والموردين والأصناف محفوظة بالكامل.'
                    : 'سيتم مسح جميع البيانات بدون استثناء واستعادة البيانات الأولية الخام لمنظومة البيان.'}
                </p>
              </div>

              {/* Safety Confirmation Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  لتأكيد التنفيذ، يرجى كتابة العبارة التالية بدقة في الحقل أدناه:{' '}
                  <span className="text-rose-600 font-mono font-black underline">"{requiredConfirmText}"</span>
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={e => setConfirmInput(e.target.value)}
                  placeholder={`اكتب هنا: ${requiredConfirmText}`}
                  className="w-full text-center font-bold text-sm border-2 border-slate-300 focus:border-rose-600 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء التراجع
                </button>

                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={confirmInput.trim() !== requiredConfirmText || isProcessing}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span>جاري التنفيذ...</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{resetMode === 'transactions' ? 'تأكيد تصفير الحركات والعمليات' : 'تأكيد ضبط المصنع الكامل'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
