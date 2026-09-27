import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Plus, Trash2, Printer, CheckCircle2, AlertCircle, Truck, PackagePlus, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseReturn, InvoiceItem, InvoicePayment } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';
import { QuickSupplierModal } from '../common/QuickSupplierModal';
import { QuickItemModal } from '../common/QuickItemModal';
import { PrintModal } from '../common/PrintModal';

export const PurchaseReturnScreen: React.FC = () => {
  const {
    purchaseReturns,
    purchaseInvoices,
    warehouses,
    suppliers,
    items,
    cashBanks,
    addPurchaseReturn,
    updatePurchaseReturn,
    deletePurchaseReturn,
    canAccess,
    selectedOperationTarget,
    setSelectedOperationTarget
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [returnNo, setReturnNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const [returnItems, setReturnItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentReturn = purchaseReturns[currentIndex];

  useEffect(() => {
    if (currentReturn && !isNewMode) {
      setReturnNo(currentReturn.returnNo);
      setInvoiceNo(currentReturn.invoiceNo || '');
      setDate(currentReturn.date);
      setWarehouseId(currentReturn.warehouseId);
      setSupplierId(currentReturn.supplierId);
      setReturnItems(currentReturn.items);
      setPayments(currentReturn.payments || []);
      setNotes(currentReturn.notes || '');
    }
  }, [currentReturn, isNewMode]);

  // Target specific return if selected from Operations Hub or Navigation
  useEffect(() => {
    if (selectedOperationTarget && selectedOperationTarget.screen === 'purchase_return') {
      const idx = purchaseReturns.findIndex(ret =>
        (selectedOperationTarget.id && ret.id === selectedOperationTarget.id) ||
        (selectedOperationTarget.invoiceNo && ret.returnNo === selectedOperationTarget.invoiceNo)
      );
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsNewMode(false);
      }
      setSelectedOperationTarget(null);
    }
  }, [selectedOperationTarget, purchaseReturns, setSelectedOperationTarget]);

  // Load items from purchase invoice if chosen
  const handleLoadInvoice = (invNum: string) => {
    setInvoiceNo(invNum);
    const foundInv = purchaseInvoices.find(i => i.invoiceNo === invNum);
    if (foundInv) {
      setSupplierId(foundInv.supplierId);
      setWarehouseId(foundInv.warehouseId);
      setReturnItems(foundInv.items.map(item => ({ ...item, id: 'ret-pur-item-' + Math.random().toString(36).substring(2, 6) })));
      setStatusMessage({ type: 'success', text: `تم استدعاء أصناف الفاتورة (${invNum}) بنجاح` });
    }
  };

  const handleAddItemRow = (selectedItemId?: string) => {
    const itemObj = items.find(i => i.id === selectedItemId) || items[0];
    if (!itemObj) return;
    const newItem: InvoiceItem = {
      id: 'ret-pur-' + Date.now(),
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

  const totals = useMemo(() => {
    const subtotal = returnItems.reduce((s, i) => s + i.net, 0);
    const taxAmount = (subtotal * 14) / 100;
    const netTotal = subtotal + taxAmount;
    const paidAmount = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { subtotal, taxAmount, netTotal, paidAmount };
  }, [returnItems, payments]);

  const handleNew = () => {
    setIsNewMode(true);
    setReturnNo(`RET-PUR-2026-000${purchaseReturns.length + 1}`);
    setInvoiceNo('');
    setDate(new Date().toISOString().split('T')[0]);
    setWarehouseId(warehouses[0]?.id || '');
    setSupplierId(suppliers[0]?.id || '');
    setReturnItems([]);
    setPayments([]);
    setNotes('');
    setStatusMessage(null);
    setTimeout(() => handleAddItemRow(), 50);
  };

  const handleSave = () => {
    if (!returnNo.trim() || !supplierId || !warehouseId || returnItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى استيفاء البيانات المطلوبة' });
      return;
    }

    const wh = warehouses.find(w => w.id === warehouseId);
    const supp = suppliers.find(s => s.id === supplierId);

    const retData: PurchaseReturn = {
      id: isNewMode ? 'pur-ret-' + Date.now() : currentReturn.id,
      returnNo: returnNo.trim(),
      invoiceNo: invoiceNo.trim() || undefined,
      date,
      warehouseId,
      warehouseName: wh?.name || '',
      supplierId,
      supplierName: supp?.name || '',
      items: returnItems,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      netTotal: totals.netTotal,
      payments,
      paidAmount: totals.paidAmount,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentReturn.createdAt
    };

    if (isNewMode) {
      addPurchaseReturn(retData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({ type: 'success', text: `تم حفظ مردودات المشتريات (${retData.returnNo}) وتم خصم البضاعة من المخزن وتخفيض مديونية المورد` });
    } else {
      updatePurchaseReturn(currentReturn.id, retData);
      setStatusMessage({ type: 'success', text: `تم تحديث مردودات المشتريات (${retData.returnNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentReturn) return;
    if (confirm(`هل أنت متأكد من حذف إشعار المردود (${currentReturn.returnNo})؟`)) {
      deletePurchaseReturn(currentReturn.id);
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
      supplierName: suppliers.find(s => s.id === supplierId)?.name || 'المورد',
      netTotal: totals.netTotal,
      items: returnItems
    };

    const headers = ['م', 'كود الصنف', 'اسم الصنف', 'الكمية', 'سعر الشراء', 'الإجمالي'];
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
    link.setAttribute('download', `مردودات_مشتريات_${activeRet.returnNo || 'جديدة'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="إشعار مردودات مشتريات للمورد" docNumber={returnNo} date={date} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة مردودات المشتريات</h1>
            <p className="text-xs text-slate-500">
              إرجاع بضائع للمورد وصرفها من المخزن وتخفيض حساب المورد واسترداد المدفوعات
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
            title="تصدير بيانات المردودات إلى ملف Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
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
        onNext={() => { setCurrentIndex(Math.min(purchaseReturns.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(purchaseReturns.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={handlePrint}
        isNewMode={isNewMode}
        canEdit={canAccess('purchase_return', 'edit')}
        canDelete={canAccess('purchase_return', 'delete')}
        canPrint={canAccess('purchase_return', 'print')}
        searchPlaceholder="استدعاء مردود مشتريات..."
        onSearchChange={val => {
          const idx = purchaseReturns.findIndex(p => p.returnNo.includes(val) || p.supplierName.includes(val));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-amber-50/40 rounded-xl border border-amber-100 text-xs">
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
            <label className="block font-bold text-slate-700 mb-1">المستودع المصروف منه *</label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-semibold"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">المورد *</label>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer no-print"
              >
                + مورد جديد
              </button>
            </div>
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold"
            >
              <option value="">-- اختر المورد --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block font-bold text-slate-700 mb-1">استدعاء وتحميل تلقائي من فاتورة مشتريات سابقة</label>
            <select
              value={invoiceNo}
              onChange={e => handleLoadInvoice(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-semibold text-blue-900 cursor-pointer"
            >
              <option value="">-- اختر فاتورة المشتريات للتحميل الفوري منها --</option>
              {purchaseInvoices.map(inv => (
                <option key={inv.id} value={inv.invoiceNo}>{inv.invoiceNo} - {inv.supplierName} ({inv.netTotal.toLocaleString('ar-EG')} ج.م)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">الأصناف المرتجعة للمورد</h3>
            <button
              type="button"
              onClick={() => handleAddItemRow()}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صنف</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">الصنف</th>
                  <th className="p-2.5 text-center">الكمية</th>
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
                    <td className="p-2.5 font-mono text-left font-bold text-amber-800">
                      {item.net.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setReturnItems(prev => prev.filter(x => x.id !== item.id))}
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

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center no-print">
          <div className="text-sm font-black text-slate-900">
            صافي المردودات: {totals.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
            >
              طباعة الإشعار
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              حفظ مردودات المشتريات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
