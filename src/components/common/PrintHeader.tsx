import React from 'react';
import { useApp } from '../../context/AppContext';

interface PrintHeaderProps {
  title: string;
  docNumber?: string;
  date?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ title, docNumber, date }) => {
  const { company } = useApp();

  return (
    <div className="print-card border-b-2 border-slate-800 pb-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Company Logo & Name */}
        <div className="flex items-center gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt="Logo"
              className="w-16 h-16 object-contain rounded-lg border border-slate-200"
            />
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

        {/* Document Title in Middle */}
        <div className="text-center px-4 py-2 border-2 border-slate-900 rounded-lg bg-slate-50">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          {docNumber && (
            <p className="text-xs font-bold text-blue-700 mt-0.5">رقم المستند: {docNumber}</p>
          )}
          {date && (
            <p className="text-[11px] text-slate-600">التاريخ: {date}</p>
          )}
        </div>

        {/* Tax and Commercial Register */}
        <div className="text-left text-xs space-y-1 text-slate-700">
          <p><span className="font-bold">رقم التسجيل الضريبي:</span> {company.taxNumber || 'غير محدد'}</p>
          <p><span className="font-bold">السجل التجاري:</span> {company.commercialRegister || 'غير محدد'}</p>
          <p><span className="font-bold">البريد الإلكتروني:</span> {company.email || '-'}</p>
        </div>
      </div>
    </div>
  );
};
