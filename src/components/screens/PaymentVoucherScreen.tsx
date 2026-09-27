import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Landmark, DollarSign, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentVoucher, VoucherPayType } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const PaymentVoucherScreen: React.FC = () => {
  const {
    paymentVouchers,
    cashBanks,
    suppliers,
    accounts,
    addPaymentVoucher,
    updatePaymentVoucher,
    deletePaymentVoucher,
    canAccess
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cashBankId, setCashBankId] = useState('');
  const [payType, setPayType] = useState<VoucherPayType>('نقدي');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkDueDate, setCheckDueDate] = useState('');
  const [transferRefNumber, setTransferRefNumber] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [accountCode, setAccountCode] = useState('2111');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentVoucher = paymentVouchers[currentIndex];

  useEffect(() => {
    if (currentVoucher && !isNewMode) {
      setVoucherNo(currentVoucher.voucherNo);
      setDate(currentVoucher.date);
      setCashBankId(currentVoucher.cashBankId);
      setPayType(currentVoucher.payType);
      setCheckNumber(currentVoucher.checkNumber || '');
      setCheckDueDate(currentVoucher.checkDueDate || '');
      setTransferRefNumber(currentVoucher.transferRefNumber || '');
      setSupplierId(currentVoucher.supplierId || '');
      setAccountCode(currentVoucher.accountCode);
      setAmount(currentVoucher.amount);
      setNotes(currentVoucher.notes || '');
    }
  }, [currentVoucher, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setVoucherNo(`PV-2026-000${paymentVouchers.length + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
    setCashBankId(cashBanks[0]?.id || '');
    setPayType('نقدي');
    setCheckNumber('');
    setCheckDueDate('');
    setTransferRefNumber('');
    setSupplierId(suppliers[0]?.id || '');
    setAccountCode('2111');
    setAmount(0);
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!voucherNo.trim() || !cashBankId || Number(amount) <= 0) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رقم السند، الخزينة/البنك، ومبلغ أكبر من الصفر' });
      return;
    }

    const cb = cashBanks.find(c => c.id === cashBankId);
    const supp = suppliers.find(s => s.id === supplierId);
    const acc = accounts.find(a => a.code === accountCode);

    const voucherData: PaymentVoucher = {
      id: isNewMode ? 'pay-' + Date.now() : currentVoucher.id,
      voucherNo: voucherNo.trim(),
      date,
      cashBankId,
      cashBankName: cb?.name || 'الخزينة الرئيسية',
      payType,
      checkNumber: checkNumber.trim() || undefined,
      checkDueDate: checkDueDate || undefined,
      transferRefNumber: transferRefNumber.trim() || undefined,
      supplierId: supplierId || undefined,
      supplierName: supp?.name || undefined,
      accountCode,
      accountName: supp ? `المورد - ${supp.name}` : acc?.nameAr || 'حساب عام',
      amount: Number(amount),
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentVoucher.createdAt
    };

    if (isNewMode) {
      addPaymentVoucher(voucherData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ سند الصرف (${voucherData.voucherNo}) بقيمة ${voucherData.amount.toLocaleString('ar-EG')} ج.م وصرف المبلغ وتوليد القيد المحاسبي فوراً`
      });
    } else {
      updatePaymentVoucher(currentVoucher.id, voucherData);
      setStatusMessage({ type: 'success', text: `تم تحديث سند الصرف (${voucherData.voucherNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentVoucher) return;
    if (confirm(`هل أنت متأكد من حذف سند الصرف (${currentVoucher.voucherNo})؟`)) {
      deletePaymentVoucher(currentVoucher.id);
      setStatusMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="إذن وسند صرف نقدية / بنك" docNumber={voucherNo} date={date} />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md shadow-rose-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة سندات الصرف (نقدية / شيكات / تحويلات)</h1>
            <p className="text-xs text-slate-500">
              صرف دفعات الموردين، المصروفات، سداد الشيكات والتسجيل الآلي في القيود اليومية وشجرة الحسابات
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(paymentVouchers.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(paymentVouchers.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('payment_voucher', 'edit')}
        canDelete={canAccess('payment_voucher', 'delete')}
        canPrint={canAccess('payment_voucher', 'print')}
        searchPlaceholder="استدعاء سند صرف..."
        onSearchChange={val => {
          const idx = paymentVouchers.findIndex(p => p.voucherNo.includes(val) || (p.supplierName && p.supplierName.includes(val)));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-rose-50/40 rounded-xl border border-rose-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم سند الصرف *</label>
            <input
              type="text"
              value={voucherNo}
              onChange={e => setVoucherNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>تاريخ السند *</span>
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
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              <span>الخزينة أو البنك المصروف منه *</span>
            </label>
            <select
              value={cashBankId}
              onChange={e => setCashBankId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
              required
            >
              {cashBanks.map(cb => (
                <option key={cb.id} value={cb.id}>{cb.name} ({cb.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>طريقة الصرف *</span>
            </label>
            <select
              value={payType}
              onChange={e => setPayType(e.target.value as VoucherPayType)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
            >
              <option value="نقدي">نقدي</option>
              <option value="شيك">شيك بنكي</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
          </div>

          {payType === 'شيك' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الشيك *</label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={e => setCheckNumber(e.target.value)}
                  className="w-full text-sm font-mono border border-slate-300 rounded-lg p-2 bg-white"
                  placeholder="CHQ-..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ استحقاق الشيك *</label>
                <input
                  type="date"
                  value={checkDueDate}
                  onChange={e => setCheckDueDate(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>
            </>
          )}

          {payType === 'تحويل بنكي' && (
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">رقم التحويل البنكي</label>
              <input
                type="text"
                value={transferRefNumber}
                onChange={e => setTransferRefNumber(e.target.value)}
                className="w-full text-sm font-mono border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">المورد المصروف له</label>
            <select
              value={supplierId}
              onChange={e => {
                setSupplierId(e.target.value);
                if (e.target.value) setAccountCode('2111');
              }}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold text-orange-950"
            >
              <option value="">(أو اختر حساب مصروفات / أصول من الشجرة أدناه)</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name} (مستحق له: {s.currentBalance.toLocaleString('ar-EG')} ج.م)</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">الحساب المدين المقابل في شجرة الحسابات</label>
            <select
              value={accountCode}
              onChange={e => {
                setAccountCode(e.target.value);
                setSupplierId('');
              }}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
            >
              {accounts.filter(a => !a.isParent).map(a => (
                <option key={a.code} value={a.code}>{a.code} - {a.nameAr}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
            <label className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-rose-600" />
              <span>المبلغ المصروف بالكامل (ج.م) *</span>
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-48 text-xl font-bold font-mono border-2 border-rose-500 rounded-xl p-2 text-left bg-white text-rose-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">البيان والشرح</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2"
            placeholder="مثال: سداد دفعة توريد بضاعة / إيجار المقر..."
          />
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السند</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            حفظ سند الصرف
          </button>
        </div>
      </div>
    </div>
  );
};
