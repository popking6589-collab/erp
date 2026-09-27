import React, { useState } from 'react';
import { X, Check, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';

interface QuickSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newSupplier: Supplier) => void;
}

export const QuickSupplierModal: React.FC<QuickSupplierModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { suppliers, employees, addSupplier } = useApp();

  const [code, setCode] = useState(() => `SUPP-00${suppliers.length + 1}`);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [salesRepEmployeeId, setSalesRepEmployeeId] = useState(employees[0]?.id || '');
  const [openingBalance, setOpeningBalance] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rep = employees.find(e => e.id === salesRepEmployeeId);
    const newSupp: Supplier = {
      id: 'supp-' + Date.now(),
      code: code.trim() || `SUPP-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      governorate,
      address: address.trim(),
      salesRepEmployeeId,
      salesRepName: rep?.name || 'غير محدد',
      openingBalance: Number(openingBalance) || 0,
      currentBalance: Number(openingBalance) || 0,
      linkedAccountCode: '2111'
    };

    addSupplier(newSupp);
    onCreated(newSupp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>تكويد مورد جديد سريع (من داخل الفاتورة)</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">كود المورد *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المورد / الشركة *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: شركة النصر للتوريدات"
                className="w-full border border-slate-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المحافظة</label>
              <select
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="الشرقية">الشرقية</option>
                <option value="الدقهلية">الدقهلية</option>
                <option value="القليوبية">القليوبية</option>
                <option value="الغربية">الغربية</option>
                <option value="المنوفية">المنوفية</option>
                <option value="أخرى">محافظة أخرى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">العنوان بالتفصيل</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="الشارع - المنطقة - المعلم البارز"
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المندوب المسؤول (من الموظفين)</label>
              <select
                value={salesRepEmployeeId}
                onChange={e => setSalesRepEmployeeId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">الرصيد الافتتاحي (دائن / له)</label>
              <input
                type="number"
                value={openingBalance}
                onChange={e => setOpeningBalance(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وإدراج بالفاتورة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
