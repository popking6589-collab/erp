import React, { useState, useEffect } from 'react';
import { Truck, User, Phone, MapPin, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const SuppliersScreen: React.FC = () => {
  const { suppliers, employees, addSupplier, updateSupplier, deleteSupplier, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [salesRepEmployeeId, setSalesRepEmployeeId] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [notes, setNotes] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentSupp = suppliers[currentIndex];

  useEffect(() => {
    if (currentSupp && !isNewMode) {
      setCode(currentSupp.code);
      setName(currentSupp.name);
      setPhone(currentSupp.phone);
      setGovernorate(currentSupp.governorate);
      setAddress(currentSupp.address);
      setSalesRepEmployeeId(currentSupp.salesRepEmployeeId);
      setOpeningBalance(currentSupp.openingBalance);
      setNotes(currentSupp.notes || '');
    }
  }, [currentSupp, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`SUP-00${suppliers.length + 1}`);
    setName('');
    setPhone('');
    setGovernorate('القاهرة');
    setAddress('');
    setSalesRepEmployeeId(employees[0]?.id || '');
    setOpeningBalance(0);
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود واسم المورد' });
      return;
    }

    const rep = employees.find(e => e.id === salesRepEmployeeId);

    const suppData: Supplier = {
      id: isNewMode ? 'supp-' + Date.now() : currentSupp.id,
      code: code.trim(),
      name: name.trim(),
      phone: phone.trim(),
      governorate,
      address: address.trim(),
      salesRepEmployeeId,
      salesRepName: rep?.name || 'غير محدد',
      openingBalance: Number(openingBalance) || 0,
      currentBalance: isNewMode ? Number(openingBalance) || 0 : currentSupp.currentBalance,
      linkedAccountCode: '2111',
      notes: notes.trim() || undefined
    };

    if (isNewMode) {
      if (suppliers.some(s => s.code === suppData.code)) {
        setStatusMessage({ type: 'error', text: 'كود المورد مسجل مسبقاً' });
        return;
      }
      addSupplier(suppData);
      setIsNewMode(false);
      setCurrentIndex(suppliers.length);
      setStatusMessage({ type: 'success', text: `تم حفظ المورد (${suppData.name}) بنجاح` });
    } else {
      updateSupplier(currentSupp.id, suppData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات المورد (${name})` });
    }
  };

  const handleDelete = () => {
    if (!currentSupp) return;
    if (confirm(`هل أنت متأكد من حذف المورد (${currentSupp.name})؟`)) {
      deleteSupplier(currentSupp.id);
      setStatusMessage({ type: 'success', text: 'تم حذف المورد بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleSearch = (val: string) => {
    const idx = suppliers.findIndex(s => s.code.toLowerCase().includes(val.toLowerCase()) || s.name.includes(val) || s.phone.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل وسجل الموردين والتوريدات" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد الموردين</h1>
            <p className="text-xs text-slate-500">
              تسجيل الموردين وربطهم بالمندوبين والمحافظات وتحديد الأرصدة الدائنة وربطهم بشجرة الحسابات
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(suppliers.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(suppliers.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('suppliers', 'edit')}
        canDelete={canAccess('suppliers', 'delete')}
        canPrint={canAccess('suppliers', 'print')}
        searchPlaceholder="استدعاء مورد بالاسم أو الهاتف..."
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
              {isNewMode ? 'تكويد مورد جديد' : `بيانات المورد: ${name}`}
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              كود: {code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود المورد *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="SUP-001"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم التليفون *</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="01xxxxxxxxx"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المورد / الشركة *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="اسم شركة التوريد أو المصنع"
                required
              />
            </div>

            {/* Sales Rep Linked Dropdown */}
            <div className="md:col-span-2 bg-orange-50/70 p-3 rounded-xl border border-orange-200">
              <label className="block text-xs font-bold text-orange-900 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>اسم المندوب المسؤول (مربوط بشاشة تكويد الموظفين بقائمة منسدلة) *</span>
              </label>
              <select
                value={salesRepEmployeeId}
                onChange={e => setSalesRepEmployeeId(e.target.value)}
                className="w-full text-sm border border-orange-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-bold text-slate-800"
                required
              >
                <option value="">-- اختر الموظف المسؤول عن متابعة المورد --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            {/* Governorate & Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
              <select
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'بني سويف', 'الفيوم', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح'].map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>الرصيد الافتتاحي المستحق للمورد (ج.م)</span>
              </label>
              <input
                type="number"
                value={openingBalance}
                onChange={e => setOpeningBalance(Number(e.target.value))}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>عنوان المورد</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="الشارع، المنطقة، المصنع..."
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between no-print">
            {!isNewMode && currentSupp && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-200">
                الرصيد الدائن الحالي للمورد: {currentSupp.currentBalance.toLocaleString('ar-EG')} ج.م
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات المورد
            </button>
          </div>
        </div>

        {/* List Table Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">سجل الموردين ({suppliers.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[550px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">اسم المورد</th>
                  <th className="p-2.5">المندوب</th>
                  <th className="p-2.5">المحافظة</th>
                  <th className="p-2.5 text-left">الرصيد الدائن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-orange-50/80 font-bold text-orange-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 font-mono">{s.code}</td>
                    <td className="p-2.5">{s.name}</td>
                    <td className="p-2.5 text-orange-700 font-semibold">{s.salesRepName}</td>
                    <td className="p-2.5 text-slate-500">{s.governorate}</td>
                    <td className="p-2.5 font-mono text-left font-bold text-orange-900">
                      {s.currentBalance.toLocaleString('ar-EG')}
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
