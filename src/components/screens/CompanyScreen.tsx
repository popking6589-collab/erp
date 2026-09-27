import React, { useState } from 'react';
import { Building2, Save, Upload, CheckCircle2, ShieldCheck, Phone, MapPin, Hash, Mail, Printer, FileDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PrintHeader } from '../common/PrintHeader';

export const CompanyScreen: React.FC = () => {
  const { company, updateCompany, canAccess } = useApp();

  const [name, setName] = useState(company.name);
  const [logo, setLogo] = useState(company.logo);
  const [address, setAddress] = useState(company.address);
  const [phone, setPhone] = useState(company.phone);
  const [taxNumber, setTaxNumber] = useState(company.taxNumber);
  const [commercialRegister, setCommercialRegister] = useState(company.commercialRegister);
  const [email, setEmail] = useState(company.email);
  const [notes, setNotes] = useState(company.notes || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany({
      name,
      logo,
      address,
      phone,
      taxNumber,
      commercialRegister,
      email,
      notes
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="print-only">
        <PrintHeader title="بطاقة بيانات الشركة الرسمية" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد اسم وبيانات الشركة</h1>
            <p className="text-xs text-slate-500">
              تحديد الهوية المؤسسية وشعار المنشأة وبيانات التسجيل الضريبي والسجل التجاري لكافة الفواتير والتقارير
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-300"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة البطاقة</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const prev = document.title;
              document.title = `بطاقة_بيانات_الشركة_${company.name}`;
              window.print();
              setTimeout(() => { document.title = prev; }, 1500);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer border border-rose-300 shadow-xs"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ بيانات الشركة بنجاح، وستنعكس فوراً على كافة الترويسات والطباعة في البرنامج.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Logo and Name Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-100 pb-6">
          {/* Logo Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
            {logo ? (
              <img
                src={logo}
                alt="Company Logo"
                className="w-32 h-32 object-contain rounded-xl mb-3 border border-slate-200 bg-white"
              />
            ) : (
              <div className="w-32 h-32 bg-slate-200 rounded-xl flex items-center justify-center mb-3 text-slate-400">
                <Building2 className="w-12 h-12" />
              </div>
            )}
            <label className="text-xs bg-white hover:bg-slate-50 text-blue-600 border border-blue-300 font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>تحميل شعار الشركة</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-[10px] text-slate-400 mt-1">يظهر الشعار في أعلى كل فاتورة وتقرير مطبوع</p>
          </div>

          {/* Name & Slogan */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>اسم الشركة / المؤسسة *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أدخل اسم الشركة التجاري"
                className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>البريد الإلكتروني الرسمي</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                dir="ltr"
                placeholder="info@company.com"
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-left"
              />
            </div>
          </div>
        </div>

        {/* Legal & Tax Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>بيانات التسجيل الضريبي والتجاري</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم التسجيل الضريبي (البطاقة الضريبية) *</span>
              </label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="مثال: 482-910-332"
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم السجل التجاري *</span>
              </label>
              <input
                type="text"
                value={commercialRegister}
                onChange={e => setCommercialRegister(e.target.value)}
                placeholder="مثال: 109842"
                className="w-full text-sm font-mono font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>بيانات الاتصال والمقر الرئيسي</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>أرقام الهواتف والتواصل *</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx / 02xxxxxxxx"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>عنوان المقر الإداري الرئيسي *</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="الشارع، الحي، المحافظة..."
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            وصف ونشاط الشركة وملاحظات تذييل الفواتير
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="مثال: الموزع المعتمد للأجهزة الكهربائية والمكتبية..."
            className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end no-print">
          <button
            type="submit"
            disabled={!canAccess('company', 'edit')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>حفظ واعتماد بيانات الشركة</span>
          </button>
        </div>
      </form>
    </div>
  );
};
