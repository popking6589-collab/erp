import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Key, CheckCircle2, AlertCircle, CheckSquare, Square, Eye, Plus, Edit, Trash2, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppUser, ScreenId } from '../../types';
import { ActionBar } from '../common/ActionBar';
import { PrintHeader } from '../common/PrintHeader';
import { createFullPermissions } from '../../data/initialData';

const screenList: { id: ScreenId; name: string; category: string }[] = [
  { id: 'dashboard', name: 'الرئيسية ولوحة المؤشرات', category: 'عام' },
  { id: 'system_admin', name: 'مركز التهيئة والإدارة العامة للنظام', category: 'التهيئة' },
  { id: 'company', name: 'تكويد الشركة وبياناتها', category: 'التهيئة' },
  { id: 'jobs', name: 'تكويد الوظائف', category: 'التهيئة' },
  { id: 'departments', name: 'أقسام العمل', category: 'التهيئة' },
  { id: 'employees', name: 'تكويد الموظفين', category: 'الموارد البشرية' },
  { id: 'users', name: 'المستخدمين والصلاحيات', category: 'التهيئة' },
  { id: 'accounts', name: 'شجرة الحسابات والدليل وميزان المراجعة', category: 'الحسابات' },
  { id: 'cash_bank', name: 'تكويد الخزائن والبنوك', category: 'المالية' },
  { id: 'receipt_voucher', name: 'سندات القبض', category: 'المالية' },
  { id: 'payment_voucher', name: 'سندات الصرف', category: 'المالية' },
  { id: 'journal_entries', name: 'قيود اليومية العامة', category: 'الحسابات' },
  { id: 'warehouses', name: 'تكويد المخازن', category: 'المخازن' },
  { id: 'items', name: 'تكويد الأصناف والأسعار', category: 'المخازن' },
  { id: 'customers', name: 'تكويد العملاء والمندوبين', category: 'العملاء' },
  { id: 'suppliers', name: 'تكويد الموردين', category: 'الموردين' },
  { id: 'operations_hub', name: 'مركز وسجل الفواتير والعمليات الشامل', category: 'المبيعات' },
  { id: 'sales_invoice', name: 'فاتورة مبيعات', category: 'المبيعات' },
  { id: 'sales_return', name: 'مردودات مبيعات', category: 'المبيعات' },
  { id: 'purchase_invoice', name: 'فاتورة مشتريات', category: 'المشتريات' },
  { id: 'purchase_return', name: 'مردودات مشتريات', category: 'المشتريات' },
  { id: 'stock_adjustments', name: 'تسويات جردية', category: 'المخازن' },
  { id: 'warehouse_transfer', name: 'تحويل بين المخازن', category: 'المخازن' },
  { id: 'reports', name: 'التقارير والقوائم المالية', category: 'التقارير' }
];

