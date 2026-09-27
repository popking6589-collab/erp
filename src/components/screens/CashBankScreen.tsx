import React, { useState, useEffect } from 'react';
import { Landmark, Wallet, CreditCard, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashBank, CashBankType } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const CashBankScreen: React.FC = () => {
  const { cashBanks, accounts, addCashBank, updateCashBank, deleteCashBank, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CashBankType>('خزينة نقدية');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [linkedAccountCode, setLinkedAccountCode] = useState('1111');
  const [notes, setNotes] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentCb = cashBanks[currentIndex];

  useEffect(() => {
    if (currentCb && !isNewMode) {
      setCode(currentCb.code);
      setName(currentCb.name);
      setType(currentCb.type);
      setAccountNumber(currentCb.accountNumber || '');
      setBankBranch(currentCb.bankBranch || '');
      setOpeningBalance(currentCb.openingBalance);
      setLinkedAccountCode(currentCb.linkedAccountCode || '1111');
      setNotes(currentCb.notes || '');
    }
  }, [currentCb, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`CB-0${cashBanks.length + 1}`);
    setName('');
    setType('خزينة نقدية');
    setAccountNumber('');
    setBankBranch('');
    setOpeningBalance(0);
    setLinkedAccountCode('1111');
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال الكود والاسم' });
      return;
    }

    const cbData: CashBank = {
      id: isNewMode ? 'cb-' + Date.now() : currentCb.id,
      code: code.trim(),
      name: name.trim(),
      type,
      accountNumber: accountNumber.trim() || undefined,
      bankBranch: bankBranch.trim() || undefined,
      openingBalance: Number(openingBalance) || 0,
      currentBalance: isNewMode ? Number(openingBalance) || 0 : currentCb.currentBalance,
      linkedAccountCode,
      notes: notes.trim() || undefined
    };

    if (isNewMode) {
      if (cashBanks.some(c => c.code === cbData.code)) {
        setStatusMessage({ type: 'error', text: 'الكود مسجل مسبقاً' });
        return;
      }
      addCashBank(cbData);
      setIsNewMode(false);
      setCurrentIndex(cashBanks.length);
      setStatusMessage({ type: 'success', text: `تم حفظ (${cbData.name}) بنجاح` });
    } else {
      updateCashBank(currentCb.id, cbData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات (${name})` });
    }
  };

  const handleDelete = () => {
    if (!currentCb) return;
    if (cashBanks.length <= 1) {
      setStatusMessage({ type: 'error', text: 'يجب أن تحتوي المنظومة على خزينة أو حساب بنكي واحد على الأقل' });
      return;
    }
    if (confirm(`هل أنت متأكد من حذف (${currentCb.name})؟`)) {
      deleteCashBank(currentCb.id);
      setStatusMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleSearch = (val: string) => {
    const idx = cashBanks.findIndex(c => c.code.toLowerCase().includes(val.toLowerCase()) || c.name.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل الخزائن النقدية والحسابات البنكية" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد الخزينة أو البنك</h1>
            <p className="text-xs text-slate-500">
              تكويد حسابات النقدية بالخزائن والحسابات الجارية بالبنوك وربطها التلقائي بشجرة الحسابات وسندات القبض والصرف
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(cashBanks.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(cashBanks.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('cash_bank', 'edit')}
        canDelete={canAccess('cash_bank', 'delete')}
        canPrint={canAccess('cash_bank', 'print')}
        searchPlaceholder="استدعاء خزينة أو بنك..."
        onSearchChange={handleSearch}
      />

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        } no-print`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form Details Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {isNewMode ? 'تكويد حساب خزينة / بنك جديد' : `بيانات: ${name}`}
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              كود: {code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود الحساب *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="CB-01"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الحساب *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as CashBankType)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-bold"
              >
                <option value="خزينة نقدية">خزينة نقدية (عهدة)</option>
                <option value="حساب بنكي">حساب بنكي جاري</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخزينة أو البنك *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: الخزينة الرئيسية - البنك الأهلي المصري جاري"
                required
              />
            </div>

            {/* Linked Account in Chart of Accounts */}
            <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                الحساب المقابل في شجرة الحسابات *
              </label>
              <select
                value={linkedAccountCode}
                onChange={e => setLinkedAccountCode(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
              >
                {accounts
                  .filter(a => a.category === 'asset' && !a.isParent)
                  .map(a => (
                    <option key={a.code} value={a.code}>
                      {a.code} - {a.nameAr}
                    </option>
                  ))}
              </select>
            </div>

            {type === 'حساب بنكي' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الحساب البنكي / الآيبان</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    dir="ltr"
                    className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-left"
                    placeholder="EG..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفرع</label>
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={e => setBankBranch(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                    placeholder="فرع التجمع الخامس"
                  />
                </div>
              </>
            )}

            <div className={type === 'حساب بنكي' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>الرصيد الافتتاحي (ج.م)</span>
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={e => setOpeningBalance(Number(e.target.value))}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between no-print">
            {!isNewMode && currentCb && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                الرصيد الحالي المتوفر: {currentCb.currentBalance.toLocaleString('ar-EG')} ج.م
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات الحساب
            </button>
          </div>
        </div>

        {/* List Table Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">الخزائن والحسابات البنكية ({cashBanks.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">الاسم</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5 text-left">الرصيد الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashBanks.map((cb, idx) => (
                  <tr
                    key={cb.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-emerald-50/80 font-bold text-emerald-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 font-mono">{cb.code}</td>
                    <td className="p-2.5">{cb.name}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cb.type === 'خزينة نقدية' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cb.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-left font-bold text-emerald-800">
                      {cb.currentBalance.toLocaleString('ar-EG')} ج.م
                    </td>
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
