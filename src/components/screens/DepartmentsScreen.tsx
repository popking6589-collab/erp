import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const DepartmentsScreen: React.FC = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentDept = departments[currentIndex];

  useEffect(() => {
    if (currentDept && !isNewMode) {
      setCode(currentDept.code);
      setName(currentDept.name);
      setNotes(currentDept.notes || '');
    }
  }, [currentDept, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`D-0${departments.length + 1}`);
    setName('');
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود واسم القسم' });
      return;
    }

    if (isNewMode) {
      if (departments.some(d => d.code.trim() === code.trim())) {
        setStatusMessage({ type: 'error', text: 'كود القسم مسجل مسبقاً!' });
        return;
      }
      const newDept: Department = {
        id: 'dept-' + Date.now(),
        code: code.trim(),
        name: name.trim(),
        notes: notes.trim() || undefined
      };
      addDepartment(newDept);
      setIsNewMode(false);
      setCurrentIndex(departments.length);
      setStatusMessage({ type: 'success', text: `تم حفظ قسم (${newDept.name}) بنجاح` });
    } else if (currentDept) {
      updateDepartment(currentDept.id, {
        code: code.trim(),
        name: name.trim(),
        notes: notes.trim() || undefined
      });
      setStatusMessage({ type: 'success', text: `تم تحديث قسم (${name}) بنجاح` });
    }
  };

  const handleDelete = () => {
    if (!currentDept) return;
    if (confirm(`هل أنت متأكد من حذف قسم (${currentDept.name})؟`)) {
      const ok = deleteDepartment(currentDept.id);
      if (ok) {
        setStatusMessage({ type: 'success', text: 'تم حذف القسم بنجاح' });
        setCurrentIndex(Math.max(0, currentIndex - 1));
      } else {
        setStatusMessage({ type: 'error', text: 'لا يمكن حذف قسم مسند إليه موظفون في الشركة' });
      }
    }
  };

  const handleSearch = (val: string) => {
    const idx = departments.findIndex(d => d.code.toLowerCase().includes(val.toLowerCase()) || d.name.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل أقسام وإدارات العمل" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد أقسام العمل</h1>
            <p className="text-xs text-slate-500">
              تكويد الهيكل الإداري والأقسام وربطها التلقائي بشاشة الموظفين
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(departments.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(departments.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('departments', 'edit')}
        canDelete={canAccess('departments', 'delete')}
        canPrint={canAccess('departments', 'print')}
        searchPlaceholder="استدعاء قسم بالاسم أو الكود..."
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
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isNewMode ? 'إضافة بطاقة قسم جديد' : `تعديل بيانات القسم: ${name}`}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كود القسم *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
              placeholder="مثال: D-01"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم القسم *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: الإدارة المالية / إدارة المبيعات"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات واختصاصات القسم</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="شرح اختصاصات القسم وموقعه..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end no-print">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات القسم
            </button>
          </div>
        </div>

        {/* Table List Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">قائمة أقسام العمل المكودة ({departments.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">كود القسم</th>
                  <th className="p-2.5">اسم القسم</th>
                  <th className="p-2.5">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept, idx) => (
                  <tr
                    key={dept.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-amber-50/70 font-bold text-amber-900' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-mono">{dept.code}</td>
                    <td className="p-2.5">{dept.name}</td>
                    <td className="p-2.5 text-slate-500">{dept.notes || '-'}</td>
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
