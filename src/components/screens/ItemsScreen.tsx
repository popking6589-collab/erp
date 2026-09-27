import React, { useState, useEffect } from 'react';
import { Package, Tag, DollarSign, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Item } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const ItemsScreen: React.FC = () => {
  const { items, addItem, updateItem, deleteItem, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [unit, setUnit] = useState('قطعة');
  const [minQuantity, setMinQuantity] = useState(5);
  const [openingStock, setOpeningStock] = useState(0);
  const [category, setCategory] = useState('عام');
  const [barcode, setBarcode] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (currentItem && !isNewMode) {
      setCode(currentItem.code);
      setName(currentItem.name);
      setPurchasePrice(currentItem.purchasePrice);
      setSellingPrice(currentItem.sellingPrice);
      setUnit(currentItem.unit);
      setMinQuantity(currentItem.minQuantity);
      setOpeningStock(currentItem.openingStock);
      setCategory(currentItem.category || 'عام');
      setBarcode(currentItem.barcode || '');
    }
  }, [currentItem, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`ITM-00${items.length + 1}`);
    setName('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setUnit('قطعة');
    setMinQuantity(5);
    setOpeningStock(10);
    setCategory('عام');
    setBarcode('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود واسم الصنف' });
      return;
    }

    const itemData: Item = {
      id: isNewMode ? 'item-' + Date.now() : currentItem.id,
      code: code.trim(),
      name: name.trim(),
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      unit,
      minQuantity: Number(minQuantity) || 0,
      openingStock: Number(openingStock) || 0,
      currentStock: isNewMode ? Number(openingStock) || 0 : currentItem.currentStock,
      category: category.trim(),
      barcode: barcode.trim() || undefined
    };

    if (isNewMode) {
      if (items.some(i => i.code === itemData.code)) {
        setStatusMessage({ type: 'error', text: 'كود الصنف موجود مسبقاً' });
        return;
      }
      addItem(itemData);
      setIsNewMode(false);
      setCurrentIndex(items.length);
      setStatusMessage({ type: 'success', text: `تم حفظ الصنف (${itemData.name}) بنجاح` });
    } else {
      updateItem(currentItem.id, itemData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات الصنف (${name})` });
    }
  };

  const handleDelete = () => {
    if (!currentItem) return;
    if (confirm(`هل أنت متأكد من حذف الصنف (${currentItem.name})؟`)) {
      deleteItem(currentItem.id);
      setStatusMessage({ type: 'success', text: 'تم حذف الصنف بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleSearch = (val: string) => {
    const idx = items.findIndex(i => i.code.toLowerCase().includes(val.toLowerCase()) || i.name.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل الأصناف والأسعار في المنظومة" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد الأصناف والأسعار</h1>
            <p className="text-xs text-slate-500">
              تكويد كود الصنف، اسم الصنف، سعر الشراء، سعر البيع، الوحدات والحد الأدنى للمخزون
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(items.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(items.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('items', 'edit')}
        canDelete={canAccess('items', 'delete')}
        canPrint={canAccess('items', 'print')}
        searchPlaceholder="استدعاء صنف بالاسم أو الكود..."
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
              {isNewMode ? 'تكويد صنف جديد' : `بيانات الصنف: ${name}`}
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              كود: {code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود الصنف *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="ITM-001"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الباركود (Barcode)</label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="622..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الصنف بالكامل *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="اسم وتوصيف الصنف"
                required
              />
            </div>

            {/* Buying & Selling Price */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>سعر الشراء (التكلفة) *</span>
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                className="w-full text-base font-bold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>سعر البيع الافتراضي *</span>
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={e => setSellingPrice(Number(e.target.value))}
                className="w-full text-base font-bold border border-emerald-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 bg-white text-emerald-800"
                required
              />
            </div>

            {/* Unit & Min Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الوحدة الرئيسية</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {['قطعة', 'جهاز', 'علبة', 'كرتونة', 'طقم', 'دستة', 'متر', 'كيلو', 'لتر'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحد الأدنى للطلب (تنبيه النواقص)</label>
              <input
                type="number"
                value={minQuantity}
                onChange={e => setMinQuantity(Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Opening Stock & Current Stock */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رصيد أول المدة (الافتتاحي)</label>
              <input
                type="number"
                value={openingStock}
                onChange={e => setOpeningStock(Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المجموعة / التصنيف</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between no-print">
            {!isNewMode && currentItem && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                currentItem.currentStock <= currentItem.minQuantity
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                الرصيد الفعلي الحالي في المخازن: {currentItem.currentStock} {currentItem.unit}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات الصنف
            </button>
          </div>
        </div>

        {/* List Table Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">الأصناف المسجلة ({items.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[550px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">اسم الصنف</th>
                  <th className="p-2.5 text-left">شراء</th>
                  <th className="p-2.5 text-left">بيع</th>
                  <th className="p-2.5 text-center">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-emerald-50/80 font-bold text-emerald-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 font-mono">{item.code}</td>
                    <td className="p-2.5 truncate max-w-[160px]">{item.name}</td>
                    <td className="p-2.5 font-mono text-left">{item.purchasePrice.toLocaleString('ar-EG')}</td>
                    <td className="p-2.5 font-mono text-left text-emerald-700 font-bold">{item.sellingPrice.toLocaleString('ar-EG')}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.currentStock <= item.minQuantity
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.currentStock}
                      </span>
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
