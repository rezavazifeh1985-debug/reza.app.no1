/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Clock, Lock, User as UserIcon, LogIn, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { toPersianDigits, getPersianTodayString } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  allUsers: User[];
  onLogin: (user: User) => void;
}

export default function LoginPage({ allUsers, onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'manager' | 'staff'>('manager');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Categorize users based on roles/positions (Reza Vazifeh & Babak Mousavi are only admins/managers)
  const managers = allUsers.filter(u => u.isAdmin);
  const staff = allUsers.filter(u => !u.isAdmin);

  const currentCategoryUsers = activeTab === 'manager' ? managers : staff;

  // Filter users based on query
  const filteredUsers = currentCategoryUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery)
  );

  const selectedUser = allUsers.find(u => u.id === selectedUserId);

  const handleTabChange = (tab: 'manager' | 'staff') => {
    setActiveTab(tab);
    setSelectedUserId('');
    setPassword('');
    setError('');
    setSearchQuery('');
    setShowUserDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('لطفاً کاربر خود را انتخاب کنید.');
      return;
    }

    const userObj = allUsers.find(u => u.id === selectedUserId);
    if (!userObj) {
      setError('کاربر یافت نشد.');
      return;
    }

    const correctPassword = userObj.password || '1234';
    if (password === correctPassword) {
      onLogin(userObj);
    } else {
      setError('رمز عبور نادرست است. مجدداً تلاش کنید.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* Main Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden" id="login_card">
            
            {/* Dark Brand Header */}
            <div className="bg-slate-900 text-white p-8 text-center flex flex-col items-center justify-center relative">
              {/* Animated subtle grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
              
              {/* Logo (precisely rendered inline SVG) */}
              <div className="bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center w-16 h-16 flex-shrink-0 mb-4 relative z-10 hover:scale-105 transition-transform duration-300">
                <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  {/* Inner Divider lines */}
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#ffffff" strokeWidth="3" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="#ffffff" strokeWidth="3" />
                  
                  {/* Center branding FS text in overlay */}
                  <circle cx="50" cy="50" r="14" fill="#102A4A" stroke="#ffffff" strokeWidth="2" />
                  <text x="50" y="55" fill="#00b6f0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FS</text>
                </svg>
              </div>

              {/* Company & App Names */}
              <h2 className="text-base font-black text-white tracking-wide mb-1 relative z-10">
                هلدینگ کاویان سپنتا
              </h2>
              <p className="text-xs font-bold text-brand-cyan relative z-10 opacity-90">
                اتوماسیون اداری و سامانه هوشمند مدیریت عملکرد
              </p>
              <span className="text-[10px] text-slate-400 font-bold mt-2 font-mono bg-slate-800/80 px-2.5 py-1 rounded-full relative z-10 border border-slate-700">
                امروز: {getPersianTodayString()}
              </span>
            </div>

            {/* Form & Tab Section */}
            <div className="p-6 sm:p-8 text-right">
              
              {/* Category Selector Tab (Managers vs Personnel) */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex justify-between gap-1.5 mb-6" id="login_tabs">
                <button
                  type="button"
                  onClick={() => handleTabChange('manager')}
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === 'manager' 
                      ? 'bg-white text-slate-800 shadow-sm font-black' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  مدیران
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('staff')}
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === 'staff' 
                      ? 'bg-white text-slate-800 shadow-sm font-black' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  پرسنل
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Username / Phone selector */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1 flex justify-between">
                    <span>شماره تماس (نام کاربری)</span>
                    {selectedUser && (
                      <span className="text-[9px] text-brand-cyan bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                        {selectedUser.employeeCode}
                      </span>
                    )}
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 p-3 pr-10 pl-10 rounded-xl border border-slate-200 text-xs text-right text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-cyan flex items-center justify-between transition-all"
                    >
                      <span className="truncate">
                        {selectedUser ? `${selectedUser.name} - ${selectedUser.position}` : 'انتخاب کاربر...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Searchable dropdown panel */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-30 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                      >
                        <div className="p-2 border-b border-slate-100">
                          <input
                            type="text"
                            placeholder="جستجوی نام یا شماره تماس..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto pr-1">
                          {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs">موردی یافت نشد.</div>
                          ) : (
                            filteredUsers.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setShowUserDropdown(false);
                                  setError('');
                                }}
                                className="w-full text-right p-2.5 hover:bg-slate-50 text-xs flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                                    {user.avatar}
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-slate-800 block">{user.name}</span>
                                    <span className="text-[10px] text-slate-400 block">{user.position}</span>
                                  </div>
                                </div>
                                {selectedUserId === user.id && (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex justify-between items-center mb-1 pr-1">
                    <label className="text-[10px] font-bold text-slate-500">رمز عبور</label>
                    <span className="text-[9px] text-slate-400 font-bold">پیش‌فرض: ۱۲۳۴</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full bg-slate-50 p-3 pr-10 rounded-xl border border-slate-200 text-xs text-center focus:ring-1 focus:ring-brand-cyan focus:outline-none tracking-widest font-mono text-slate-800"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Validation errors */}
                {error && (
                  <p className="text-[10px] font-black text-rose-500 text-center bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    {error}
                  </p>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full bg-[#f59e0b] hover:bg-amber-600 active:bg-amber-700 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به سیستم</span>
                </button>

              </form>
            </div>
          </div>

          {/* Copyright notice block specifically requested to be at the bottom of the login screen */}
          <div className="text-center text-[10px] text-slate-400 font-bold space-y-1 select-none leading-relaxed">
            <p>اتوماسیون اداری و سامانه هوشمند مدیریت عملکرد</p>
            <p>طراحی و توسعه توسط Reza.Vazifeh</p>
            <p className="font-mono tracking-wider">Copyright (c) 2026 Reza.Vazifeh. All rights reserved</p>
          </div>

        </div>
      </div>
    </div>
  );
}
