import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  X,
  FileText,
  Receipt,
  Sparkles,
  PackageCheck,
  Check,
  Building2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tafqeet } from '../../utils/tafqeet';

export type PrintTemplateType = 'standard' | 'thermal' | 'modern' | 'dispatch';

export interface PrintableInvoiceData {
  title: string;
  invoiceNo: string;
  date: string;
  dueDate?: string;
  partnerType: 'عميل' | 'مورد' | 'جهة';
  partnerName: string;
  partnerPhone?: string;
  partnerAddress?: string;
  partnerTaxNo?: string;
  salesRepName?: string;
  warehouseName?: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    discountPercent?: number;
    discountAmount?: number;
    net: number;
  }>;
  subtotal: number;
  taxPercent?: number;
  taxAmount?: number;
  withholdingTaxPercent?: number;
  withholdingTaxAmount?: number;
  discountAmount?: number;
  netTotal: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  payments?: Array<{
    id: string;
    date: string;
    amount: number;
    paymentMethod?: string;
    method?: string;
    cashBankName?: string;
    referenceNo?: string;
    reference?: string;
  }>;
}

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintableInvoiceData | null;
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, data }) => {
  const { company, currentUser } = useApp();

  const [activeTemplate, setActiveTemplate] = useState<PrintTemplateType>('standard');
  const [showSignatures, setShowSignatures] = useState(true);
  const [showTafqeet, setShowTafqeet] = useState(true);
  const [showQR, setShowQR] = useState(true);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    const originalTitle = document.title;
    document.title = `${data.title}_${data.invoiceNo}_${data.date}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const wordedAmount = tafqeet(data.netTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95">
        
        {/* Top Dialog Toolbar (Hidden in print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">معاينة واختيار نماذج الطباعة والـ PDF</h3>
              <p className="text-[11px] text-slate-400">
                اختر شكل ونموذج الفاتورة الأنسب (A4 ضريبي / كاشير حراري / عصري / إذن تسليم) واطبع أو احفظ PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 text-xs transition cursor-pointer"
              title="طباعة عبر الطابعة"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 text-xs transition cursor-pointer"
              title="طباعة وتصدير كملف PDF رسمي (اختر حفظ كـ PDF)"
            >
              <FileDown className="w-4 h-4" />
              <span>طباعة PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector & Options Bar (Hidden in print) */}
        <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          {/* Templates Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTemplate('standard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTemplate === 'standard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>النموذج الرسمي (A4)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTemplate === 'thermal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>بون كاشير حراري (80mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate('modern')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTemplate === 'modern'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>النموذج العصري الأنيق</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplate('dispatch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTemplate === 'dispatch'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>إذن تسليم بضاعة ومخزن</span>
            </button>
          </div>

          {/* Feature Toggles */}
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>التوقيعات والختم</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showTafqeet}
                onChange={e => setShowTafqeet(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>التفقيط العربي</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showQR}
                onChange={e => setShowQR(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>رمز QR الضريبي</span>
            </label>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70">
          
          {/* ======================================================== */}
          {/* 1. STANDARD FORMAL A4 TEMPLATE */}
          {/* ======================================================== */}
          {activeTemplate === 'standard' && (
            <div className="w-full max-w-[800px] bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-300 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
              
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {company.logo ? (
                    <img src={company.logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-2xl">
                      {company.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-black text-slate-900 leading-tight">{company.name}</h1>
                    <p className="text-xs text-slate-600 mt-0.5">{company.address}</p>
                    <p className="text-xs text-slate-600">هاتف: {company.phone}</p>
                  </div>
                </div>

                <div className="text-center px-4 py-2 border-2 border-slate-900 rounded-xl bg-slate-50">
                  <h2 className="text-base font-black text-slate-900">{data.title}</h2>
                  <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">رقم: {data.invoiceNo}</p>
                  <p className="text-[11px] text-slate-600 font-mono">التاريخ: {data.date}</p>
                </div>

                <div className="text-left text-xs space-y-1 text-slate-700">
                  <p><span className="font-bold">س.ت:</span> {company.commercialRegister || '-'}</p>
                  <p><span className="font-bold">رقم ضريبي:</span> {company.taxNumber || '-'}</p>
                  <p><span className="font-bold">البريد:</span> {company.email || '-'}</p>
                </div>
              </div>

              {/* Partner and Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">بيانات {data.partnerType}</span>
                  <p className="font-bold text-sm text-slate-900">{data.partnerName}</p>
                  {data.partnerPhone && <p className="text-slate-600">هاتف: {data.partnerPhone}</p>}
                  {data.partnerAddress && <p className="text-slate-600">العنوان: {data.partnerAddress}</p>}
                  {data.partnerTaxNo && <p className="text-slate-600">رقم التسجيل الضريبي: {data.partnerTaxNo}</p>}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">تفاصيل الفاتورة والشحن</span>
                  <div className="grid grid-cols-2 gap-1 text-slate-700">
                    <p><span className="font-bold">المستودع:</span> {data.warehouseName || 'المخزن الرئيسي'}</p>
                    <p><span className="font-bold">طريقة الدفع:</span> {data.paymentMethod}</p>
                    <p><span className="font-bold">المندوب:</span> {data.salesRepName || 'غير محدد'}</p>
                    {data.dueDate && <p><span className="font-bold">تاريخ الاستحقاق:</span> {data.dueDate}</p>}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="p-2.5 text-center">م</th>
                      <th className="p-2.5">كود الصنف</th>
                      <th className="p-2.5">اسم الصنف والبيان</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-left">سعر الوحدة</th>
                      <th className="p-2.5 text-left">خصم</th>
                      <th className="p-2.5 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-mono text-slate-600">{item.itemCode}</td>
                        <td className="p-2.5 font-bold text-slate-900">{item.itemName}</td>
                        <td className="p-2.5 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="p-2.5 text-left font-mono">{item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-left font-mono text-slate-500">{item.discountAmount ? item.discountAmount.toFixed(2) : '-'}</td>
                        <td className="p-2.5 text-left font-mono font-bold text-slate-900">{item.net.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals & Tafqeet */}
              <div className="grid grid-cols-2 gap-4 items-start text-xs">
                {/* Right: Notes, Payments & Tafqeet */}
                <div className="space-y-3">
                  {showTafqeet && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-bold text-[11px]">
                      <span>المبلغ كتابةً: </span>
                      <span>{wordedAmount}</span>
                    </div>
                  )}

                  {data.notes && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5">ملاحظات:</span>
                      <p>{data.notes}</p>
                    </div>
                  )}

                  {/* Payment Installments if any */}
                  {data.payments && data.payments.length > 0 && (
                    <div className="border border-slate-200 rounded-xl p-2.5 space-y-1">
                      <span className="font-bold text-slate-800 text-[11px] block">دفعات السداد المسجلة:</span>
                      {data.payments.map((p, i) => (
                        <div key={i} className="flex justify-between text-[11px] text-slate-600">
                          <span>{p.date} ({p.paymentMethod || p.method || 'نقدي'}{p.cashBankName ? ` - ${p.cashBankName}` : ''})</span>
                          <span className="font-mono font-bold text-emerald-700">{p.amount.toFixed(2)} ج.م</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Left: Summary Totals Box */}
                <div className="bg-slate-50 rounded-xl border border-slate-300 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>الإجمالي قبل الضريبة:</span>
                    <span className="font-mono font-bold">{data.subtotal.toFixed(2)} ج.م</span>
                  </div>

                  {data.discountAmount !== undefined && data.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>إجمالي الخصم الممنوح:</span>
                      <span className="font-mono font-bold">-{data.discountAmount.toFixed(2)} ج.م</span>
                    </div>
                  )}

                  {data.taxAmount !== undefined && (
                    <div className="flex justify-between text-slate-700">
                      <span>ضريبة القيمة المضافة ({data.taxPercent || 14}%):</span>
                      <span className="font-mono font-bold">+{data.taxAmount.toFixed(2)} ج.م</span>
                    </div>
                  )}

                  {data.withholdingTaxAmount !== undefined && data.withholdingTaxAmount > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>إشعار خصم أ.ت.ص ({data.withholdingTaxPercent || 1}%):</span>
                      <span className="font-mono font-bold">-{data.withholdingTaxAmount.toFixed(2)} ج.م</span>
                    </div>
                  )}

                  <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-900">
                    <span>الصافي النهائي المطلوب:</span>
                    <span className="font-mono text-base text-blue-700">{data.netTotal.toFixed(2)} ج.م</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>المبلغ المسدد:</span>
                    <span className="font-mono">{data.paidAmount.toFixed(2)} ج.م</span>
                  </div>

                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>المبلغ المتبقي المستحق:</span>
                    <span className="font-mono">{data.remainingAmount.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp */}
              {showSignatures && (
                <div className="pt-6 border-t border-slate-300 grid grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-8">المستلم / العميل</span>
                    <span className="border-t border-dashed border-slate-400 block pt-1 text-slate-500">التوقيع والاسم</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-8">أمين المخزن</span>
                    <span className="border-t border-dashed border-slate-400 block pt-1 text-slate-500">التوقيع والتسليم</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-8">المحاسب المسؤول</span>
                    <span className="border-t border-dashed border-slate-400 block pt-1 text-slate-500">{currentUser?.employeeName || 'محمود عبد الرحمن'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-8">اعتماد الإدارة / الختم</span>
                    <div className="w-16 h-16 border-2 border-dashed border-blue-600 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold text-blue-700 rotate-[-12deg]">
                      ختم الشركة
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. THERMAL POS RECEIPT TEMPLATE (80mm) */}
          {/* ======================================================== */}
          {activeTemplate === 'thermal' && (
            <div className="w-[340px] bg-white text-slate-900 p-4 rounded-xl shadow-xl border border-slate-300 font-mono text-[11px] leading-tight space-y-3 print:shadow-none print:border-none print:p-0 print:m-0">
              
              {/* Thermal Centered Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-800 pb-3">
                <div className="font-black text-sm text-slate-900 font-sans">{company.name}</div>
                <div className="text-[10px] text-slate-600 font-sans">{company.address}</div>
                <div className="text-[10px] text-slate-600">هاتف: {company.phone}</div>
                <div className="text-[10px] text-slate-600">رقم ضريبي: {company.taxNumber}</div>
                <div className="pt-1 font-bold text-xs bg-slate-100 py-0.5 rounded font-sans">{data.title}</div>
              </div>

              {/* Receipt Meta */}
              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold">{data.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ والوقت:</span>
                  <span>{data.date}</span>
                </div>
                <div className="flex justify-between font-sans">
                  <span>{data.partnerType}:</span>
                  <span className="font-bold">{data.partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>الكاشير:</span>
                  <span>{currentUser?.employeeName || 'مسؤول المبيعات'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-dashed border-slate-800 pb-2">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-200 pb-1">
                  <span>الصنف</span>
                  <span>الكمية × السعر</span>
                  <span>الإجمالي</span>
                </div>
                {data.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold font-sans text-slate-900">{item.itemName}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{item.itemCode}</span>
                      <span>{item.quantity} × {item.unitPrice.toFixed(2)}</span>
                      <span className="font-bold text-slate-900">{item.net.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Receipt Totals */}
              <div className="space-y-1 text-xs border-b border-dashed border-slate-800 pb-2">
                <div className="flex justify-between text-[11px]">
                  <span>المجموع:</span>
                  <span>{data.subtotal.toFixed(2)}</span>
                </div>
                {data.taxAmount !== undefined && (
                  <div className="flex justify-between text-[11px]">
                    <span>ضريبة ق.م ({data.taxPercent || 14}%):</span>
                    <span>{data.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {data.discountAmount !== undefined && data.discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] text-rose-600">
                    <span>خصم:</span>
                    <span>-{data.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-900">
                  <span>الصافي:</span>
                  <span>{data.netTotal.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800 font-bold">
                  <span>المسدد ({data.paymentMethod}):</span>
                  <span>{data.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-rose-700 font-bold">
                  <span>المتبقي:</span>
                  <span>{data.remainingAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* QR Code / ZATCA Simulation */}
              {showQR && (
                <div className="flex flex-col items-center justify-center py-2 space-y-1 text-center">
                  <div className="p-2 border border-slate-300 rounded bg-white">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans">فاتورة ضريبية مبسطة معتمدة</span>
                </div>
              )}

              {/* Thermal Footer */}
              <div className="text-center text-[10px] text-slate-600 pt-1 font-sans">
                <p>شكراً لتعاملكم معنا ونرحب بكم دائماً</p>
                <p className="text-[9px] text-slate-400 mt-1">البضاعة المباعة ترد وتستبدل خلال 14 يوماً بالفاتورة</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. MODERN ELEGANT TEMPLATE */}
          {/* ======================================================== */}
          {activeTemplate === 'modern' && (
            <div className="w-full max-w-[800px] bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-300 overflow-hidden print:shadow-none print:border-none print:max-w-none">
              
              {/* Modern Top Header Banner */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 flex items-center justify-between">
                <div>
                  <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {data.title}
                  </span>
                  <h1 className="text-2xl font-black mt-1">{company.name}</h1>
                  <p className="text-xs text-blue-100">{company.address}</p>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs text-blue-200">رقم الفاتورة</span>
                  <div className="text-xl font-black text-white">{data.invoiceNo}</div>
                  <div className="text-xs text-blue-100">{data.date}</div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-8 space-y-6 text-xs">
                
                {/* Partner Card & Status Badge */}
                <div className="flex items-center justify-between p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">الموجه إليه:</span>
                    <div className="text-base font-black text-slate-900">{data.partnerName}</div>
                    <div className="text-slate-600 flex items-center gap-3 mt-1">
                      {data.partnerPhone && <span>هاتف: {data.partnerPhone}</span>}
                      {data.partnerAddress && <span>العنوان: {data.partnerAddress}</span>}
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      data.remainingAmount <= 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{data.remainingAmount <= 0 ? 'مسددة بالكامل' : 'فاتورة آجلة / جزئية'}</span>
                    </span>
                    <div className="text-[11px] text-slate-500">طريقة الدفع: {data.paymentMethod}</div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3">الصنف والبيان</th>
                        <th className="p-3 text-center">الكمية</th>
                        <th className="p-3 text-left">السعر</th>
                        <th className="p-3 text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{item.itemName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.itemCode}</div>
                          </td>
                          <td className="p-3 text-center font-bold font-mono">{item.quantity}</td>
                          <td className="p-3 text-left font-mono">{item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-left font-mono font-bold text-slate-900">{item.net.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modern Bottom Total Box */}
                <div className="flex justify-between items-center p-5 bg-slate-900 text-white rounded-2xl">
                  <div>
                    <span className="text-slate-400 text-xs block">المبلغ الإجمالي المستحق</span>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {data.netTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} <span className="text-xs text-white">ج.م</span>
                    </div>
                    {showTafqeet && (
                      <p className="text-[11px] text-slate-300 mt-1 font-medium">{wordedAmount}</p>
                    )}
                  </div>

                  <div className="text-left text-xs space-y-1 font-mono">
                    <div className="text-slate-400">المسدد: {data.paidAmount.toFixed(2)} ج.م</div>
                    <div className="text-rose-400 font-bold">المتبقي: {data.remainingAmount.toFixed(2)} ج.م</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. DISPATCH / WAREHOUSE DELIVERY NOTE */}
          {/* ======================================================== */}
          {activeTemplate === 'dispatch' && (
            <div className="w-full max-w-[800px] bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-300 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
              
              <div className="border-b-2 border-amber-600 pb-3 flex items-center justify-between">
                <div>
                  <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    إذن تسليم وصرف بضاعة من المخزن
                  </span>
                  <h1 className="text-xl font-black text-slate-900 mt-1">{company.name}</h1>
                </div>

                <div className="text-center p-3 border-2 border-amber-600 rounded-xl bg-amber-50/50">
                  <h2 className="text-sm font-black text-amber-900">سند تسليم مخزني</h2>
                  <p className="text-xs font-mono font-bold text-slate-800">مستند: {data.invoiceNo}</p>
                  <p className="text-[11px] text-slate-600">التاريخ: {data.date}</p>
                </div>
              </div>

              {/* Warehouse & Receiver Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-400 block mb-1">المستودع المصروف منه:</span>
                  <div className="font-black text-slate-900 text-sm">{data.warehouseName || 'المستودع الرئيسي'}</div>
                  <div className="text-slate-600">المسؤول: {data.salesRepName || 'أمين المستودع'}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block mb-1">المستلم والجهة:</span>
                  <div className="font-black text-slate-900 text-sm">{data.partnerName}</div>
                  <div className="text-slate-600">{data.partnerAddress}</div>
                </div>
              </div>

              {/* Items with quantities and verification checkbox */}
              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="p-3 text-center">م</th>
                      <th className="p-3">كود الصنف</th>
                      <th className="p-3">اسم الصنف والمواصفات</th>
                      <th className="p-3 text-center">الكمية المسلمة</th>
                      <th className="p-3 text-center">المطابقة والفحص</th>
                      <th className="p-3">ملاحظات المستلم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-mono text-slate-600">{item.itemCode}</td>
                        <td className="p-3 font-bold text-slate-900">{item.itemName}</td>
                        <td className="p-3 text-center font-black font-mono text-base text-blue-700">{item.quantity}</td>
                        <td className="p-3 text-center">
                          <div className="w-4 h-4 border-2 border-slate-400 rounded mx-auto" />
                        </td>
                        <td className="p-3 text-slate-400">سليم ومطابق</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dispatch Signatures */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-10">أمين المخزن (الصارف)</span>
                  <span className="border-t border-dashed border-slate-400 block pt-1 text-slate-500">التوقيع والتاريخ</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-10">سائق الشاحنة / المندوب</span>
                  <span className="border-t border-dashed border-slate-400 block pt-1 text-slate-500">التوقيع ورقم السيارة</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-10">المستلم النهائي</span>
                  <span className="border-t border-dashed border-slate-400 block pt-1 text-slate-500">الاسم، الرقم القومي، والتوقيع</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Footer (Hidden in print) */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs no-print">
          <div className="text-slate-500">
            <span>النموذج المحدد حالياً: </span>
            <span className="font-bold text-blue-700">
              {activeTemplate === 'standard' && 'النموذج الضريبي الرسمي (A4)'}
              {activeTemplate === 'thermal' && 'بون كاشير حراري (80mm)'}
              {activeTemplate === 'modern' && 'النموذج العصري الأنيق'}
              {activeTemplate === 'dispatch' && 'إذن تسليم بضاعة ومخزن'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>تأكيد الطباعة (Print)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
