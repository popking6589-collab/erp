import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, Trash2, Printer, CheckCircle2, AlertCircle, Warehouse, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WarehouseTransfer, WarehouseTransferItem } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const WarehouseTransferScreen: React.FC = () => {
  const {
    warehouseTransfers,
    warehouses,
    items,
    addWarehouseTransfer,
    updateWarehouseTransfer,
    deleteWarehouseTransfer,
    canAccess
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  const [transferNo, setTransferNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [transferItems, setTransferItems] = useState<WarehouseTransferItem[]>([]);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentTransfer = warehouseTransfers[currentIndex];

  useEffect(() => {
    if (currentTransfer && !isNewMode) {
      setTransferNo(currentTransfer.transferNo);
      setDate(currentTransfer.date);
      setFromWarehouseId(currentTransfer.fromWarehouseId);
      setToWarehouseId(currentTransfer.toWarehouseId);
      setTransferItems(currentTransfer.items);
      setNotes(currentTransfer.notes || '');
    }
  }, [currentTransfer, isNewMode]);

  const handleAddItemRow = () => {
    const it = items[0];
    if (!it) return;
    const newItem: WarehouseTransferItem = {
      id: 'trf-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      itemId: it.id,
      itemCode: it.code,
      itemName: it.name,
      quantity: 1,
      unitCost: it.purchasePrice,
      totalCost: it.purchasePrice
    };
    setTransferItems(prev => [...prev, newItem]);
  };

  const updateItemRow = (rowId: string, field: keyof WarehouseTransferItem, val: any) => {
    setTransferItems(prev => {
      return prev.map(item => {
        if (item.id === rowId) {
          const updated = { ...item, [field]: val };
          if (field === 'itemId') {
            const foundItem = items.find(i => i.id === val);
            if (foundItem) {
              updated.itemCode = foundItem.code;
              updated.itemName = foundItem.name;
              updated.unitCost = foundItem.purchasePrice;
            }
          }
          const qty = Number(updated.quantity) || 0;
          const cost = Number(updated.unitCost) || 0;
          updated.totalCost = qty * cost;
          return updated;
        }
        return item;
      });
    });
  };

  const handleNew = () => {
    setIsNewMode(true);
    setTransferNo(`TRF-2026-000${warehouseTransfers.length + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
    setFromWarehouseId(warehouses[0]?.id || '');
    setToWarehouseId(warehouses[1]?.id || warehouses[0]?.id || '');
    setTransferItems([]);
    setNotes('');
    setStatusMessage(null);
    setTimeout(() => handleAddItemRow(), 50);
  };

  const totalCostVal = transferItems.reduce((s, i) => s + i.totalCost, 0);

  const handleSave = () => {
    if (!transferNo.trim() || !fromWarehouseId || !toWarehouseId || transferItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى استيفاء بيانات التحويل' });
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      setStatusMessage({ type: 'error', text: 'يجب اختيار مخزنين مختلفين (المصدر والوجهة)' });
      return;
    }

    const fromWh = warehouses.find(w => w.id === fromWarehouseId);
    const toWh = warehouses.find(w => w.id === toWarehouseId);

    const trfData: WarehouseTransfer = {
      id: isNewMode ? 'trf-' + Date.now() : currentTransfer.id,
      transferNo: transferNo.trim(),
      date,
      fromWarehouseId,
      fromWarehouseName: fromWh?.name || '',
      toWarehouseId,
      toWarehouseName: toWh?.name || '',
      items: transferItems,
      totalCost: totalCostVal,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentTransfer.createdAt
    };

    if (isNewMode) {
      addWarehouseTransfer(trfData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({
        type: 'success',
        text: `تم حفظ التحويل (${trfData.transferNo}) بنجاح وصرف الأصناف من ${trfData.fromWarehouseName} وإضافتها في ${trfData.toWarehouseName}`
      });
    } else {
      updateWarehouseTransfer(currentTransfer.id, trfData);
      setStatusMessage({ type: 'success', text: `تم تحديث التحويل المخزني (${trfData.transferNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentTransfer) return;
    if (confirm(`هل أنت متأكد من حذف حركة التحويل (${currentTransfer.transferNo})؟`)) {
      deleteWarehouseTransfer(currentTransfer.id);
      setStatusMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="إذن تحويل بضاعة بين المستودعات" docNumber={transferNo} date={date} />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-md shadow-teal-500/20">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة التحويل بين المخازن</h1>
            <p className="text-xs text-slate-500">
              تحويل البضائع والأصناف مع التأثير المزدوج بالصرف من المخزن المصدر والإضافة في المخزن المحول إليه
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(warehouseTransfers.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(warehouseTransfers.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('warehouse_transfer', 'edit')}
        canDelete={canAccess('warehouse_transfer', 'delete')}
        canPrint={canAccess('warehouse_transfer', 'print')}
        searchPlaceholder="استدعاء رقم إذن تحويل..."
        onSearchChange={val => {
          const idx = warehouseTransfers.findIndex(t => t.transferNo.includes(val));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-teal-50/40 rounded-xl border border-teal-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم إذن التحويل *</label>
            <input
              type="text"
              value={transferNo}
              onChange={e => setTransferNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>تاريخ التحويل *</span>
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
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-rose-800">
              <Warehouse className="w-3.5 h-3.5 text-rose-600" />
              <span>من مخزن (الصرف منه) *</span>
            </label>
            <select
              value={fromWarehouseId}
              onChange={e => setFromWarehouseId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold text-rose-900"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-emerald-800">
              <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
              <span>إلى مخزن (الإضافة إليه) *</span>
            </label>
            <select
              value={toWarehouseId}
              onChange={e => setToWarehouseId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold text-emerald-900"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transfer Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">الأصناف المحولة</h3>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer no-print"
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
                  <th className="p-2.5 text-center">الكمية المحولة</th>
                  <th className="p-2.5 text-left">تكلفة الوحدة</th>
                  <th className="p-2.5 text-left">إجمالي التكلفة</th>
                  <th className="p-2.5 text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferItems.map((item, idx) => (
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
                        className="w-20 text-xs font-bold border border-slate-300 rounded p-1 text-center bg-white"
                      />
                    </td>
                    <td className="p-2.5 text-left font-mono">{item.unitCost.toLocaleString('ar-EG')}</td>
                    <td className="p-2.5 font-mono text-left font-bold text-teal-800">
                      {item.totalCost.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setTransferItems(prev => prev.filter(x => x.id !== item.id))}
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
          <div className="text-sm font-bold text-teal-900">
            إجمالي تكلفة البضائع المحولة: {totalCostVal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
            >
              طباعة إذن التحويل
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              حفظ وترحيل التحويل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