export const UsersScreen: React.FC = () => {
  const { users, employees, addUser, updateUser, deleteUser, canAccess } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNewMode, setIsNewMode] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<any>(createFullPermissions());

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUserItem = users[currentIndex];

  useEffect(() => {
    if (currentUserItem && !isNewMode) {
      setUsername(currentUserItem.username);
      setPassword(currentUserItem.password || '');
      setEmployeeId(currentUserItem.employeeId || '');
      setIsActive(currentUserItem.isActive);
      setIsAdmin(currentUserItem.isAdmin);
      setPermissions(currentUserItem.permissions || createFullPermissions());
    }
  }, [currentUserItem, isNewMode]);

  const handleNew = () => {
    setIsNewMode(true);
    setUsername('');
    setPassword('');
    setEmployeeId(employees[0]?.id || '');
    setIsActive(true);
    setIsAdmin(false);
    setPermissions(createFullPermissions());
    setStatusMessage(null);
  };

  const handleSave = () => {
    if (!username.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال اسم المستخدم' });
      return;
    }

    const linkedEmp = employees.find(e => e.id === employeeId);

    const userData: AppUser = {
      id: isNewMode ? 'user-' + Date.now() : currentUserItem.id,
      username: username.trim().toLowerCase(),
      password: password.trim() || undefined,
      employeeId,
      employeeName: linkedEmp?.name,
      isActive,
      isAdmin,
      permissions,
      createdAt: isNewMode ? new Date().toISOString().split('T')[0] : currentUserItem.createdAt
    };

    if (isNewMode) {
      if (users.some(u => u.username.toLowerCase() === userData.username)) {
        setStatusMessage({ type: 'error', text: 'اسم المستخدم موجود بالفعل' });
        return;
      }
      addUser(userData);
      setIsNewMode(false);
      setCurrentIndex(users.length);
      setStatusMessage({ type: 'success', text: `تم إنشاء المستخدم (${userData.username}) بنجاح` });
    } else {
      updateUser(currentUserItem.id, userData);
      setStatusMessage({ type: 'success', text: `تم تحديث بيانات وصلاحيات المستخدم (${username})` });
    }
  };

  const handleDelete = () => {
    if (!currentUserItem) return;
    if (currentUserItem.username === 'admin') {
      setStatusMessage({ type: 'error', text: 'لا يمكن حذف حساب المسؤول الرئيسي admin' });
      return;
    }
    if (confirm(`هل أنت متأكد من حذف المستخدم (${currentUserItem.username})؟`)) {
      deleteUser(currentUserItem.id);
      setStatusMessage({ type: 'success', text: 'تم حذف المستخدم بنجاح' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const toggleAll = (field: 'canView' | 'canAdd' | 'canEdit' | 'canDelete' | 'canPrint', value: boolean) => {
    const updated = { ...permissions };
    screenList.forEach(s => {
      if (!updated[s.id]) {
        updated[s.id] = { canView: true, canAdd: true, canEdit: true, canDelete: true, canPrint: true };
      }
      updated[s.id][field] = value;
    });
    setPermissions(updated);
  };

  const toggleScreenPermission = (screenId: ScreenId, field: 'canView' | 'canAdd' | 'canEdit' | 'canDelete' | 'canPrint') => {
    setPermissions((prev: any) => ({
      ...prev,
      [screenId]: {
        ...(prev[screenId] || { canView: true, canAdd: true, canEdit: true, canDelete: true, canPrint: true }),
        [field]: !prev[screenId]?.[field]
      }
    }));
  };

  return (
    <div className="space-y-4">
      <div className="print-only">
        <PrintHeader title="جدول المستخدمين وصلاحيات نقاط المنظومة" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md shadow-rose-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">شاشة المستخدمين وصلاحيات الاستخدام</h1>
            <p className="text-xs text-slate-500">
              ربط الموظف كمستخدم للنظام، إضافة كلمة المرور، وتحديد صلاحيات دقيقة على كل شاشة
            </p>
          </div>
        </div>
      </div>

      <ActionBar
        onFirst={() => { setCurrentIndex(0); setIsNewMode(false); }}
        onPrev={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsNewMode(false); }}
        onNext={() => { setCurrentIndex(Math.min(users.length - 1, currentIndex + 1)); setIsNewMode(false); }}
        onLast={() => { setCurrentIndex(users.length - 1); setIsNewMode(false); }}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={() => window.print()}
        isNewMode={isNewMode}
        canEdit={canAccess('users', 'edit')}
        canDelete={canAccess('users', 'delete')}
        canPrint={canAccess('users', 'print')}
        searchPlaceholder="استدعاء مستخدم..."
        onSearchChange={val => {
          const idx = users.findIndex(u => u.username.includes(val) || (u.employeeName && u.employeeName.includes(val)));
          if (idx !== -1) {
            setCurrentIndex(idx);
            setIsNewMode(false);
          }
        }}
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
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            {isNewMode ? 'إضافة مستخدم جديد' : `بيانات المستخدم: ${username}`}
          </h2>

          {/* Linked Employee Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>الموظف (مربوط بقائمة منسدلة من شاشة الموظفين) *</span>
            </label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
              required
            >
              <option value="">-- اختر موظف من شاشة الموظفين --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code} - {emp.jobTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم الدخول (Username) *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              dir="ltr"
              className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-left font-bold"
              placeholder="username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>كلمة المرور (Password) *</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              dir="ltr"
              className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-left"
              placeholder="••••••••"
            />
          </div>

          {/* Status Switches */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <label htmlFor="activeChk" className="text-xs font-bold text-slate-800 cursor-pointer">
                الحساب نشط (Active)
              </label>
              <input
                type="checkbox"
                id="activeChk"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <label htmlFor="adminChk" className="text-xs font-bold text-indigo-900 cursor-pointer">
                مدير النظام (كامل الصلاحيات دون قيود)
              </label>
              <input
                type="checkbox"
                id="adminChk"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>

          {/* Users List Mini */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 mb-2">المستخدمين الحاليين ({users.length}):</h3>
            <div className="space-y-1">
              {users.map((u, i) => (
                <div
                  key={u.id}
                  onClick={() => { setCurrentIndex(i); setIsNewMode(false); }}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer ${
                    currentIndex === i && !isNewMode ? 'bg-rose-50 border border-rose-200 font-bold text-rose-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{u.username}</span>
                  <span className="text-[10px] text-slate-400">{u.employeeName || 'غير مسند'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Table Card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>صلاحيات شاشات ونقاط البرنامج للمستخدم</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin ? 'المستخدم محدد كمدير نظام (يمتلك كافة الصلاحيات تلقائياً)' : 'حدد بدقة الشاشات المسموح للمستخدم برؤيتها، الإضافة فيها، التعديل، الحذف، والطباعة'}
              </p>
            </div>

            {/* Quick bulk buttons */}
            <div className="flex items-center gap-1 text-[11px] font-bold no-print">
              <button
                type="button"
                onClick={() => {
                  const full = createFullPermissions();
                  setPermissions(full);
                }}
                className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                تحديد الكل
              </button>
              <button
                type="button"
                onClick={() => {
                  const empty: any = {};
                  screenList.forEach(s => {
                    empty[s.id] = { canView: false, canAdd: false, canEdit: false, canDelete: false, canPrint: false };
                  });
                  setPermissions(empty);
                }}
                className="px-2 py-1 bg-slate-50 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء الكل
              </button>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[550px] overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800 text-white sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">نقطة وشاشة البرنامج</th>
                  <th className="p-2.5 text-center">القسم</th>
                  <th className="p-2.5 text-center">
                    <span className="flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" /> عرض</span>
                  </th>
                  <th className="p-2.5 text-center">
                    <span className="flex items-center justify-center gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</span>
                  </th>
                  <th className="p-2.5 text-center">
                    <span className="flex items-center justify-center gap-1"><Edit className="w-3.5 h-3.5" /> تعديل</span>
                  </th>
                  <th className="p-2.5 text-center">
                    <span className="flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" /> حذف</span>
                  </th>
                  <th className="p-2.5 text-center">
                    <span className="flex items-center justify-center gap-1"><Printer className="w-3.5 h-3.5" /> طباعة</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {screenList.map(screen => {
                  const perm = permissions[screen.id] || { canView: false, canAdd: false, canEdit: false, canDelete: false, canPrint: false };
                  return (
                    <tr key={screen.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-slate-800">{screen.name}</td>
                      <td className="p-2 text-center text-slate-400 text-[11px]">{screen.category}</td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={isAdmin || perm.canView}
                          disabled={isAdmin}
                          onChange={() => toggleScreenPermission(screen.id, 'canView')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={isAdmin || perm.canAdd}
                          disabled={isAdmin}
                          onChange={() => toggleScreenPermission(screen.id, 'canAdd')}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={isAdmin || perm.canEdit}
                          disabled={isAdmin}
                          onChange={() => toggleScreenPermission(screen.id, 'canEdit')}
                          className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={isAdmin || perm.canDelete}
                          disabled={isAdmin}
                          onChange={() => toggleScreenPermission(screen.id, 'canDelete')}
                          className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={isAdmin || perm.canPrint}
                          disabled={isAdmin}
                          onChange={() => toggleScreenPermission(screen.id, 'canPrint')}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end no-print">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 cursor-pointer"
            >
              حفظ وتطبيق الصلاحيات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
