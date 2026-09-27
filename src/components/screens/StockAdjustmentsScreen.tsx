import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, Printer, CheckCircle2, AlertCircle, Warehouse, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockAdjustment, StockAdjustmentItem, AdjustmentType } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const StockAdjustmentsScreen: React.FC = () => {
  const {
    stockAdjustments,
    warehouses,
    items,
    addStockAdjustment,
    updateStockAdjustment,
    deleteStockAdjustment,
    canAccess
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  const [docNo, setDocNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState<AdjustmentType>('إضافة');
  const [adjustmentItems, setAdjustmentItems] = useState<StockAdjustmentItem[]>([]);
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentAdj = stockAdjustments[currentIndex];

  useEffect(() => {
    if (currentAdj && !isNewMode) {
      setDocNo(currentAdj.docNo);
      setDate(currentAdj.date);
      setWarehouseId(currentAdj.warehouseId);
      setType(currentAdj.type);
      setAdjustmentItems(currentAdj.items);
      setNotes(currentAdj.notes || '');
    }
  }, [currentAdj, isNewMode]);

  const handleAddItemRow = () => {
    const it = items[0];
    if (!it) return;
    const newItem: StockAdjustmentItem = {
      id: 'adj-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      itemId: it.id,
      itemCode: it.code,
      itemName: it.name,
      bookQuantity: it.currentStock,
      physicalQuantity: it.currentStock,
      diffQuantity: 0,
      costPrice: it.purchasePrice,
      diffTotal: 0
    };
    setAdjustmentItems(prev => [...prev, newItem]);
  };

  const updateItemRow = (rowId: string, field: keyof StockAdjustmentItem, val: any) => {
    setAdjustmentItems(prev => {
      return prev.map(item => {
        if (item.id === rowId) {
          const updated = { ...item, [field]: val };
          if (field === 'itemId') {
            const foundItem = items.find(i => i.id === val);
            if (foundItem) {
              updated.itemCode = foundItem.code;
              updated.itemName = foundItem.name;
              updated.bookQuantity = foundItem.currentStock;
              updated.physicalQuantity = foundItem.currentStock;
              updated.costPrice = foundItem.purchasePrice;
            }
          }

          const book = Number(updated.bookQuantity) || 0;
          const phys = Number(updated.physicalQuantity) || 0;
          const diff = phys - book;
          const cost = Number(updated.costPrice) || 0;

          updated.diffQuantity = diff;
          updated.diffTotal = Math.abs(diff) * cost;
          return updated;
        }
        return item;
      });
    });
  };

  const handleNew = () => {
    setIsNewMode(true);
    setDocNo(`ADJ-2026-000${stockAdjustments.length + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
    setWarehouseId(warehouses[0]?.id || '');
    setType('إضافة');
    setAdjustmentItems([]);
    setNotes('');
    setStatusMessage(null);
    setTimeout(() => handleAddItemRow(), 50);
  };

  const totalDiffVal = adjustmentItems.reduce((s, i) => s + i.diffTotal, 0);

  const handleSave = () => {
    if (!docNo.trim() || !warehouseId || adjustmentItems.length === 0) {
      setStatusMessage({ type: 'error', text: 'يرجى استيفاء بيانات التسوية الجردية' });
      return;
    }

    const wh = warehouses.find(w => w.id === warehouseId);
    const adjData: StockAdjustment = {
      id: isNewMode ? 'adj-' + Date.now() : currentAdj.id,
      docNo: docNo.trim(),
      date,
      warehouseId,
      warehouseName: wh?.name || '',
      type,
      items: adjustmentItems,
      totalDiffValue: totalDiffVal,
      notes: notes.trim() || undefined,
      createdAt: isNewMode ? new Date().toISOString() : currentAdj.createdAt
    };

    if (isNewMode) {
      addStockAdjustment(adjData);
      setIsNewMode(false);
      setCurrentIndex(0);
      setStatusMessage({ type: 'success', text: `تم حفظ التسوية الجردية (${adjData.docNo}) والتأثير المباشر على أرصدة الأصناف بالمخازن` });
    } else {
      updateStockAdjustment(currentAdj.id, adjData);
      setStatusMessage({ type: 'success', text: `تم تحديث التسوية الجردية (${adjData.docNo})` });
    }
  };

  const handleDelete = () => {
    if (!currentAdj) return;
    if (confirm(`هل أنت متأكد من حذف حركة التسوية (${currentAdj.docNo})؟`)) {
      deleteStockAdjustment(currentAdj.id);
      setStatusMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="محضر وتسوية جردية للمخزون" docNumber={docNo} date={date} />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600 text-white rounded-xl shadow-md shadow-violet-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة التسويات الجردية</h1>
            <p className="text-xs text-slate-500">
              جرد عدد لا نهائي من الأصناف وتسوية العجز أو الزيادة مع التأثير الفوري على أرصدة المخزون والدفاتر
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(stockAdjustments.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(stockAdjustments.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('stock_adjustments', 'edit')}
        canDelete={canAccess('stock_adjustments', 'delete')}
        canPrint={canAccess('stock_adjustments', 'print')}
        searchPlaceholder="استدعاء رقم تسوية جردية..."
        onSearchChange={val => {
          const idx = stockAdjustments.findIndex(a => a.docNo.includes(val));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-violet-50/40 rounded-xl border border-violet-100 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم حركة التسوية *</label>
            <input
              type="text"
              value={docNo}
              onChange={e => setDocNo(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2 bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>تاريخ الجرد والتسوية *</span>
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
              <Warehouse className="w-3.5 h-3.5 text-slate-500" />
              <span>المستودع محل الجرد *</span>
            </label>
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
            <label className="block font-bold text-slate-700 mb-1">نوع التسوية وتأثيرها *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as AdjustmentType)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white font-bold text-violet-900"
            >
              <option value="إضافة">تسوية بالزيادة (إضافة أرصدة للمخزن)</option>
              <option value="صرف">تسوية بالعجز (صرف أرصدة من المخزن)</option>
            </select>
          </div>
        </div>

        {/* Adjustment Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">الأصناف المجرودة والكميات</h3>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صنف للتسوية</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">الصنف</th>
                  <th className="p-2.5 text-center">الرصيد الدفتري</th>
                  <th className="p-2.5 text-center">الرصيد الفعلي (الجرد)</th>
                  <th className="p-2.5 text-center">فرق الكمية</th>
                  <th className="p-2.5 text-left">سعر التكلفة</th>
                  <th className="p-2.5 text-left">قيمة الفرق</th>
                  <th className="p-2.5 text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adjustmentItems.map((item, idx) => (
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
                    <td className="p-2.5 text-center font-bold text-slate-600">{item.bookQuantity}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.physicalQuantity}
                        onChange={e => updateItemRow(item.id, 'physicalQuantity', Number(e.target.value))}
                        className="w-20 text-xs font-bold border border-slate-300 rounded p-1 text-center bg-white"
                      />
                    </td>
                    <td className={`p-2.5 text-center font-bold font-mono ${item.diffQuantity >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {item.diffQuantity > 0 ? `+${item.diffQuantity}` : item.diffQuantity}
                    </td>
                    <td className="p-2.5 text-left font-mono">{item.costPrice.toLocaleString('ar-EG')}</td>
                    <td className="p-2.5 font-mono text-left font-bold text-violet-800">
                      {item.diffTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setAdjustmentItems(prev => prev.filter(x => x.id !== item.id))}
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
          <div className="text-sm font-bold text-violet-900">
            إجمالي قيمة الفروقات الجردية: {totalDiffVal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
            >
              طباعة محضر الجرد
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              حفظ واعتماد التسوية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
