import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, Trash2, Printer, CheckCircle2, AlertCircle, Scale, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JournalEntry, JournalEntryLine } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const JournalEntriesScreen: React.FC = () => {
  const {
    journalEntries,
    accounts,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    canAccess
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [entryNo, setEntryNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState<any>('manual');
  const [sourceDocNo, setSourceDocNo] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentEntry = journalEntries[currentIndex];

  useEffect(() => {
    if (currentEntry && !isNewMode) {
      setEntryNo(currentEntry.entryNo);
      setDate(currentEntry.date);
      setDescription(currentEntry.description);
      setSourceType(currentEntry.sourceType);
      setSourceDocNo(currentEntry.sourceDocNo || '');
      setLines(currentEntry.lines);
    }
  }, [currentEntry, isNewMode]);

  const handleAddLine = () => {
    const firstAcc = accounts.find(a => !a.isParent) || accounts[0];
    const newLine: JournalEntryLine = {
      id: 'jel-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      accountCode: firstAcc.code,
      accountName: firstAcc.nameAr,
      debit: 0,
      credit: 0,
      notes: ''
    };
    setLines(prev => [...prev, newLine]);
  };

  const updateLine = (lineId: string, field: keyof JournalEntryLine, val: any) => {
    setLines(prev => {
      return prev.map(l => {
        if (l.id === lineId) {
          const upd = { ...l, [field]: val };
          if (field === 'accountCode') {
            const acc = accounts.find(a => a.code === val);
            if (acc) upd.accountName = acc.nameAr;
          }
          return upd;
        }
        return l;
      });
    });
  };

  const removeLine = (lineId: string) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
  };

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const diff = Math.abs(totalDebit - totalCredit);
    const isBalanced = diff < 0.01 && totalDebit > 0;
    return { totalDebit, totalCredit, diff, isBalanced };
  }, [lines]);

  const handleNew = () => {
    setIsNewMode(true);
    setEntryNo(`JV-2026-000${journalEntries.length + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setSourceType('manual');
    setSourceDocNo('');
    setLines([]);
    setStatusMessage(null);

    // Initial 2 lines for debit & credit
    setTimeout(() => {
      const acc1 = accounts.find(a => a.nature === 'debit' && !a.isParent) || accounts[0];
      const acc2 = accounts.find(a => a.nature === 'credit' && !a.isParent) || accounts[1];
      setLines([
        { id: 'jel-1', accountCode: acc1.code, accountName: acc1.nameAr, debit: 0, credit: 0, notes: '' },
        { id: 'jel-2', accountCode: acc2.code, accountName: acc2.nameAr, debit: 0, credit: 0, notes: '' }
      ]);
    }, 50);
  };

  const handleSave = () => {
    if (!entryNo.trim() || !description.trim() || lines.length < 2) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رقم القيد، البيان، وإدخال سطرين على الأقل' });
      return;
    }
    if (!totals.isBalanced) {
      setStatusMessage({ type: 'error', text: `القيد غير متوازن! الفارق بين المدين والدائن: ${totals.diff.toLocaleString('ar-EG')} ج.م` });
      return;
    }

    const entryData: JournalEntry = {
      id: isNewMode ? 'je-' + Date.now() : currentEntry.id,
      entryNo: entryNo.trim(),
      date,
      description: description.trim(),
      sourceType,
      sourceDocNo: sourceDocNo.trim() || undefined,
      lines,
      totalDebit: totals.totalDebit,
      totalCredit: totals.totalCredit,
      isBalanced: true,
      createdAt: isNewMode ? new Date().toISOString() : currentEntry.createdAt
    };

    if (isNewMode) {
      addJournalEntry(entryData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({ type: 'success', text: `تم حفظ قيد اليومية (${entryData.entryNo}) بنجاح والتأثير في ميزان المراجعة` });
    } else {
      updateJournalEntry(currentEntry.id, entryData);
      setStatusMessage({ type: 'success', text: `تم تحديث قيد اليومية (${entryData.entryNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentEntry) return;
    if (confirm(`هل أنت متأكد من حذف قيد اليومية (${currentEntry.entryNo})؟`)) {
      deleteJournalEntry(currentEntry.id);
      setStatusMessage({ type: 'success', text: 'تم حذف القيد بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="سند وقيد يومية عامة" docNumber={entryNo} date={date} />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة قيود اليومية العامة</h1>
            <p className="text-xs text-slate-500">
              تسجيل القيود اليدوية واستعراض القيود الآلية الناتجة عن كافة شاشات المنظومة مع فحص التوازن اللحظي
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(journalEntries.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(journalEntries.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('journal_entries', 'edit')}
        canDelete={canAccess('journal_entries', 'delete')}
        canPrint={canAccess('journal_entries', 'print')}
        searchPlaceholder="استدعاء رقم قيد أو بيان..."
        onSearchChange={val => {
          const idx = journalEntries.findIndex(j => j.entryNo.includes(val) || j.description.includes(val) || (j.sourceDocNo && j.sourceDocNo.includes(val)));
          if (idx !== -1) {
            setCurrentIndex(idx);
            setIsNewMode(false);
          }
        }}
      />

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        } no-print`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 print-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم القيد *</label>
            <input
              type="text"
              value={entryNo}
              onChange={e => setEntryNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>تاريخ القيد *</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">مصدر القيد</label>
            <select
              value={sourceType}
              onChange={e => setSourceType(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-semibold"
            >
              <option value="manual">قيد يدوي عام</option>
              <option value="sales">آلي من فاتورة مبيعات</option>
              <option value="sales_return">آلي من مردودات مبيعات</option>
              <option value="purchase">آلي من فاتورة مشتريات</option>
              <option value="receipt">آلي من سند قبض</option>
              <option value="payment">آلي من سند صرف</option>
              <option value="adjustment">آلي من تسوية جردية</option>
              <option value="year_close">قيد إقفال/افتتاحي سنوي</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم المستند المصدري</label>
            <input
              type="text"
              value={sourceDocNo}
              onChange={e => setSourceDocNo(e.target.value)}
              className="w-full text-sm font-mono border border-slate-300 rounded-lg p-2 bg-white"
              placeholder="مثال: INV-2026-0001"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block font-bold text-slate-700 mb-1">البيان والشرح العام للقيد *</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm font-bold border border-slate-300 rounded-lg p-2 bg-white"
              placeholder="شرح المعاملة المالية..."
              required
            />
          </div>
        </div>

        {/* Lines Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">أسطر القيد المحاسبي</h3>
            <button
              type="button"
              onClick={handleAddLine}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة طرف قيد</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5 w-10">م</th>
                  <th className="p-2.5 min-w-[240px]">الحساب (من شجرة الحسابات)</th>
                  <th className="p-2.5 w-32 text-left">مدين (Debit)</th>
                  <th className="p-2.5 w-32 text-left">دائن (Credit)</th>
                  <th className="p-2.5 min-w-[200px]">شرح وملاحظات السطر</th>
                  <th className="p-2.5 w-10 text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, idx) => (
                  <tr key={line.id}>
                    <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2.5">
                      <select
                        value={line.accountCode}
                        onChange={e => updateLine(line.id, 'accountCode', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white font-bold"
                      >
                        {accounts.filter(a => !a.isParent).map(a => (
                          <option key={a.code} value={a.code}>
                            {a.code} - {a.nameAr}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5 text-left">
                      <input
                        type="number"
                        min="0"
                        value={line.debit}
                        onChange={e => updateLine(line.id, 'debit', Number(e.target.value))}
                        className="w-28 text-xs font-mono font-bold border border-slate-300 rounded p-1 text-left text-emerald-800 bg-white"
                      />
                    </td>
                    <td className="p-2.5 text-left">
                      <input
                        type="number"
                        min="0"
                        value={line.credit}
                        onChange={e => updateLine(line.id, 'credit', Number(e.target.value))}
                        className="w-28 text-xs font-mono font-bold border border-slate-300 rounded p-1 text-left text-purple-800 bg-white"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={line.notes}
                        onChange={e => updateLine(line.id, 'notes', e.target.value)}
                        placeholder="ملاحظات السطر..."
                        className="w-full text-xs border border-slate-200 rounded p-1"
                      />
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black text-xs">
                  <td colSpan={2} className="p-2.5 text-center">الإجماليات</td>
                  <td className="p-2.5 font-mono text-left text-emerald-400">
                    {totals.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2.5 font-mono text-left text-purple-300">
                    {totals.totalCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="p-2.5 text-center">
                    {totals.isBalanced ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>القيد متوازن تماماً</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center justify-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>فارق عدم التوازن: {totals.diff.toLocaleString('ar-EG')} ج.م</span>
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
          >
            طباعة القيد
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!totals.isBalanced}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            حفظ وترحيل القيد
          </button>
        </div>
      </div>
    </div>
  );
};
