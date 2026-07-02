/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, SystemAlert } from '../types';
import { getPersianTodayString, toPersianDigits } from '../utils';
import { Bell, Shield, LogOut, ArrowLeftRight, Check, AlertCircle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  allUsers: User[];
  alerts: SystemAlert[];
  onClearAlerts: () => void;
  isDelegatedToOfficeManager: boolean;
  onToggleDelegation: () => void;
}

export default function Header({
  currentUser,
  onUserChange,
  allUsers,
  alerts,
  onClearAlerts,
  isDelegatedToOfficeManager,
  onToggleDelegation,
}: HeaderProps) {
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <header className="bg-brand-navy text-white shadow-md border-b-4 border-brand-cyan sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Right Side: Brand Logo and Title */}
          <div className="flex items-center space-x-reverse space-x-4">
            {/* Handcrafted precise recreation of the FKS diamond sector logo in SVG */}
            <div className="bg-white p-1.5 rounded-xl shadow-inner flex items-center justify-center w-12 h-12 flex-shrink-0">
              <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sector Top Right - Deep Navy */}
                <path d="M50 45 L90 5 C75 12, 62 25, 50 45" fill="#102A4A" />
                <path d="M50 45 L90 5 C95 20, 95 35, 90 50 Z" fill="#102a4a" />
                {/* Sector Top Left - Cyan */}
                <path d="M50 45 L10 5 C5 20, 5 35, 10 50 Z" fill="#00b6f0" />
                <path d="M50 45 L10 5 C25 12, 38 25, 50 45" fill="#00b6f0" />
                {/* Sector Bottom Left - Deep Navy */}
                <path d="M50 55 L10 95 C25 88, 38 75, 50 55" fill="#102A4A" />
                <path d="M50 55 L10 95 C5 80, 5 65, 10 50 Z" fill="#102A4A" />
                {/* Sector Bottom Right - Cyan */}
                <path d="M50 55 L90 95 C95 80, 95 65, 90 50 Z" fill="#00b6f0" />
                <path d="M50 55 L90 95 C75 88, 62 75, 50 55" fill="#00b6f0" />
                {/* Inner Divider line */}
                <line x1="10" y1="50" x2="90" y2="50" stroke="#ffffff" strokeWidth="3" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="#ffffff" strokeWidth="3" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight md:text-xl">
                هلدینگ کاویان سپنتا
              </h1>
              <span className="text-xs text-brand-cyan block font-medium">
                سامانه هوشمند اتوماسیون اداری و مدیریت عملکرد
              </span>
            </div>
          </div>

          {/* Center: Current Persian Date */}
          <div className="hidden lg:flex flex-col items-center bg-brand-navy/60 px-4 py-2 rounded-xl border border-brand-cyan/25">
            <span className="text-xs text-brand-cyan/80 font-medium">تاریخ و زمان امروز ستاد</span>
            <span className="text-sm font-bold text-white transition-all">
              {getPersianTodayString()}
            </span>
          </div>

          {/* Left Side: Current User Profile, Role selection & notifications */}
          <div className="flex items-center space-x-reverse space-x-3">
            
            {/* Quick Delegation Alert Indicator */}
            {isDelegatedToOfficeManager && (
              <div className="hidden md:flex items-center space-x-reverse space-x-1.5 bg-amber-500/20 border border-amber-500 text-amber-300 text-[10px] md:text-xs py-1 px-2.5 rounded-full">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>کل دسترسی‌ها به مدیر دفتر منتقل شد</span>
              </div>
            )}

            {/* Notifications Hub */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlertsDropdown(!showAlertsDropdown);
                  setShowRoleSelector(false);
                }}
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl relative border border-slate-700 hover:border-brand-cyan transition-all cursor-pointer"
                title="اعلان‌های سیستم"
                id="notification_bell_btn"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-navy animate-pulse">
                    {toPersianDigits(unreadAlerts.length)}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showAlertsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden"
                  >
                    <div className="p-4 bg-brand-navy text-white flex justify-between items-center border-b border-slate-700">
                      <span className="font-bold text-sm">اعلان‌ها و هشدارهای جدید</span>
                      <button
                        onClick={onClearAlerts}
                        className="text-xs text-brand-cyan hover:underline flex items-center space-x-reverse space-x-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>پاک کردن همه</span>
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <span>هیچ اعلانی یافت نشد.</span>
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3.5 border-b border-slate-100 flex items-start space-x-reverse space-x-3 hover:bg-slate-50 transition-colors ${
                              !alert.isRead ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-brand-cyan mt-1.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.message}</p>
                              <span className="text-[10px] text-slate-400 block mt-2 text-left">
                                {alert.createdAt}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Switch Persona Action */}
            <button
              onClick={() => {
                setShowRoleSelector(!showRoleSelector);
                setShowAlertsDropdown(false);
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 hover:border-brand-cyan transition-all flex items-center space-x-reverse space-x-1.5 cursor-pointer text-xs font-bold"
              id="role_switcher_btn"
            >
              <ArrowLeftRight className="w-4 h-4 text-brand-cyan" />
              <span className="hidden md:inline">تعویض نقش کاربری</span>
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center space-x-reverse space-x-2 bg-slate-800/60 p-1 pl-3.5 rounded-2xl border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md overflow-hidden">
                {currentUser.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('data:image')) ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.avatar
                )}
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white pr-1">{currentUser.name}</span>
                <span className="text-[10px] text-zinc-400 font-medium scale-[0.95] origin-right bg-slate-900 px-1.5 py-0.5 rounded-full mt-0.5">
                  {currentUser.position}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Expandable Role Persona Manager Slider */}
      <AnimatePresence>
        {showRoleSelector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-950 border-t border-slate-800 shadow-inner"
          >
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-reverse space-x-2">
                  <RefreshCw className="w-4 h-4 text-brand-cyan animate-spin" />
                  <span className="text-xs font-black text-brand-cyan">تغییر شبیه‌ساز دسترسی پرسنل و سطوح امنیتی</span>
                </div>
                <span className="text-[10px] text-slate-500">برای مشاهده پنل اختصاصی، تاییدها و کارتابلهای هر شخص کلیک کنید</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {allUsers.map((user) => {
                  const isCur = user.id === currentUser.id;
                  let badgeColor = "bg-slate-900 border-slate-800 text-slate-300";
                  if (isCur) badgeColor = "bg-brand-cyan text-brand-navy font-bold border-brand-cyan";
                  else if (user.isAdmin) badgeColor = "border-amber-500 bg-amber-500/10 text-amber-300";
                  else if (user.isOfficeManager) badgeColor = "border-emerald-500 bg-emerald-500/10 text-emerald-300";
                  
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setPendingUser(user);
                        setPasswordInput('');
                        setAuthError('');
                        setShowPassword(false);
                      }}
                      className={`text-right p-2.5 rounded-xl border transition-all text-xs hover:scale-[1.03] duration-150 cursor-pointer flex flex-col justify-between h-16 ${badgeColor}`}
                      id={`user_select_${user.id}`}
                    >
                      <span className="font-extrabold truncate">{user.name}</span>
                      <span className="text-[10px] opacity-80 truncate">{user.position}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Password Authentication during Login Switch */}
      <AnimatePresence>
        {pendingUser && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 relative text-slate-800 text-right font-sans"
              id="login_auth_modal"
            >
              <button
                type="button"
                onClick={() => setPendingUser(null)}
                className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center justify-center text-center mt-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan text-brand-navy flex items-center justify-center font-black text-xl mb-2 shadow-lg shadow-cyan-500/20 overflow-hidden">
                  {pendingUser.avatar && (pendingUser.avatar.startsWith('http') || pendingUser.avatar.startsWith('data:image')) ? (
                    <img src={pendingUser.avatar} alt={pendingUser.name} className="w-full h-full object-cover" />
                  ) : (
                    pendingUser.avatar
                  )}
                </div>
                <h3 className="text-sm font-black text-slate-900">ورود به پنل اتوماسیون</h3>
                <span className="text-xs font-bold text-slate-800 mt-1 block bg-slate-100 px-3 py-1 rounded-full">{pendingUser.name}</span>
                <span className="text-[10px] text-slate-400 mt-1">{pendingUser.position}</span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pendingUser.password === passwordInput) {
                    onUserChange(pendingUser);
                    setPendingUser(null);
                    setShowRoleSelector(false);
                  } else {
                    setAuthError('رمز ورود نادرست است! مجددا تلاش کنید.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">رمز ورود را وارد نمایید</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-center focus:ring-1 focus:ring-brand-cyan focus:outline-none tracking-widest font-mono text-slate-800"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-[10px] text-slate-400 hover:text-slate-650 focus:outline-none"
                    >
                      {showPassword ? 'پنهان' : 'نمایش'}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="text-[10px] font-bold text-rose-500 text-center bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                    {authError}
                  </p>
                )}

                <div className="text-[10px] text-slate-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 text-center">
                  رمز عبور پیش‌فرض تمام کاربران <strong className="font-mono text-xs text-brand-navy">1234</strong> می‌باشد.
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer shadow-md shadow-brand-cyan/20 transition-all text-center"
                  >
                    تایید و ورود به کارتابل
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingUser(null)}
                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
