import React, { useState, useEffect } from 'react';
import { UserCheck, Upload, CheckCircle2, AlertCircle, Phone, Calendar, CreditCard, Award, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';

export const EmployeesScreen: React.FC = () => {
  const { employees, jobs, departments, addEmployee, updateEmployee, deleteEmployee, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [jobId, setJobId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [salary, setSalary] = useState(0);
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState('2024-01-01');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentEmp = employees[currentIndex];

  useEffect(() => {
    if (currentEmp && !isNewMode) {
      setCode(currentEmp.code);
      setName(currentEmp.name);
      setJobId(currentEmp.jobId);
      setDepartmentId(currentEmp.departmentId);
      setSalary(currentEmp.salary);
      setBirthDate(currentEmp.birthDate);
      setNationalId(currentEmp.nationalId);
      setAddress(currentEmp.address);
      setQualification(currentEmp.qualification);
      setPhotoUrl(currentEmp.photoUrl || '');
      setPhone(currentEmp.phone || '');
      setHireDate(currentEmp.hireDate || '2024-01-01');
    }
  }, [currentEmp, isNewMode]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNew = () => {
    setIsNewMode(true);
    setCode(`EMP-10${employees.length + 1}`);
    setName('');
    setJobId(jobs[0]?.id || '');
    setDepartmentId(departments[0]?.id || '');
    setSalary(8000);
    setBirthDate('1995-01-01');
    setNationalId('');
    setAddress('');
    setQualification('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
    setPhone('');
    setHireDate(new Date().toISOString().split('T')[0]);
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال كود واسم الموظف' });
      return;
    }

    const selectedJob = jobs.find(j => j.id === jobId);
    const selectedDept = departments.find(d => d.id === departmentId);

    const empData: Employee = {
      id: isNewMode ? 'emp-' + Date.now() : currentEmp.id,
      code: code.trim(),
      name: name.trim(),
      jobId,
      jobTitle: selectedJob?.title || 'غير محدد',
      departmentId,
      departmentName: selectedDept?.name || 'غير محدد',
      salary: Number(salary) || 0,
      birthDate,
      nationalId: nationalId.trim(),
      address: address.trim(),
      qualification: qualification.trim(),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      phone: phone.trim(),
      hireDate
    };

    if (isNewMode) {
      if (employees.some(e => e.code === empData.code)) {
        setStatusMessage({ type: 'error', text: 'كود الموظف مسجل مسبقاً!' });
        return;
      }
      addEmployee(empData);
      setIsNewMode(false);
      setCurrentIndex(employees.length);
      setStatusMessage({ type: 'success', text: `تم حفظ الموظف (${empData.name}) بنجاح` });
    } else {
      updateEmployee(currentEmp.id, empData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات الموظف (${name}) بنجاح` });
    }
  };

  const handleDelete = () => {
    if (!currentEmp) return;
    if (confirm(`هل أنت متأكد من حذف الموظف (${currentEmp.name})؟`)) {
      const ok = deleteEmployee(currentEmp.id);
      if (ok) {
        setStatusMessage({ type: 'success', text: 'تم حذف الموظف بنجاح' });
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  const handleSearch = (val: string) => {
    const idx = employees.findIndex(e => e.code.toLowerCase().includes(val.toLowerCase()) || e.name.includes(val));
    if (idx !== -1) {
      setCurrentIndex(idx);
      setIsNewMode(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="بطاقة بيانات موظف" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة تكويد الموظفين</h1>
            <p className="text-xs text-slate-500">
              تسجيل الموظفين وربطهم بالوظائف والأقسام وإدارة الرواتب والصور واستخدامهم كمندوبين ومسؤولي مخازن ومستخدمين
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(employees.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(employees.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('employees', 'edit')}
        canDelete={canAccess('employees', 'delete')}
        canPrint={canAccess('employees', 'print')}
        searchPlaceholder="استدعاء موظف بالاسم أو الكود..."
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
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              {isNewMode ? 'تكويد بطاقة موظف جديد' : `بيانات الموظف: ${name}`}
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              كود: {code}
            </span>
          </div>

          {/* Top: Photo & Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Photo Box */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <img
                src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt="Employee"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 shadow-sm mb-2 bg-white"
              />
              <label className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition">
                <Upload className="w-3 h-3" />
                <span>إرفاق صورة الموظف</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {/* Code & Name */}
            <div className="sm:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود الموظف *</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف بالكامل *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="الاسم الرباعي للموظف"
                  required
                />
              </div>
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الوظيفة (مربوطة بشاشة الوظائف) *
              </label>
              <select
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                required
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                القسم (مربوط بشاشة أقسام العمل) *
              </label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                required
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الشهري (ج.م) *</label>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(Number(e.target.value))}
                className="w-full text-sm font-bold border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-emerald-700"
                required
              />
            </div>

            {/* National ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>الرقم القومي (14 رقم)</span>
              </label>
              <input
                type="text"
                maxLength={14}
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="29000000000000"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>تاريخ الميلاد</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>رقم هاتف الموظف</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="01xxxxxxxxx"
              />
            </div>

            {/* Qualification */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                <span>المؤهل الدراسي والتخصص</span>
              </label>
              <input
                type="text"
                value={qualification}
                onChange={e => setQualification(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="بكالوريوس تجارة / هندسة / ليسانس..."
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>محل الإقامة والعنوان بالتفصيل</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder="الشارع، المنطقة، المحافظة"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end no-print">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer"
            >
              حفظ بيانات الموظف
            </button>
          </div>
        </div>

        {/* List Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">سجل الموظفين ({employees.length})</h3>
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {employees.map((emp, idx) => (
              <div
                key={emp.id}
                onClick={() => { setCurrentIndex(idx); setIsNewMode(false); }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                  currentIndex === idx && !isNewMode
                    ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <img
                  src={emp.photoUrl}
                  alt={emp.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                  <p className="text-[11px] text-purple-700 font-semibold truncate">{emp.jobTitle}</p>
                  <p className="text-[10px] text-slate-400">{emp.departmentName}</p>
                </div>
                <div className="text-left font-mono text-[11px] text-slate-500">
                  {emp.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
