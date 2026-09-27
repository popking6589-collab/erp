import React, { useState } from 'react';
import { Lock, User, Key, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, login, logout, company } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة!');
    }
  };

  const handleQuickLogin = (uname: string, pwd?: string) => {
    setUsername(uname);
    setPassword(pwd || '');
    const ok = login(uname, pwd);
    if (ok) {
      setErrorMsg('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-blue-600/30 text-blue-400 border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black">{company.name}</h2>
          <p className="text-xs text-slate-300 mt-1">تسجيل الدخول وإدارة جلسة المستخدمين</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>اسم المستخدم (Username)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                dir="ltr"
                className="w-full text-sm font-mono border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 text-left font-bold"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>كلمة المرور (Password)</span>
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

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              دخول إلى النظام
            </button>
          </form>

          {/* Quick User Switcher Pills */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block text-center">
              تبديل سريع لحساب مستخدم تجريبي:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.username, u.password)}
                  className={`p-2 rounded-xl text-xs border text-right transition cursor-pointer ${
                    currentUser?.id === u.id
                      ? 'bg-blue-50 border-blue-300 font-bold text-blue-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>{u.username}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{u.employeeName || (u.isAdmin ? 'مدير عام' : 'مستخدم')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
