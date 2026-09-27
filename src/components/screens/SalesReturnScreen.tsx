import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Plus, Trash2, Printer, CheckCircle2, AlertCircle, Calendar, Warehouse, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SalesReturn, InvoiceItem, InvoicePayment, PaymentMethod } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';
import { PrintModal } from '../common/PrintModal';

export const SalesReturnScreen: React.FC = () => {
  const {
    salesReturns,
    salesInvoices,
    warehouses,
    customers,
    items,
    cashBanks,
    addSalesReturn,
    updateSalesReturn,
    deleteSalesReturn,
    canAccess,
    selectedOperationTarget,
    setSelectedOperationTarget
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [returnNo, setReturnNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [salesRepEmployeeId, setSalesRepEmployeeId] = useState('');
  const [salesRepName, setSalesRepName] = useState('');

  const [returnItems, setReturnItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentReturn = salesReturns[currentIndex];

  useEffect(() => {
    if (currentReturn && !isNewMode) {
      setReturnNo(currentReturn.returnNo);
      setInvoiceNo(currentReturn.invoiceNo || '');
      setDate(currentReturn.date);
      setWarehouseId(currentReturn.warehouseId);
      setCustomerId(currentReturn.customerId);
      setSalesRepEmployeeId(currentReturn.salesRepEmployeeId);
      setSalesRepName(currentReturn.salesRepName);
      setReturnItems(currentReturn.items);
      setPayments(currentReturn.payments || []);
      setNotes(currentReturn.notes || '');
    }
  }, [currentReturn, isNewMode]);

  // Target specific return if selected from Operations Hub or Navigation
  useEffect(() => {
    if (selectedOperationTarget && selectedOperationTarget.screen === 'sales_return') {
      const idx = salesReturns.findIndex(ret =>
        (selectedOperationTarget.id && ret.id === selectedOperationTarget.id) ||
        (selectedOperationTarget.invoiceNo && ret.returnNo === selectedOperationTarget.invoiceNo)
      );
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsNewMode(false);
      }
      setSelectedOperationTarget(null);
    }
  }, [selectedOperationTarget, salesReturns, setSelectedOperationTarget]);

  // Load items from sales invoice if chosen
  const handleLoadInvoice = (invNum: string) => {
    setInvoiceNo(invNum);
    const foundInv = salesInvoices.find(i => i.invoiceNo === invNum);
    if (foundInv) {
      setCustomerId(foundInv.customerId);
      setWarehouseId(foundInv.warehouseId);
      setSalesRepEmployeeId(foundInv.salesRepEmployeeId);
      setSalesRepName(foundInv.salesRepName);
      setReturnItems(foundInv.items.map(item => ({ ...item, id: 'ret-item-' + Math.random().toString(36).substring(2, 6) })));
      setStatusMessage({ type: 'success', text: `تم استدعاء أصناف الفاتورة (${invNum}) بنجاح` });
    }
  };

  const handleAddItemRow = () => {
    const itemObj = items[0];
    if (!itemObj) return;
    const newItem: InvoiceItem = {
      id: 'ret-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      itemId: itemObj.id,
      itemCode: itemObj.code,
      itemName: itemObj.name,
      quantity: 1,
      unitPrice: itemObj.sellingPrice,
      total: itemObj.sellingPrice,
      discountPercent: 0,
      discountAmount: 0,
      net: itemObj.sellingPrice
    };
    setReturnItems(prev => [...prev, newItem]);
  };

  const updateItemRow = (rowId: string, field: keyof InvoiceItem, val: any) => {
    setReturnItems(prev => {
      return prev.map(item => {
        if (item.id === rowId) {
          const updated = { ...item, [field]: val };
          if (field === 'itemId') {
            const foundItem = items.find(i => i.id === val);
            if (foundItem) {
              updated.itemCode = foundItem.code;
              updated.itemName = foundItem.name;
              updated.unitPrice = foundItem.sellingPrice;
            }
          }
          const qty = Number(updated.quantity) || 0;
          const price = Number(updated.unitPrice) || 0;
          const total = qty * price;
          updated.total = total;
          updated.net = total;
          return updated;
        }
        return item;
      });
    });
  };

  const removeItemRow = (rowId: string) => {
    setReturnItems(prev => prev.filter(i => i.id !== rowId));
  };

  const totals = useMemo(() => {
    const subtotal = returnItems.reduce((s, i) => s + i.net, 0);
    const taxAmount = (subtotal * 14) / 100;
    const netTotal = subtotal + taxAmount;
    const paidAmount = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { subtotal, taxAmount, netTotal, paidAmount };
  }, [returnItems, payments]);

  const handleAddPaymentRow = () => {
    const defaultCb = cashBanks[0];
    const newPay: InvoicePayment = {
      id: 'pay-' + Date.now(),
      paymentMethod: 'نقدي',
      cashBankId: defaultCb?.id || '',
      cashBankName: defaultCb?.name || 'الخزينة الرئيسية',
      amount: totals.netTotal,
      referenceNo: '',
      date: date,
      notes: 'صرف قيمة مردودات مبيعات'
    };
    setPayments(prev => [...prev, newPay]);
  };

  const handleNew = () => {
    setIsNewMode(true);
    setReturnNo(`RET-SL-2026-000${salesReturns.length + 1}`);
    setInvoiceNo('');
    setDate(new Date().toISOString().split('T')[0]);
    setWarehouseId(warehouses[0]?.id || '');
    const firstCust = customers[0];
    setCustomerId(firstCust?.id || '');
    setSalesRepEmployeeId(firstCust?.salesRepEmployeeId || '');
    setSalesRepName(firstCust?.salesRepName || '');
    setReturnItems([]);
    setPayments([]);
    setNotes('');
    setStatusMessage(null);
    setTimeout(() => handleAddItemRow(), 50);
  };

  const handleSave = () => {
    if (!returnNo.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رقم إشعار المردود' });
      return;
    }
    if (!customerId || !warehouseId || returnItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى اختيار العميل والمستودع وإضافة صنف على الأقل' });
      return;
    }

    const wh = warehouses.find(w => w.id === warehouseId);
    const cust = customers.find(c => c.id === customerId);

    const retData: SalesReturn = {
      id: isNewMode ? 'ret-' + Date.now() : currentReturn.id,
      returnNo: returnNo.trim(),
      invoiceNo: invoiceNo.trim() || undefined,
      date,
      warehouseId,
      warehouseName: wh?.name || '',
      customerId,
      customerName: cust?.name || '',
      salesRepEmployeeId,
      salesRepName: salesRepName || '',
      items: returnItems,
      subtotal: totals.subtotal,
      discountAmount: 0,
      taxAmount: totals.taxAmount,
      netTotal: totals.netTotal,
      payments,
      paidAmount: totals.paidAmount,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentReturn.createdAt
    };

    if (isNewMode) {
      addSalesReturn(retData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({ type: 'success', text: `تم حفظ إشعار المردودات (${retData.returnNo}) وتمت إعادة الأصناف إلى المخزن وتعديل الحسابات فوراً` });
    } else {
      updateSalesReturn(currentReturn.id, retData);
      setStatusMessage({ type: 'success', text: `تم تحديث مردودات المبيعات (${retData.returnNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentReturn) return;
    if (confirm(`هل أنت متأكد من حذف إشعار المردود (${currentReturn.returnNo})؟`)) {
      deleteSalesReturn(currentReturn.id);
      setStatusMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleExportExcel = () => {
    const activeRet = currentReturn || {
      returnNo,
      date,
      customerName: customers.find(c => c.id === customerId)?.name || 'العميل',
      netTotal: totals.netTotal,
      items: returnItems
    };

    const headers = ['م', 'كود الصنف', 'اسم الصنف', 'الكمية', 'سعر الوحدة', 'الإجمالي'];
    const rows = (activeRet.items || []).map((it, idx) => [
      idx + 1,
      it.itemCode,
      it.itemName,
      it.quantity,
      it.unitPrice.toFixed(2),
      it.net.toFixed(2)
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `مردودات_مبيعات_${activeRet.returnNo || 'جديدة'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="إشعار مردودات مبيعات" docNumber={returnNo} date={date} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md shadow-rose-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة مردودات المبيعات</h1>
            <p className="text-xs text-slate-500">
              إرجاع بضائع للمخزن وإثبات رد مبالغ نقداً أو بشيك أو تحويل بنكي أو خصم من رصيد العميل
            </p>
          </div>
        </div>

        {/* Quick Actions & Print */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            title="تصدير بيانات المردودات إلى ملف Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            title="اختيار وتخصيص نماذج الطباعة"
          >
            <Printer className="w-4 h-4" />
            <span>نماذج الطباعة</span>
          </button>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(salesReturns.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(salesReturns.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={handlePrint}
        isNewMode={isNewMode}
        canEdit={canAccess('sales_return', 'edit')}
        canDelete={canAccess('sales_return', 'delete')}
        canPrint={canAccess('sales_return', 'print')}
        searchPlaceholder="استدعاء إشعار مردود..."
        onSearchChange={val => {
          const idx = salesReturns.findIndex(r => r.returnNo.includes(val) || r.customerName.includes(val));
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

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 print-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-rose-50/40 rounded-xl border border-rose-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم إشعار المردود *</label>
            <input
              type="text"
              value={returnNo}
              onChange={e => setReturnNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ المردود *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المستودع المرتجع إليه *</label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-semibold text-slate-800"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">استدعاء من فاتورة مبيعات سابقة</label>
            <select
              value={invoiceNo}
              onChange={e => handleLoadInvoice(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-semibold text-blue-700"
            >
              <option value="">-- اختياري: اختر فاتورة أصلية --</option>
              {salesInvoices.map(inv => (
                <option key={inv.id} value={inv.invoiceNo}>
                  {inv.invoiceNo} - {inv.customerName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">العميل *</label>
            <select
              value={customerId}
              onChange={e => {
                setCustomerId(e.target.value);
                const c = customers.find(x => x.id === e.target.value);
                if (c) {
                  setSalesRepEmployeeId(c.salesRepEmployeeId);
                  setSalesRepName(c.salesRepName || '');
                }
              }}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
            >
              <option value="">-- اختر العميل --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">المندوب المسند</label>
            <input
              type="text"
              value={salesRepName}
              readOnly
              className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2 bg-slate-100 text-slate-700"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">الأصناف المرتجعة للمخزن</h3>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صنف مرتجع</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">الصنف</th>
                  <th className="p-2.5 text-center">الكمية المرتجعة</th>
                  <th className="p-2.5 text-left">سعر الإرجاع</th>
                  <th className="p-2.5 text-left">الإجمالي</th>
                  <th className="p-2.5 text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2.5">
                      <select
                        value={item.itemId}
                        onChange={e => updateItemRow(item.id, 'itemId', e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-1.5 bg-white font-bold"
                      >
                        {items.map(it => (
                          <option key={it.id} value={it.id}>{it.code} - {it.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItemRow(item.id, 'quantity', Number(e.target.value))}
                        className="w-20 text-xs font-bold border border-slate-300 rounded p-1 text-center"
                      />
                    </td>
                    <td className="p-2.5 text-left">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={e => updateItemRow(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-24 text-xs font-bold border border-slate-300 rounded p-1 text-left"
                      />
                    </td>
                    <td className="p-2.5 font-mono text-left font-bold text-rose-700">
                      {item.net.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => removeItemRow(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Breakdown & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">تسجيل دفعات رد القيمة (نقدي / شيك / تحويل)</h4>
              <button
                type="button"
                onClick={handleAddPaymentRow}
                className="text-[11px] bg-slate-800 text-white px-2 py-0.5 rounded font-bold cursor-pointer no-print"
              >
                + دفعة رد
              </button>
            </div>
            {payments.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-slate-200">
                <select
                  value={p.paymentMethod}
                  onChange={e => {
                    const m = e.target.value as PaymentMethod;
                    setPayments(prev => prev.map(x => x.id === p.id ? { ...x, paymentMethod: m } : x));
                  }}
                  className="border rounded p-1"
                >
                  <option value="نقدي">نقدي</option>
                  <option value="فيزا">فيزا</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                </select>
                <input
                  type="number"
                  value={p.amount}
                  onChange={e => {
                    const a = Number(e.target.value);
                    setPayments(prev => prev.map(x => x.id === p.id ? { ...x, amount: a } : x));
                  }}
                  className="w-24 border rounded p-1 font-mono font-bold text-left"
                />
                <input
                  type="text"
                  placeholder="رقم الشيك/التحويل"
                  value={p.referenceNo || ''}
                  onChange={e => {
                    const r = e.target.value;
                    setPayments(prev => prev.map(x => x.id === p.id ? { ...x, referenceNo: r } : x));
                  }}
                  className="flex-1 border rounded p-1 text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setPayments(prev => prev.filter(x => x.id !== p.id))}
                  className="text-rose-500 hover:text-rose-700 no-print"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span>الإجمالي قبل الضريبة:</span>
              <span className="font-mono">{totals.subtotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>ضريبة القيمة المضافة 14%:</span>
              <span className="font-mono">+{totals.taxAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between text-amber-300 font-bold text-sm pt-1 border-t border-slate-800">
              <span>صافي قيمة المردودات المستحقة:</span>
              <span className="font-mono">{totals.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>إجمالي المسدد فوراً (رد نقدي/شيك):</span>
              <span className="font-mono">{totals.paidAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>نماذج الطباعة</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 cursor-pointer"
          >
            حفظ إشعار المردودات
          </button>
        </div>
      </div>

      {/* Printable Modal with Multiple Templates */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={{
          title: 'إشعار مردودات مبيعات',
          invoiceNo: returnNo || 'RET-SALES-DRAFT',
          date,
          partnerType: 'عميل',
          partnerName: customers.find(c => c.id === customerId)?.name || 'العميل',
          partnerPhone: customers.find(c => c.id === customerId)?.phone,
          partnerAddress: customers.find(c => c.id === customerId)?.address,
          salesRepName,
          warehouseName: warehouses.find(w => w.id === warehouseId)?.name,
          paymentMethod: payments[0]?.paymentMethod || 'نقدي',
          items: returnItems,
          subtotal: totals.subtotal,
          taxPercent: 14,
          taxAmount: totals.taxAmount,
          netTotal: totals.netTotal,
          paidAmount: totals.paidAmount,
          remainingAmount: 0,
          notes,
          payments
        }}
      />
    </div>
  );
};
