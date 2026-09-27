import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Warehouse,
  CreditCard,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackagePlus,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseInvoice, InvoiceItem, InvoicePayment, PaymentMethod } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';
import { QuickSupplierModal } from '../common/QuickSupplierModal';
import { QuickItemModal } from '../common/QuickItemModal';
import { PrintModal } from '../common/PrintModal';

export const PurchaseInvoiceScreen: React.FC = () => {
  const {
    purchaseInvoices,
    warehouses,
    suppliers,
    items,
    cashBanks,
    addPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
    canAccess,
    selectedOperationTarget,
    setSelectedOperationTarget
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [salesRepEmployeeId, setSalesRepEmployeeId] = useState('');
  const [salesRepName, setSalesRepName] = useState('');

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceDiscountAmount, setInvoiceDiscountAmount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(14);
  const [withholdingTaxPercent, setWithholdingTaxPercent] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدي');
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentInvoice = purchaseInvoices[currentIndex];

  useEffect(() => {
    if (currentInvoice && !isNewMode) {
      setInvoiceNo(currentInvoice.invoiceNo);
      setDate(currentInvoice.date);
      setDueDate(currentInvoice.dueDate);
      setWarehouseId(currentInvoice.warehouseId);
      setSupplierId(currentInvoice.supplierId);
      setSalesRepEmployeeId(currentInvoice.salesRepEmployeeId);
      setSalesRepName(currentInvoice.salesRepName);
      setInvoiceItems(currentInvoice.items);
      setInvoiceDiscountAmount(currentInvoice.invoiceDiscountAmount || 0);
      setTaxPercent(currentInvoice.taxPercent);
      setWithholdingTaxPercent(currentInvoice.withholdingTaxPercent);
      setPaymentMethod(currentInvoice.paymentMethod);
      setPayments(currentInvoice.payments || []);
      setNotes(currentInvoice.notes || '');
    }
  }, [currentInvoice, isNewMode]);

  // Target specific invoice if selected from Operations Hub or Navigation
  useEffect(() => {
    if (selectedOperationTarget && selectedOperationTarget.screen === 'purchase_invoice') {
      const idx = purchaseInvoices.findIndex(inv =>
        (selectedOperationTarget.id && inv.id === selectedOperationTarget.id) ||
        (selectedOperationTarget.invoiceNo && inv.invoiceNo === selectedOperationTarget.invoiceNo)
      );
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsNewMode(false);
      }
      setSelectedOperationTarget(null);
    }
  }, [selectedOperationTarget, purchaseInvoices, setSelectedOperationTarget]);

  const handleSupplierChange = (supId: string) => {
    setSupplierId(supId);
    const supp = suppliers.find(s => s.id === supId);
    if (supp) {
      setSalesRepEmployeeId(supp.salesRepEmployeeId);
      setSalesRepName(supp.salesRepName || 'غير مسند');
    }
  };

  const handleAddItemRow = (selectedItemId?: string) => {
    const itemObj = items.find(i => i.id === selectedItemId) || items[0];
    if (!itemObj) return;

    const newItem: InvoiceItem = {
      id: 'purch-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      itemId: itemObj.id,
      itemCode: itemObj.code,
      itemName: itemObj.name,
      quantity: 1,
      unitPrice: itemObj.purchasePrice,
      total: itemObj.purchasePrice,
      discountPercent: 0,
      discountAmount: 0,
      net: itemObj.purchasePrice
    };

    setInvoiceItems(prev => [...prev, newItem]);
  };

  const updateItemRow = (rowId: string, field: keyof InvoiceItem, val: any) => {
    setInvoiceItems(prev => {
      return prev.map(item => {
        if (item.id === rowId) {
          const updated = { ...item, [field]: val };
          if (field === 'itemId') {
            const foundItem = items.find(i => i.id === val);
            if (foundItem) {
              updated.itemCode = foundItem.code;
              updated.itemName = foundItem.name;
              updated.unitPrice = foundItem.purchasePrice;
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
    setInvoiceItems(prev => prev.filter(i => i.id !== rowId));
  };

  const calculations = useMemo(() => {
    const subtotal = invoiceItems.reduce((s, i) => s + i.net, 0);
    const afterDiscount = subtotal - (Number(invoiceDiscountAmount) || 0);
    const taxAmount = (afterDiscount * (Number(taxPercent) || 0)) / 100;
    const withholdingTaxAmount = (afterDiscount * (Number(withholdingTaxPercent) || 0)) / 100;
    const netTotal = afterDiscount + taxAmount - withholdingTaxAmount;
    const paidAmount = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const remainingAmount = Math.max(0, netTotal - paidAmount);

    return {
      subtotal,
      afterDiscount,
      taxAmount,
      withholdingTaxAmount,
      netTotal,
      paidAmount,
      remainingAmount
    };
  }, [invoiceItems, invoiceDiscountAmount, taxPercent, withholdingTaxPercent, payments]);

  const handleAddPaymentRow = () => {
    const defaultCb = cashBanks[0];
    const newPay: InvoicePayment = {
      id: 'pay-' + Date.now(),
      paymentMethod,
      cashBankId: defaultCb?.id || '',
      cashBankName: defaultCb?.name || 'الخزينة الرئيسية',
      amount: calculations.remainingAmount > 0 ? calculations.remainingAmount : 0,
      referenceNo: '',
      date,
      notes: 'سداد دفعة مشتريات'
    };
    setPayments(prev => [...prev, newPay]);
  };

  const handleNew = () => {
    setIsNewMode(true);
    setInvoiceNo(`PUR-2026-000${purchaseInvoices.length + 1}`);
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setDueDate(today);
    setWarehouseId(warehouses[0]?.id || '');
    const firstSupp = suppliers[0];
    setSupplierId(firstSupp?.id || '');
    setSalesRepEmployeeId(firstSupp?.salesRepEmployeeId || '');
    setSalesRepName(firstSupp?.salesRepName || '');
    setInvoiceItems([]);
    setInvoiceDiscountAmount(0);
    setTaxPercent(14);
    setWithholdingTaxPercent(1);
    setPaymentMethod('نقدي');
    setPayments([]);
    setNotes('');
    setStatusMessage(null);
    setTimeout(() => handleAddItemRow(), 50);
  };

  const handleSave = () => {
    if (!invoiceNo.trim() || !supplierId || !warehouseId || invoiceItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى استيفاء رقم الفاتورة، المورد، المخزن، والأصناف' });
      return;
    }

    const wh = warehouses.find(w => w.id === warehouseId);
    const supp = suppliers.find(s => s.id === supplierId);

    const invoiceData: PurchaseInvoice = {
      id: isNewMode ? 'pur-inv-' + Date.now() : currentInvoice.id,
      invoiceNo: invoiceNo.trim(),
      date,
      dueDate,
      warehouseId,
      warehouseName: wh?.name || '',
      supplierId,
      supplierName: supp?.name || '',
      salesRepEmployeeId,
      salesRepName: salesRepName || '',
      items: invoiceItems,
      subtotal: calculations.subtotal,
      invoiceDiscountAmount: Number(invoiceDiscountAmount) || 0,
      taxPercent: Number(taxPercent) || 0,
      taxAmount: calculations.taxAmount,
      withholdingTaxPercent: Number(withholdingTaxPercent) || 0,
      withholdingTaxAmount: calculations.withholdingTaxAmount,
      netTotal: calculations.netTotal,
      paymentMethod,
      payments,
      paidAmount: calculations.paidAmount,
      remainingAmount: calculations.remainingAmount,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentInvoice.createdAt
    };

    if (isNewMode) {
      addPurchaseInvoice(invoiceData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ فاتورة المشتريات (${invoiceData.invoiceNo}) بقيمة ${invoiceData.netTotal.toLocaleString('ar-EG')} ج.م وتمت إضافة البضاعة للمخزن وتعديل رصيد المورد بنجاح`
      });
    } else {
      updatePurchaseInvoice(currentInvoice.id, invoiceData);
      setStatusMessage({ type: 'success', text: `تم تحديث فاتورة المشتريات (${invoiceData.invoiceNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentInvoice) return;
    if (confirm(`هل أنت متأكد من حذف فاتورة المشتريات (${currentInvoice.invoiceNo})؟`)) {
      deletePurchaseInvoice(currentInvoice.id);
      setStatusMessage({ type: 'success', text: 'تم حذف الفاتورة بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleExportExcel = () => {
    const activeInv = currentInvoice || {
      invoiceNo,
      date,
      supplierName: suppliers.find(s => s.id === supplierId)?.name || 'المورد',
      netTotal: calculations.netTotal,
      items: invoiceItems
    };

    const headers = ['م', 'كود الصنف', 'اسم الصنف', 'الكمية', 'سعر الشراء', 'الإجمالي', 'الصافي'];
    const rows = (activeInv.items || []).map((it, idx) => [
      idx + 1,
      it.itemCode,
      it.itemName,
      it.quantity,
      it.unitPrice.toFixed(2),
      it.total.toFixed(2),
      it.net.toFixed(2)
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `فاتورة_مشتريات_${activeInv.invoiceNo || 'جديدة'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="فاتورة مشتريات وتوريد" docNumber={invoiceNo} date={date} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">فاتورة مشتريات وبضاعة واردة</h1>
            <p className="text-xs text-slate-500">
              تسجيل بضائع الموردين وزيادة رصيد المستودعات واحتساب ضريبة القيمة المضافة وإشعار الخصم 1%
            </p>
          </div>
        </div>

        {/* Quick Actions & Print */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>+ تكويد مورد جديد</span>
          </button>
          <button
            type="button"
            onClick={() => setIsItemModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            <span>+ تكويد صنف جديد</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            title="تصدير بيانات الفاتورة إلى ملف Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
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
        onNext={() => { setCurrentIndex(Math.min(purchaseInvoices.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(purchaseInvoices.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={handlePrint}
        isNewMode={isNewMode}
        canEdit={canAccess('purchase_invoice', 'edit')}
        canDelete={canAccess('purchase_invoice', 'delete')}
        canPrint={canAccess('purchase_invoice', 'print')}
        searchPlaceholder="استدعاء فاتورة مشتريات..."
        onSearchChange={val => {
          const idx = purchaseInvoices.findIndex(p => p.invoiceNo.includes(val) || p.supplierName.includes(val));
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

      {/* Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 print-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الفاتورة *</label>
            <input
              type="text"
              value={invoiceNo}
              onChange={e => setInvoiceNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>تاريخ الفاتورة *</span>
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
              <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
              <span>المستودع الوارد إليه *</span>
            </label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-semibold text-slate-800"
              required
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>طريقة الدفع *</span>
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
            >
              <option value="نقدي">نقدي</option>
              <option value="آجل">آجل</option>
              <option value="فيزا">فيزا</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">المورد *</label>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer no-print"
              >
                <Plus className="w-3 h-3" />
                <span>+ مورد جديد</span>
              </button>
            </div>
            <select
              value={supplierId}
              onChange={e => handleSupplierChange(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
              required
            >
              <option value="">-- اختر المورد --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">اسم المندوب المسؤول</label>
            <input
              type="text"
              value={salesRepName || 'غير مسند'}
              readOnly
              className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2 bg-slate-100 text-blue-900"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">الأصناف المشتراة والمضافة للمخزون</h3>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(true)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ صنف جديد</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddItemRow()}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سطر صنف</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">اسم الصنف</th>
                  <th className="p-2.5 text-center">الكمية</th>
                  <th className="p-2.5 text-left">سعر الشراء</th>
                  <th className="p-2.5 text-left">الإجمالي</th>
                  <th className="p-2.5 text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceItems.map((item, idx) => (
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
                        className="w-24 text-xs font-bold border border-slate-300 rounded p-1 text-left text-blue-800"
                      />
                    </td>
                    <td className="p-2.5 font-mono text-left font-bold text-slate-800">
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

        {/* Payments and Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-200">
          <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-800">دفعات سداد الفاتورة للمورد</h4>
              <button
                type="button"
                onClick={handleAddPaymentRow}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer no-print"
              >
                + دفعة سداد
              </button>
            </div>
            {payments.map(pay => (
              <div key={pay.id} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-xs">
                <select
                  value={pay.paymentMethod}
                  onChange={e => {
                    const m = e.target.value as PaymentMethod;
                    setPayments(prev => prev.map(x => x.id === pay.id ? { ...x, paymentMethod: m } : x));
                  }}
                  className="border rounded p-1 font-bold"
                >
                  <option value="نقدي">نقدي</option>
                  <option value="فيزا">فيزا</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                </select>
                <select
                  value={pay.cashBankId}
                  onChange={e => {
                    const val = e.target.value;
                    const cb = cashBanks.find(c => c.id === val);
                    setPayments(prev => prev.map(x => x.id === pay.id ? { ...x, cashBankId: val, cashBankName: cb?.name || '' } : x));
                  }}
                  className="border rounded p-1 flex-1"
                >
                  {cashBanks.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={pay.amount}
                  onChange={e => {
                    const a = Number(e.target.value);
                    setPayments(prev => prev.map(x => x.id === pay.id ? { ...x, amount: a } : x));
                  }}
                  className="w-24 border rounded p-1 font-mono font-bold text-left"
                />
                <button
                  type="button"
                  onClick={() => setPayments(prev => prev.filter(x => x.id !== pay.id))}
                  className="text-rose-500 hover:text-rose-700 no-print"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الفاتورة</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span>إجمالي البضاعة:</span>
              <span className="font-mono">{calculations.subtotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between items-center">
              <span>ضريبة القيمة المضافة 14%:</span>
              <span className="font-mono">+{calculations.taxAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between items-center text-orange-300">
              <span>إشعار خصم 1% (أ.ت.ص):</span>
              <span className="font-mono">-{calculations.withholdingTaxAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between text-amber-300 font-bold text-sm pt-1 border-t border-slate-800">
              <span>صافي المستحق للمورد:</span>
              <span className="font-mono">{calculations.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>إجمالي المسدد فوراً:</span>
              <span className="font-mono">{calculations.paidAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>المتبقي الآجل للمورد:</span>
              <span className="font-mono">{calculations.remainingAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</span>
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
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 cursor-pointer"
          >
            حفظ وترحيل الفاتورة
          </button>
        </div>
      </div>

      {/* Quick Modal: Add Supplier from inside Invoice */}
      <QuickSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onCreated={(newSupp) => {
          handleSupplierChange(newSupp.id);
        }}
      />

      {/* Quick Modal: Add Item from inside Invoice */}
      <QuickItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onCreated={(newItem) => {
          handleAddItemRow(newItem.id);
        }}
      />

      {/* Printable Invoice Modal with Multiple Templates */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={{
          title: 'فاتورة مشتريات وتوريد',
          invoiceNo: invoiceNo || 'PUR-DRAFT',
          date,
          dueDate,
          partnerType: 'مورد',
          partnerName: suppliers.find(s => s.id === supplierId)?.name || 'مورد بضاعة',
          partnerPhone: suppliers.find(s => s.id === supplierId)?.phone,
          partnerAddress: suppliers.find(s => s.id === supplierId)?.address,
          salesRepName,
          warehouseName: warehouses.find(w => w.id === warehouseId)?.name,
          paymentMethod,
          items: invoiceItems,
          subtotal: calculations.subtotal,
          taxPercent,
          taxAmount: calculations.taxAmount,
          withholdingTaxPercent,
          withholdingTaxAmount: calculations.withholdingTaxAmount,
          discountAmount: invoiceDiscountAmount,
          netTotal: calculations.netTotal,
          paidAmount: calculations.paidAmount,
          remainingAmount: calculations.remainingAmount,
          notes,
          payments
        }}
      />
    </div>
  );
};
