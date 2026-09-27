import React, { useState, useEffect } from 'react';
import { Users, User, Phone, MapPin, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const CustomersScreen: React.FC = () => {
  const { customers, employees, addCustomer, updateCustomer, deleteCustomer, canAccess } = useApp();

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

  const currentCust = customers[currentIndex];

  useEffect(() => {
    if (currentCust && !isNewMode) {
      setCode(currentCust.code);
      setName(currentCust.name);
      setPhone(currentCust.phone);
      setGovernorate(currentCust.governorate);
      setAddress(currentCust.address);
      setSalesRepEmployeeId(currentCust.salesRepEmployeeId);
      setOpeningBalance(currentCust.openingBalance);
      setNotes(currentCust.notes || '');
    }
  }, [currentCust, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`CUST-00${customers.length + 1}`);
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
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود واسم العميل' });
      return;
    }

    const rep = employees.find(e => e.id === salesRepEmployeeId);

    const custData: Customer = {
      id: isNewMode ? 'cust-' + Date.now() : currentCust.id,
      code: code.trim(),
      name: name.trim(),
      phone: phone.trim(),
      governorate,
      address: address.trim(),
      salesRepEmployeeId,
      salesRepName: rep?.name || 'غير محدد',
      openingBalance: Number(openingBalance) || 0,
      currentBalance: isNewMode ? Number(openingBalance) || 0 : currentCust.currentBalance,
      linkedAccountCode: '1121',
      notes: notes.trim() || undefined
    };

    if (isNewMode) {
      if (customers.some(c => c.code === custData.code)) {
        setStatusMessage({ type: 'error', text: 'كود العميل مسجل مسبقاً' });
        return;
      }
      addCustomer(custData);
      setIsNewMode(false);
      setCurrentIndex(customers.length);
      setStatusMessage({ type: 'success', text: `تم حفظ العميل (${custData.name}) بنجاح` });
    } else {
      updateCustomer(currentCust.id, custData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات العميل (${name})` });
    }
  };

  const handleDelete = () => {
    if (!currentCust) return;
    if (confirm(`هل أنت متأكد من حذف العميل (${currentCust.name})؟`)) {
      deleteCustomer(currentCust.id);
      setStatusMessage({ type: 'success', text: 'تم حذف العميل بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleSearch = (val: string) => {
    const idx = customers.findIndex(c => c.code.toLowerCase().includes(val.toLowerCase()) || c.name.includes(val) || c.phone.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل وسجل العملاء والمندوبين" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد العملاء</h1>
            <p className="text-xs text-slate-500">
              تسجيل العملاء وربطهم بالمندوبين والمحافظات وتحديد الأرصدة الافتتاحية وربطهم بشجرة الحسابات
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(customers.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(customers.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('customers', 'edit')}
        canDelete={canAccess('customers', 'delete')}
        canPrint={canAccess('customers', 'print')}
        searchPlaceholder="استدعاء عميل بالاسم أو الهاتف..."
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
              {isNewMode ? 'تكويد عميل جديد' : `بيانات العميل: ${name}`}
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              كود: {code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كود العميل *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="CUST-001"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل / المنشأة *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="اسم العميل أو الشركة"
                required
              />
            </div>

            {/* Sales Rep Linked Dropdown */}
            <div className="md:col-span-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
              <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>اسم المندوب (مربوط بشاشة تكويد الموظفين بقائمة منسدلة) *</span>
              </label>
              <select
                value={salesRepEmployeeId}
                onChange={e => setSalesRepEmployeeId(e.target.value)}
                className="w-full text-sm border border-blue-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-bold text-slate-800"
                required
              >
                <option value="">-- اختر الموظف المندوب المسند له العميل --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.jobTitle})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-blue-700 mt-1">
                يسمع اسم هذا المندوب تلقائياً في فاتورة المبيعات بمجرد اختيار العميل!
              </p>
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
                <span>الرصيد الافتتاحي (ج.م)</span>
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
                <span>العنوان التفصيلي</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="الشارع، المنطقة، علامات مميزة"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between no-print">
            {!isNewMode && currentCust && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                الرصيد الحالي للعميل: {currentCust.currentBalance.toLocaleString('ar-EG')} ج.م
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات العميل
            </button>
          </div>
        </div>

        {/* List Table Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">سجل العملاء ({customers.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[550px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">اسم العميل</th>
                  <th className="p-2.5">المندوب</th>
                  <th className="p-2.5">المحافظة</th>
                  <th className="p-2.5 text-left">الرصيد الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c, idx) => (
                  <tr
                    key={c.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-blue-50/80 font-bold text-blue-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 font-mono">{c.code}</td>
                    <td className="p-2.5">{c.name}</td>
                    <td className="p-2.5 text-blue-700 font-semibold">{c.salesRepName}</td>
                    <td className="p-2.5 text-slate-500">{c.governorate}</td>
                    <td className="p-2.5 font-mono text-left font-bold text-blue-900">
                      {c.currentBalance.toLocaleString('ar-EG')}
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
