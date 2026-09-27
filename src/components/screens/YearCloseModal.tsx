import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, X, ShieldAlert, ArrowLeft, TrendingUp, TrendingDown, Scale, BookOpen, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface YearCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YearCloseModal: React.FC<YearCloseModalProps> = ({ isOpen, onClose }) => {
  const { currentFiscalYear, closeCurrentYearAndOpenNew, journalEntries, accounts } = useApp();

  const nextYearDefault = (currentFiscalYear?.year || 2026) + 1;
  const [targetYear, setTargetYear] = useState(nextYearDefault);
  const [confirmText, setConfirmText] = useState('');
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Live accounting calculations for the closing fiscal year
  const financialSummary = useMemo(() => {
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
    const balanceSheetAccountsCount = accounts.filter(a => a.statement === 'balance_sheet' && !a.isParent).length;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      balanceSheetAccountsCount,
      isProfit: netProfit >= 0
    };
  }, [journalEntries, accounts]);

  if (!isOpen) return null;

  const handleExecuteClose = () => {
    if (confirmText.trim() !== 'إقفال') {
      alert('يرجى كتابة كلمة "إقفال" في الحقل لتأكيد العملية الحساسة');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = closeCurrentYearAndOpenNew(Number(targetYear));
      setIsProcessing(false);
      setResultMsg({ success: res.success, text: res.message });
      setConfirmText('');
    }, 400);
  };

  const handleClose = () => {
    setResultMsg(null);
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in no-print">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg">التهيئة والإدارة - الإقفال السنوي المحاسبي</h2>
              <p className="text-xs text-amber-100 mt-0.5">
                إقفال السنة المالية ({currentFiscalYear?.year || 2026}) وترحيل صافي النتيجة وافتتاح سنة جديدة ({targetYear})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-amber-200 hover:text-white p-1 rounded-xl transition cursor-pointer hover:bg-amber-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {resultMsg ? (
            <div className={`p-5 rounded-2xl border ${
              resultMsg.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            } space-y-4`}>
              <div className="flex items-center gap-2.5 font-black text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>تم إتمام الإقفال السنوي وافتتاح العام الجديد بنجاح!</span>
              </div>
              <p className="text-xs leading-relaxed font-semibold">{resultMsg.text}</p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  إغلاق ومتابعة العمل بالسنة الجديدة {targetYear}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Financial Snapshot Before Closing */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-slate-700 block text-xs">
                  ملخص المركز المالي للسنة المالية الحالية ({currentFiscalYear?.year}):
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block font-semibold">إجمالي الإيرادات (4)</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {financialSummary.totalRevenue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block font-semibold">إجمالي المصروفات (5)</span>
                    <span className="text-xs font-mono font-bold text-rose-700">
                      {financialSummary.totalExpenses.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    financialSummary.isProfit ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                  }`}>
                    <span className="text-[10px] block font-semibold text-slate-600">
                      {financialSummary.isProfit ? 'صافي أرباح العام' : 'صافي خسائر العام'}
                    </span>
                    <span className={`text-xs font-mono font-black ${
                      financialSummary.isProfit ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                      {Math.abs(financialSummary.netProfit).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 pt-1 flex items-center justify-between border-t border-slate-200/80">
                  <span>حساب الترحيل: <strong>32 - الأرباح والخسائر المحتجزة</strong></span>
                  <span>الأرصدة المنقولة: <strong>{financialSummary.balanceSheetAccountsCount} حساب ميزانية</strong></span>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>خطوات العملية الآلية عند تنفيذ الإقفال:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px] leading-relaxed pr-1">
                  <li>إقفال السنة الحالية ({currentFiscalYear?.year}) ومنع التعديل اليدوي عليها.</li>
                  <li>ترحيل صافي النتيجة المالية إلى حساب الأرباح المحتجزة.</li>
                  <li>توليد القيد الافتتاحي المتوازن رقم <strong className="font-mono">JV-{targetYear}-0001</strong> في العام الجديد.</li>
                  <li>نقل أرصدة العملاء والموردين والخزائن والمخزون كأرصدة افتتاحية جديدة.</li>
                  <li>يمكنك دوماً التبديل بين السنوات المالية السابقة ومراجعتها من القائمة العلوية.</li>
                </ul>
              </div>

              {/* Form Input for New Year */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السنة المالية الحالية:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentFiscalYear?.year || 2026} (نشطة)`}
                    className="w-full text-center font-bold border border-slate-300 rounded-xl p-2.5 bg-slate-100 text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السنة المالية الجديدة المراد فتحها:
                  </label>
                  <input
                    type="number"
                    value={targetYear}
                    onChange={e => setTargetYear(Number(e.target.value))}
                    className="w-full text-center text-base font-black font-mono border-2 border-amber-500 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
              </div>

              {/* Safety Confirmation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  لتأكيد الإقفال السنوي، يرجى كتابة كلمة{' '}
                  <span className="text-amber-700 font-mono font-black underline">"إقفال"</span> أدناه:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder='اكتب هنا: إقفال'
                  className="w-full text-sm font-bold border-2 border-slate-300 focus:border-amber-600 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500/20 text-center bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  onClick={handleExecuteClose}
                  disabled={confirmText.trim() !== 'إقفال' || isProcessing}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-bold rounded-xl transition shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? (
                    <span>جاري ترحيل الأرصدة...</span>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>تنفيذ الإقفال وترحيل الأرصدة لعام {targetYear}</span>
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
