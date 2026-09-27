import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobTitle } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const JobsScreen: React.FC = () => {
  const { jobs, addJob, updateJob, deleteJob, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentJob = jobs[currentIndex];

  useEffect(() => {
    if (currentJob && !isNewMode) {
      setCode(currentJob.code);
      setTitle(currentJob.title);
      setNotes(currentJob.notes || '');
    }
  }, [currentJob, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`J-00${jobs.length + 1}`);
    setTitle('');
    setNotes('');
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !title.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود ومسمى الوظيفة' });
      return;
    }

    if (isNewMode) {
      if (jobs.some(j => j.code.trim() === code.trim())) {
        setStatusMessage({ type: 'error', text: 'كود الوظيفة مسجل مسبقاً!' });
        return;
      }
      const newJob: JobTitle = {
        id: 'job-' + Date.now(),
        code: code.trim(),
        title: title.trim(),
        notes: notes.trim() || undefined
      };
      addJob(newJob);
      setIsNewMode(false);
      setCurrentIndex(jobs.length);
      setStatusMessage({ type: 'success', text: `تم حفظ الوظيفة (${newJob.title}) بنجاح` });
    } else if (currentJob) {
      updateJob(currentJob.id, {
        code: code.trim(),
        title: title.trim(),
        notes: notes.trim() || undefined
      });
      setStatusMessage({ type: 'success', text: `تم تحديث الوظيفة (${title}) بنجاح` });
    }
  };

  const handleDelete = () => {
    if (!currentJob) return;
    if (confirm(`هل أنت متأكد من حذف الوظيفة (${currentJob.title})؟`)) {
      const ok = deleteJob(currentJob.id);
      if (ok) {
        setStatusMessage({ type: 'success', text: 'تم حذف الوظيفة بنجاح' });
        setCurrentIndex(Math.max(0, currentIndex - 1));
      } else {
        setStatusMessage({ type: 'error', text: 'لا يمكن حذف وظيفة مسندة إلى موظفين حاليين في الشركة' });
      }
    }
  };

  const handleSearch = (val: string) => {
    const idx = jobs.findIndex(j => j.code.toLowerCase().includes(val.toLowerCase()) || j.title.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="دليل وبطاقات الوظائف الإدارية" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد الوظائف</h1>
            <p className="text-xs text-slate-500">
              تكويد المسميات والدرجات الوظيفية وربطها التلقائي ببطاقات الموظفين والمستخدمين
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(jobs.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(jobs.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('jobs', 'edit')}
        canDelete={canAccess('jobs', 'delete')}
        canPrint={canAccess('jobs', 'print')}
        searchPlaceholder="استدعاء وظيفة..."
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
            {isNewMode ? 'إضافة بطاقة وظيفة جديدة' : `تعديل بيانات الوظيفة: ${title}`}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كود الوظيفة *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50"
              placeholder="مثال: J-001"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مسمى الوظيفة *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: مدير مالي / مندوب مبيعات"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف والمهام الوظيفية</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              placeholder="شرح المسؤوليات والمهام..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end no-print">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              حفظ بيانات الوظيفة
            </button>
          </div>
        </div>

        {/* Table List Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">قائمة الوظائف المكودة في المنظومة ({jobs.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2.5">م</th>
                  <th className="p-2.5">كود الوظيفة</th>
                  <th className="p-2.5">مسمى الوظيفة</th>
                  <th className="p-2.5">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      currentIndex === idx && !isNewMode ? 'bg-emerald-50/70 font-bold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-mono">{job.code}</td>
                    <td className="p-2.5">{job.title}</td>
                    <td className="p-2.5 text-slate-500">{job.notes || '-'}</td>
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
