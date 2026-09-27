import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, Landmark, CreditCard, DollarSign, CheckCircle2, AlertCircle, Printer, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReceiptVoucher, VoucherPayType } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const ReceiptVoucherScreen: React.FC = () => {
  const {
    receiptVouchers,
    cashBanks,
    customers,
    accounts,
    salesInvoices,
    addReceiptVoucher,
    updateReceiptVoucher,
    deleteReceiptVoucher,
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
  const [customerId, setCustomerId] = useState('');
  const [accountCode, setAccountCode] = useState('1121');
  const [amount, setAmount] = useState(0);
  const [settledInvoices, setSettledInvoices] = useState<{ invoiceId: string; invoiceNo: string; paidAmount: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentVoucher = receiptVouchers[currentIndex];

  useEffect(() => {
    if (currentVoucher && !isNewMode) {
      setVoucherNo(currentVoucher.voucherNo);
      setDate(currentVoucher.date);
      setCashBankId(currentVoucher.cashBankId);
      setPayType(currentVoucher.payType);
      setCheckNumber(currentVoucher.checkNumber || '');
      setCheckDueDate(currentVoucher.checkDueDate || '');
      setTransferRefNumber(currentVoucher.transferRefNumber || '');
      setCustomerId(currentVoucher.customerId || '');
      setAccountCode(currentVoucher.accountCode);
      setAmount(currentVoucher.amount);
      setSettledInvoices(currentVoucher.settledInvoices || []);
      setNotes(currentVoucher.notes || '');
    }
  }, [currentVoucher, isNewMode]);

  // Open invoices for selected customer
  const openInvoices = customerId
    ? salesInvoices.filter(inv => inv.customerId === customerId && inv.remainingAmount > 0)
    : [];

  const handleCustomerSelect = (custId: string) => {
    setCustomerId(custId);
    if (custId) {
      setAccountCode('1121');
      setSettledInvoices([]);
    }
  };

  const handleSettleInvoiceChange = (invId: string, invNo: string, val: number) => {
    setSettledInvoices(prev => {
      const filtered = prev.filter(p => p.invoiceId !== invId);
      if (val > 0) {
        return [...filtered, { invoiceId: invId, invoiceNo: invNo, paidAmount: val }];
      }
      return filtered;
    });
  };

  const handleNew = () => {
    setIsNewMode(true);
    setVoucherNo(`RV-2026-000${receiptVouchers.length + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
    setCashBankId(cashBanks[0]?.id || '');
    setPayType('نقدي');
    setCheckNumber('');
    setCheckDueDate('');
    setTransferRefNumber('');
    setCustomerId(customers[0]?.id || '');
    setAccountCode('1121');
    setAmount(0);
    setSettledInvoices([]);
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!voucherNo.trim() || !cashBankId || Number(amount) <= 0) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رقم السند، الخزينة/البنك، ومبلغ أكبر من الصفر' });
      return;
    }

    const cb = cashBanks.find(c => c.id === cashBankId);
    const cust = customers.find(c => c.id === customerId);
    const acc = accounts.find(a => a.code === accountCode);

    const voucherData: ReceiptVoucher = {
      id: isNewMode ? 'rec-' + Date.now() : currentVoucher.id,
      voucherNo: voucherNo.trim(),
      date,
      cashBankId,
      cashBankName: cb?.name || 'الخزينة الرئيسية',
      payType,
      checkNumber: checkNumber.trim() || undefined,
      checkDueDate: checkDueDate || undefined,
      transferRefNumber: transferRefNumber.trim() || undefined,
      customerId: customerId || undefined,
      customerName: cust?.name || undefined,
      accountCode,
      accountName: cust ? `العميل - ${cust.name}` : acc?.nameAr || 'حساب عام',
      amount: Number(amount),
      settledInvoices: settledInvoices.length > 0 ? settledInvoices : undefined,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentVoucher.createdAt
    };

    if (isNewMode) {
      addReceiptVoucher(voucherData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ سند القبض (${voucherData.voucherNo}) بقيمة ${voucherData.amount.toLocaleString('ar-EG')} ج.م وتم إيداع المبلغ وتوليد القيد وإقفال الفواتير المحددة`
      });
    } else {
      updateReceiptVoucher(currentVoucher.id, voucherData);
      setStatusMessage({ type: 'success', text: `تم تحديث سند القبض (${voucherData.voucherNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentVoucher) return;
    if (confirm(`هل أنت متأكد من حذف سند القبض (${currentVoucher.voucherNo})؟`)) {
      deleteReceiptVoucher(currentVoucher.id);
      setStatusMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="إيصال وسند قبض نقدية / بنك" docNumber={voucherNo} date={date} />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة سندات القبض (نقدية / شيكات / تحويلات)</h1>
            <p className="text-xs text-slate-500">
              استلام دفعات وتحصيلات العملاء، قفل الفواتير الآجلة، وتسجيل القيود المحاسبية تلقائياً في الخزائن والبنوك
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(receiptVouchers.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(receiptVouchers.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('receipt_voucher', 'edit')}
        canDelete={canAccess('receipt_voucher', 'delete')}
        canPrint={canAccess('receipt_voucher', 'print')}
        searchPlaceholder="استدعاء سند قبض..."
        onSearchChange={val => {
          const idx = receiptVouchers.findIndex(r => r.voucherNo.includes(val) || (r.customerName && r.customerName.includes(val)));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50/40 rounded-xl border border-blue-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم سند القبض *</label>
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
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
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
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>الخزينة أو البنك المستلم *</span>
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
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>نوع الدفعة *</span>
            </label>
            <select
              value={payType}
              onChange={e => setPayType(e.target.value as VoucherPayType)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
            >
              <option value="نقدي">نقدي</option>
              <option value="شيك">شيك بنكي</option>
              <option value="تحويل بنكي">تحويل بنكي / إيداع</option>
            </select>
          </div>

          {/* Conditional for Check or Transfer */}
          {payType === 'شيك' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الشيك البنكي *</label>
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
              <label className="block font-bold text-slate-700 mb-1">رقم الحوالة أو الإيداع البنكي</label>
              <input
                type="text"
                value={transferRefNumber}
                onChange={e => setTransferRefNumber(e.target.value)}
                className="w-full text-sm font-mono border border-slate-300 rounded-lg p-2 bg-white"
                placeholder="TRF-REF-..."
              />
            </div>
          )}

          {/* Customer / Account Link */}
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">العميل المحصل منه</label>
            <select
              value={customerId}
              onChange={e => handleCustomerSelect(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold text-blue-900"
            >
              <option value="">(جهة أخرى أو اختر حساب من الشجرة أدناه)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} (رصيده المستحق: {c.currentBalance.toLocaleString('ar-EG')} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">أو الحساب المقابل في شجرة الحسابات</label>
            <select
              value={accountCode}
              onChange={e => {
                setAccountCode(e.target.value);
                setCustomerId('');
              }}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
            >
              {accounts.filter(a => !a.isParent).map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} - {a.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <label className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>المبلغ المقبوض بالكامل (ج.م) *</span>
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-48 text-xl font-bold font-mono border-2 border-emerald-500 rounded-xl p-2 text-left bg-white text-emerald-800"
              required
            />
          </div>
        </div>

        {/* Customer Open Invoices Settlement Box */}
        {customerId && openInvoices.length > 0 && (
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2 no-print">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>فواتير العميل المفتوحة (يمكنك قفل الفاتورة أو إدخال سداد جزئي للبواقي)</span>
            </h3>

            <div className="overflow-x-auto rounded-lg border border-amber-200">
              <table className="w-full text-right text-xs bg-white">
                <thead className="bg-amber-100/70 text-amber-900">
                  <tr>
                    <th className="p-2">رقم الفاتورة</th>
                    <th className="p-2">تاريخ الفاتورة</th>
                    <th className="p-2 text-left">قيمة الفاتورة</th>
                    <th className="p-2 text-left">المسدد سابقاً</th>
                    <th className="p-2 text-left text-rose-700">المتبقي (الباقي)</th>
                    <th className="p-2 text-center w-36">المبلغ المسدد الآن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {openInvoices.map(inv => {
                    const settled = settledInvoices.find(s => s.invoiceId === inv.id);
                    return (
                      <tr key={inv.id} className="hover:bg-amber-50/30">
                        <td className="p-2 font-mono font-bold">{inv.invoiceNo}</td>
                        <td className="p-2 text-slate-500">{inv.date}</td>
                        <td className="p-2 font-mono text-left">{inv.netTotal.toLocaleString('ar-EG')}</td>
                        <td className="p-2 font-mono text-left text-emerald-700">{inv.paidAmount.toLocaleString('ar-EG')}</td>
                        <td className="p-2 font-mono text-left font-bold text-rose-700">{inv.remainingAmount.toLocaleString('ar-EG')}</td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={inv.remainingAmount}
                            value={settled?.paidAmount || 0}
                            onChange={e => handleSettleInvoiceChange(inv.id, inv.invoiceNo, Number(e.target.value))}
                            className="w-28 text-xs font-bold border border-amber-300 rounded p-1 text-center font-mono"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">البيان والشرح</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2"
            placeholder="مثال: دفعة تحت حساب الفواتير / تحصيل نقدية بشيك..."
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
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            حفظ سند القبض
          </button>
        </div>
      </div>
    </div>
  );
};
