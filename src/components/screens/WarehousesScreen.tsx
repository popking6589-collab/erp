import React, { useState, useEffect } from 'react';
import { Boxes, Building2, User, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Warehouse } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const WarehousesScreen: React.FC = () => {
  const { warehouses, employees, addWarehouse, updateWarehouse, deleteWarehouse, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [managerEmployeeId, setManagerEmployeeId] = useState('');
  const [phone, setPhone] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentWh = warehouses[currentIndex];

  useEffect(() => {
    if (currentWh && !isNewMode) {
      setCode(currentWh.code);
      setName(currentWh.name);
      setAddress(currentWh.address);
      setManagerEmployeeId(currentWh.managerEmployeeId);
      setPhone(currentWh.phone || '');
    }
  }, [currentWh, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`WH-0${warehouses.length + 1}`);
    setName('');
    setAddress('');
    setManagerEmployeeId(employees[0]?.id || '');
    setPhone('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود واسم المخزن' });
      return;
    }

    const mgr = employees.find(e => e.id === managerEmployeeId);

    const whData: Warehouse = {
      id: isNewMode ? 'wh-' + Date.now() : currentWh.id,
      code: code.trim(),
      name: name.trim(),
      address: address.trim(),
      managerEmployeeId,
      managerName: mgr?.name || 'غير محدد',
      phone: phone.trim()
    };

    if (isNewMode) {
      if (warehouses.some(w => w.code === whData.code)) {
        setStatusMessage({ type: 'error', text: 'كود المخزن موجود مسبقاً' });
        return;
      }
      addWarehouse(whData);
      setIsNewMode(false);
      setCurrentIndex(warehouses.length);
      setStatusMessage({ type: 'success', text: `تم حفظ المخزن (${whData.name}) بنجاح` });
    } else {
      updateWarehouse(currentWh.id, whData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات المخزن (${name})` });
    }
  };

  const handleDelete = () => {
    if (!currentWh) return;
    if (warehouses.length <= 1) {
      setStatusMessage({ type: 'error', text: 'يجب أن يحتوي النظام على مخزن واحد على الأقل' });
      return;
    }
    if (confirm(`هل أنت متأكد من حذف المستودع (${currentWh.name})؟`)) {
      deleteWarehouse(currentWh.id);
      setStatusMessage({ type: 'success', text: 'تم حذف المخزن بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleSearch = (val: string) => {
    const idx = warehouses.findIndex(w => w.code.toLowerCase().includes(val.toLowerCase()) || w.name.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل المخازن والمستودعات المكودة" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-600 text-white rounded-xl shadow-md shadow-cyan-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد المخازن</h1>
            <p className="text-xs text-slate-500">
              تكويد المخازن والفروع وعناوينها وربط مسؤول المخزن بقائمة منسدلة من شاشة الموظفين
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(warehouses.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(warehouses.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('warehouses', 'edit')}
        canDelete={canAccess('warehouses', 'delete')}
        canPrint={canAccess('warehouses', 'print')}
        searchPlaceholder="استدعاء مخزن..."
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
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isNewMode ? 'تكويد مستودع جديد' : `بيانات المخزن: ${name}`}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كود المخزن *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
              placeholder="WH-01"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المخزن / الفرع *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: المخزن الرئيسي - القاهرة"
              required
            />
          </div>

          {/* Linked Manager Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-cyan-600" />
              <span>مسؤول المخزن (مربوط بقائمة منسدلة من شاشة الموظفين) *</span>
            </label>
            <select
              value={managerEmployeeId}
              onChange={e => setManagerEmployeeId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
              required
            >
              <option value="">-- اختر أمين المخزن من الموظفين --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.jobTitle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>عنوان وموقع المخزن</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="المنطقة الصناعية، الشارع..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">هاتف المخزن</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="01xxxxxxxxx"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end no-print">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات المخزن
            </button>
          </div>
        </div>

        {/* List Table Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">المخازن والمستودعات المسجلة ({warehouses.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">اسم المخزن</th>
                  <th className="p-2.5">المسؤول (أمين المخزن)</th>
                  <th className="p-2.5">العنوان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map((wh, idx) => (
                  <tr
                    key={wh.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-cyan-50/80 font-bold text-cyan-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 font-mono">{wh.code}</td>
                    <td className="p-2.5 font-bold">{wh.name}</td>
                    <td className="p-2.5 text-cyan-800">{wh.managerName}</td>
                    <td className="p-2.5 text-slate-500 truncate max-w-[200px]">{wh.address}</td>
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
