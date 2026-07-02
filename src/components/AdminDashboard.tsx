/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Task, BankingRecord, CommercialRecord, Suggestion, BusinessRule, TaskTransferRequest, PerformanceEvaluation, LeaveRequest, MissionRequest, CompanyDocument, DailyPerformanceReport, EmergencyHoliday, AttendanceRecord, DailyPrayer } from '../types';
import { formatCurrency, toPersianDigits, downloadCSV, printDocument } from '../utils';
import { 
  Users, CheckCircle2, Clock, Landmark, Award, TrendingUp, Settings, Plus, Trash2, 
  ToggleLeft, ToggleRight, FileText, Check, X, AlertTriangle, Briefcase, FileSpreadsheet, Printer, ArrowRightLeft, DollarSign, Lock, Key, Database, Download, Upload, RefreshCw, Calendar, Sparkles, Send
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  allTasks: Task[];
  bankRecords: BankingRecord[];
  commercials: CommercialRecord[];
  suggestions: Suggestion[];
  businessRules: BusinessRule[];
  transferRequests: TaskTransferRequest[];
  onAddUser: (user: User) => void;
  onUpdateUser: (userId: string, updated: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onApproveBank: (bankId: string) => void;
  onRejectBank: (bankId: string) => void;
  onApproveCommercial: (commId: string, commissionPercent: number) => void;
  onRejectCommercial: (commId: string) => void;
  onApproveSuggestion: (sugId: string, bonus: number, comment: string) => void;
  onRejectSuggestion: (sugId: string, comment: string) => void;
  onToggleRule: (ruleId: string) => void;
  onApproveTransfer: (reqId: string) => void;
  onRejectTransfer: (reqId: string) => void;
  isDelegatedToOfficeManager: boolean;
  onToggleDelegation: () => void;
  onAddRule: (rule: BusinessRule) => void;
  onRestoreDemoScenario?: () => void;
  onWipeAndResetRaw?: (mode: 'only_ceo' | 'keep_personnel_clean') => void;
  onImportFullBackup?: (backup: any) => void;
  
  // New administrative modules props
  leaveRequests: LeaveRequest[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  missionRequests: MissionRequest[];
  onApproveMission: (id: string) => void;
  onRejectMission: (id: string) => void;
  emergencyHolidays: EmergencyHoliday[];
  onAddEmergencyHoliday: (hol: EmergencyHoliday) => void;
  companyDocuments: CompanyDocument[];
  onApproveDocument: (id: string, phase: 'internal' | 'admin') => void;
  onRejectDocument: (id: string) => void;
  onEscrowLend: (id: string, borrower: string, returnDate: string) => void;
  onEscrowReturn: (id: string) => void;
  onApproveEscrow?: (id: string) => void;
  onRejectEscrow?: (id: string) => void;
  dailyReports: DailyPerformanceReport[];
  attendanceRecords: AttendanceRecord[];
  onApproveLocationDiscrepancy: (attId: string, status: 'approved' | 'rejected') => void;
  dailyPrayers?: DailyPrayer[];
  onReplyPrayer?: (prayerId: string, replyText: string, targetUserId?: string) => void;
}

export default function AdminDashboard({
  currentUser,
  allUsers,
  allTasks,
  bankRecords,
  commercials,
  suggestions,
  businessRules,
  transferRequests,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onApproveBank,
  onRejectBank,
  onApproveCommercial,
  onRejectCommercial,
  onApproveSuggestion,
  onRejectSuggestion,
  onToggleRule,
  onApproveTransfer,
  onRejectTransfer,
  isDelegatedToOfficeManager,
  onToggleDelegation,
  onAddRule,
  onRestoreDemoScenario,
  onWipeAndResetRaw,
  onImportFullBackup,
  
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
  missionRequests,
  onApproveMission,
  onRejectMission,
  emergencyHolidays,
  onAddEmergencyHoliday,
  companyDocuments,
  onApproveDocument,
  onRejectDocument,
  onEscrowLend,
  onEscrowReturn,
  onApproveEscrow,
  onRejectEscrow,
  dailyReports,
  attendanceRecords,
  onApproveLocationDiscrepancy,
  dailyPrayers = [],
  onReplyPrayer,
}: AdminDashboardProps) {

  // UI Tabs inside Adminpanel
  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'banking' | 'deals' | 'suggestions' | 'rules' | 'daily_report' | 'data_management' | 'leaves_missions' | 'documents' | 'prayers'>('kpis');

  // Prayer management state
  const [selectedPrayerUserId, setSelectedPrayerUserId] = useState<string>('all');
  const [prayerReplyInputs, setPrayerReplyInputs] = useState<Record<string, string>>({});

  // New User State Form
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserToReset, setSelectedUserToReset] = useState<User | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPassSuccess, setResetPassSuccess] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('');
  const [newUserPosition, setNewUserPosition] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserDept, setNewUserDept] = useState('');
  const [newUserSalary, setNewUserSalary] = useState(15000000);
  const [newUserBenefits, setNewUserBenefits] = useState(4000000);

  // New Rule State Form
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('');
  const [ruleAction, setRuleAction] = useState('');
  const [ruleDescr, setRuleDescr] = useState('');

  // Daily report date setting
  const [reportDate, setReportDate] = useState('۱۴۰۵/۰۴/۰۳');

  // Custom Suggestion Action States
  const [selectedSug, setSelectedSug] = useState<Suggestion | null>(null);
  const [sugBonus, setSugBonus] = useState(500000);
  const [sugComment, setSugComment] = useState('');

  // Custom Commercial Action States
  const [selectedComm, setSelectedComm] = useState<CommercialRecord | null>(null);
  const [commRate, setCommRate] = useState(0.5); // Default 0.5% commission rate

  // New administrative modules states
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('۱۴۰۵/۰۴/۰۳');

  // Calculated Stats
  const activeStaffCount = allUsers.filter(u => u.isWorking).length;
  const presentCount = 8; // Demo preset count
  const openTasksCount = allTasks.filter(t => t.status !== 'completed' && t.status !== 'archived').length;
  const delayedTasksCount = allTasks.filter(t => t.status === 'in_progress' && t.progress < 50).length; // simple delay calc

  // Analytical Chart Data Sets
  const performanceTrendData = [
    { name: 'شنبه', حضور_غیاب: 94, امتیاز_عملکرد: 92, کارایی_تیمی: 88 },
    { name: 'یکشنبه', حضور_غیاب: 98, امتیاز_عملکرد: 95, کارایی_تیمی: 92 },
    { name: 'دوشنبه', حضور_غیاب: 96, امتیاز_عملکرد: 94, کارایی_تیمی: 90 },
    { name: 'سه‌شنبه', حضور_غیاب: 90, امتیاز_عملکرد: 91, کارایی_تیمی: 86 },
    { name: 'چهارشنبه', حضور_غیاب: 99, امتیاز_عملکرد: 97, کارایی_تیمی: 95 },
  ];

  const financialStatsData = [
    { name: 'بخش خرید', مبلغ: 4280000000 },
    { name: 'بخش فروش', مبلغ: 7650000000 },
    { name: 'هزینه جاری', مبلغ: 580000000 },
    { name: 'پاداش تایید‌شده', مبلغ: 184000000 },
  ];

  const COLORS = ['#00b6f0', '#22c55e', '#f43f5e', '#eab308'];

  // Handle Add User submission code
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPosition) return;

    const randomId = 'user_' + Math.random().toString(36).substring(2, 9);
    const codeNum = 100 + allUsers.length + 1;
    const newUser: User = {
      id: randomId,
      name: newUserName,
      position: newUserPosition,
      employeeCode: `KS-${codeNum}`,
      avatar: newUserAvatar || newUserName.split(' ').map(n => n[0]).join(''),
      department: newUserDept || 'عمومی',
      hireDate: '۱۴۰۵/۰۴/۰۱',
      phone: newUserPhone || '۰۹۱۲۰۰۰۰۰۰۰',
      isWorking: true,
      financialInfo: {
        baseSalary: Number(newUserSalary),
        benefits: Number(newUserBenefits),
        bonus: 0,
        commission: 0,
        deductions: 0
      },
      currentScore: 100,
      avgScore: 100,
      isAdmin: false,
      isOfficeManager: false,
      password: '1234'
    };

    onAddUser(newUser);
    setShowAddUserModal(false);
    // Reset inputs
    setNewUserName('');
    setNewUserAvatar('');
    setNewUserPosition('');
    setNewUserPhone('');
    setNewUserDept('');
    setNewUserSalary(15000000);
    setNewUserBenefits(4000000);
  };

  // Add Smart Rule submission code
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !ruleTrigger || !ruleAction) return;

    const nextRule: BusinessRule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      name: ruleName,
      triggerEvent: ruleTrigger,
      actionType: ruleAction,
      isActive: true,
      descr: ruleDescr
    };

    onAddRule(nextRule);
    setShowAddRuleModal(false);
    setRuleName('');
    setRuleTrigger('');
    setRuleAction('');
    setRuleDescr('');
  };

  // Export Daily Report to Excel
  const exportReportExcel = () => {
    const reportDataArray = [
      { بخش: 'فروش صادراتی میلگرد', تناژ: '۱۲۰ تن', مبلغ: '۳,۶۰۰,۰۰۰,۰۰۰ تومان', نماینده: 'آقای رحیمی' },
      { بخش: 'خرید ذغال سنگ کک', تناژ: '۴۰ تن', مبلغ: '۶۸۰,۰۰۰,۰۰۰ تومان', نماینده: 'آقای موسوی' },
      { بخش: 'هزینه‌های جاری اداری', تناژ: '-', مبلغ: '۸,۲۰۰,۰۰۰ تومان', نماینده: 'خانم زرگر' },
    ];
    downloadCSV(reportDataArray, `گزارش_روزانه_${reportDate.replace(/\//g, '_')}`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Admin banner & Delegation switch */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white rounded-3xl p-6 shadow-xl border-l-8 border-brand-cyan flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-reverse space-x-2">
            <Settings className="w-6 h-6 text-brand-cyan animate-spin-slow" />
            <h2 className="text-xl font-black">پنل مدیریتی هلدینگ کاویان سپنتا</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 pl-1">
            سطح دسترسی: {isDelegatedToOfficeManager && currentUser.isOfficeManager ? 'تفویض شده به مدیر دفتر' : 'مدیریت کل سیستم (موسوی-وظیفه)'}
          </p>
        </div>

        {/* The delegation Switch trigger - "قابلیت انتقال تمام فعالیت هاو دسترسی های خود با یک تیک به مدیر دفتر" */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-3 min-w-[310px] shadow-md">
          <div className="flex flex-col text-right">
            <span className="text-xs font-extrabold text-white">تفویض اختیارات به مدیر دفتر</span>
            <span className="text-[10px] text-zinc-400 mt-0.5">انتقال تمام اختیارات و دسترسی‌ها به خانم عطایی</span>
          </div>
          <button
            onClick={onToggleDelegation}
            className="focus:outline-none cursor-pointer"
            id="delegation_toggle_btn"
          >
            {isDelegatedToOfficeManager ? (
              <ToggleRight className="w-12 h-12 text-teal-400" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATORS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'kpis' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>شاخص‌ها و نمودارها</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'users' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>پرونده‌ها و اطلاعات پرسنل</span>
        </button>
        <button
          onClick={() => setActiveTab('banking')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'banking' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>امور بانکی ({toPersianDigits(bankRecords.filter(b=>b.status==='office_manager_sent').length)})</span>
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'suggestions' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>پیشنهادات و ایده‌ها ({toPersianDigits(suggestions.filter(s=>s.status==='pending').length)})</span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'rules' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>موتور قوانین هوشمند</span>
        </button>
        <button
          onClick={() => setActiveTab('daily_report')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'daily_report' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>گزارش روزانه مدیریت</span>
        </button>
        <button
          onClick={() => setActiveTab('leaves_missions')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'leaves_missions' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>مرخصی و ماموریت ({toPersianDigits(leaveRequests.filter(l => l.status === 'pending').length + missionRequests.filter(m => m.status === 'pending').length)})</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'documents' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>مدیریت اسناد ({toPersianDigits(companyDocuments.filter(d => d.status === 'pending_internal' || d.status === 'pending_admin').length)})</span>
        </button>
        <button
          onClick={() => setActiveTab('prayers')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'prayers' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
          id="admin_prayers_tab"
        >
          <Sparkles className="w-4 h-4" />
          <span>دعای پرسنل ({toPersianDigits(dailyPrayers.length)})</span>
        </button>
        <button
          onClick={() => setActiveTab('data_management')}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-reverse space-x-2 ${
            activeTab === 'data_management' ? 'bg-brand-cyan text-brand-navy shadow-md font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
          id="admin_data_mgmt_tab"
        >
          <Database className="w-4 h-4 text-slate-500 group-hover:text-cyan-500" />
          <span>پشتیبان‌گیری و خروجی خام</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: KPIs & Diagram Graphics */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold block">کل پرسنل فعال ستاد</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {toPersianDigits(activeStaffCount)} <span className="text-xs font-normal">نفر</span>
                </span>
              </div>
              <div className="bg-blue-50 text-brand-cyan p-3 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold block">حاضرین امروز</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {toPersianDigits(presentCount)} <span className="text-xs font-normal text-slate-500">حاضر</span>
                </span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold block">وظایف در حال اجرا</span>
                <span className="text-2xl font-black text-brand-navy mt-1 block">
                  {toPersianDigits(openTasksCount)} <span className="text-xs font-normal text-slate-500 font-sans">ماموریت</span>
                </span>
              </div>
              <div className="bg-sky-50 text-brand-navy p-3 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold block">تاخیر یا معوقات</span>
                <span className="text-2xl font-black text-rose-500 mt-1 block">
                  {toPersianDigits(delayedTasksCount)} <span className="text-xs font-normal text-slate-400">مورد هشدار</span>
                </span>
              </div>
              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recharts Graphical Panels - Full analytical dashboards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-800">تحلیل هفتگی انضباطی و بهره‌وری پرسنل</h3>
                <span className="text-[10px] bg-sky-50 text-brand-cyan font-bold py-1 px-2.5 rounded-full">بروزرسانی زنده</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00b6f0" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00b6f0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <Tooltip contentStyle={{ direction: 'rtl', fontSize: '11px', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="حضور_غیاب" stroke="#22c55e" fillOpacity={1} fill="url(#colorPresence)" />
                    <Area type="monotone" dataKey="امتیاز_عملکرد" stroke="#00b6f0" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-black text-slate-800 mb-4">توزیع گردش تجاری کاویان سپنتا (پورسانت و خرید/فروش)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialStatsData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ direction: 'rtl', fontSize: '11px' }} />
                    <Bar dataKey="مبلغ" radius={[8, 8, 0, 0]}>
                      {financialStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pending Task Delegation Transfers Reviews */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-1.5 text-brand-navy">
              <ArrowRightLeft className="w-5 h-5 text-brand-cyan" />
              <span>کارتابل درخواست‌های جابجایی و ارجاع وظایف پرسنل</span>
            </h3>
            {transferRequests.filter(r=>r.status==='pending').length === 0 ? (
              <div className="text-center p-4 text-xs text-slate-400">هیچ درخواست جابجایی وظیفه در انتظار تایید وجود ندارد.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transferRequests.filter(r=>r.status==='pending').map((req) => (
                  <div key={req.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">درخواست انتقال وظیفه: {req.taskTitle}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        متقاضی انتقال: <span className="font-bold text-rose-600">{req.fromUserName}</span> ← همکار مقصد: <span className="font-bold text-teal-600">{req.toUserName}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">علت: {req.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveTransfer(req.id)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-reverse space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>موافقت و انتقال</span>
                      </button>
                      <button
                        onClick={() => onRejectTransfer(req.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-reverse space-x-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>مخالفت</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Personnel Profile Directories Admin Grid */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-slate-800">راه‌اندازی و مدیریت پرونده پرسنلی پرسنل کارخانه و دفتر</h3>
              <p className="text-[10px] text-slate-400">امکان تعریف نام، واحد، تخصیص دسترسی و پایش حقوق</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-brand-cyan hover:bg-blue-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-reverse space-x-1.5 shadow-md shadow-cyan-500/10"
              id="add_new_user_modal_btn"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد کاربر جدید</span>
            </button>
          </div>

          {/* Directory list grid */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-100">
                  <tr>
                    <th className="p-4">کد / نام کاربر</th>
                    <th className="p-4">واحد سازمانی</th>
                    <th className="p-4">سمت سازمانی</th>
                    <th className="p-4">شماره تماس / استخدام</th>
                    <th className="p-4">حقوق پایه و مزایا</th>
                    <th className="p-4">پورسانت / پاداش</th>
                    <th className="p-4">سنجش امتیاز فعلی</th>
                    <th className="p-4 text-center">عملیات اداری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${!user.isWorking ? 'opacity-50 bg-rose-50/20' : ''}`}>
                      <td className="p-4 flex items-center space-x-reverse space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                          {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image')) ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.avatar
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{user.name}</span>
                          <span className="text-[10px] text-slate-400 block">{user.employeeCode}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-800 font-medium">{user.department}</td>
                      <td className="p-4 font-bold text-slate-700">{user.position}</td>
                      <td className="p-4">
                        <span className="block text-slate-600">{toPersianDigits(user.phone)}</span>
                        <span className="text-[10px] text-slate-400 block">{user.hireDate}</span>
                      </td>
                      <td className="p-4">
                        <span className="block text-slate-800 font-extrabold">{toPersianDigits(formatCurrency(user.financialInfo.baseSalary))}</span>
                        <span className="text-[10px] text-slate-400 block">مزایا: {toPersianDigits(formatCurrency(user.financialInfo.benefits))}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-600 font-bold block">{toPersianDigits(formatCurrency(user.financialInfo.commission))}</span>
                        <span className="text-blue-600 font-bold text-[10px] block">پاداش: {toPersianDigits(formatCurrency(user.financialInfo.bonus))}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-yellow-600 font-black">{toPersianDigits(user.currentScore)}</span>
                        <span className="text-[10px] text-slate-400 block">میانگین: {toPersianDigits(user.avgScore)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onUpdateUser(user.id, { isWorking: !user.isWorking })}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                              user.isWorking 
                                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                            }`}
                            title={user.isWorking ? "غیر فعالسازی" : "فعال سازی مجدد"}
                          >
                            {user.isWorking ? "غیرفعال" : "فعال‌سازی"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserToReset(user);
                              setResetPasswordValue('');
                              setResetPassSuccess(false);
                            }}
                            className="p-1.5 bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 rounded-lg cursor-pointer"
                            title="تغییر رمز عبور کاربر"
                            type="button"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {!user.isAdmin && (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="p-1.5 bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer"
                              title="حذف کامل از شرکت"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Banking Requests */}
      {activeTab === 'banking' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-800">تایید نهایی چک‌ها و فرآیند انتقال مالی بانکی</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">ثبت شده توسط خانم عطایی (مدير دفتر) ← بررسی و پرداخت نهایی با ابلاغیه صادره مدیرعامل</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankRecords.map((bank) => (
              <div key={bank.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow relative">
                <span className={`absolute top-4 left-4 text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  bank.status === 'ceo_approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600 animate-pulse'
                }`}>
                  {bank.status === 'ceo_approved' ? 'تایید و ابلاغ جهت اجرا' : 'در انتظار تایید نهایی مدیرعامل'}
                </span>
                
                <h4 className="text-xs font-extrabold text-slate-900 mt-2 pl-24">{bank.title}</h4>
                <div className="mt-4 flex justify-between items-center border-t border-slate-50 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">مبلغ ابلاغ بانکی</span>
                    <span className="text-base font-black text-brand-cyan">{toPersianDigits(formatCurrency(bank.amount))}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">ثبت‌کننده: {bank.registeredByUserName}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{bank.registrationDate}</span>
                  </div>
                </div>

                {bank.status === 'office_manager_sent' && (
                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => onApproveBank(bank.id)}
                      className="flex-1 bg-brand-cyan hover:bg-blue-600 text-white py-2 rounded-xl text-xs font-black transition-colors flex items-center justify-center space-x-reverse space-x-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>موافقت و تایید نهایی</span>
                    </button>
                    <button
                      onClick={() => onRejectBank(bank.id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-500 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-reverse space-x-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>رد درخواست</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Staff suggestions with CEO rewards setting */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-800">صندوق ایده‌ها، نوآوری و طرح‌های کاهش هزینه پرسنل</h3>
            <p className="text-[10px] text-slate-400">بهترین ایده‌ها واجد دریافت پاداش نقدی و افزایش مستقیم امتیاز عملکرد ماهیانه خواهند بود.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => (
              <div key={sug.id} className="bg-white p-5 rounded-2xl border border-slate-100 relative">
                <span className={`absolute top-4 left-4 text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  sug.status === 'approved' ? 'bg-green-50 text-green-600' : sug.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600 animate-pulse'
                }`}>
                  {sug.status === 'approved' ? 'پذیرفته شده و پاداش دار' : sug.status === 'rejected' ? 'بایگانی' : 'آذرخش بررسی ایده'}
                </span>

                <div className="flex items-center space-x-reverse space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-brand-cyan">
                    {sug.type === 'saving' ? 'کاهش هزینه‌های شرکت' : sug.type === 'idea' ? 'ایده جدید تجاری' : sug.type === 'commercial' ? 'فرصت تجاری' : sug.type === 'other' ? 'غیره' : 'بهبود بهره‌وری'}
                  </span>
                  <span className="text-[10px] text-slate-400">{sug.createdAt}</span>
                </div>

                <h4 className="text-xs font-extrabold text-slate-900 mt-3">{sug.title}</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{sug.content}</p>

                <div className="mt-3 text-xs flex justify-between items-center text-slate-500 border-t border-slate-50 pt-2">
                  <span>پیشنهاد دهنده: <span className="font-bold text-slate-700">{sug.userName}</span></span>
                  {sug.bonusReward > 0 && (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      پاداش تعلق گرفته: {toPersianDigits(formatCurrency(sug.bonusReward))}
                    </span>
                  )}
                </div>

                {sug.reviewComment && (
                  <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs mt-2">
                    <span className="font-bold text-slate-800 block">نظر و پاسخ مدیریت:</span>
                    <p className="text-slate-600 mt-1">{sug.reviewComment}</p>
                  </div>
                )}

                {sug.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 block mb-1">تعیین پاداش نقدی (تومان)</label>
                        <input
                          type="number"
                          value={sugBonus}
                          onChange={(e) => setSugBonus(Number(e.target.value))}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-left"
                        />
                      </div>
                      <div className="flex-[2]">
                        <label className="text-[10px] text-slate-500 block mb-1">توضیحات و بازخورد مدیر</label>
                        <input
                          type="text"
                          placeholder="مثلاً: طرح عالی است، در دستور اقدام قرار گرفت."
                          value={sugComment}
                          onChange={(e) => setSugComment(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onApproveSuggestion(sug.id, sugBonus, sugComment || 'پیشنهاد ارزشمند شما پذیرفته شد.');
                          setSugComment('');
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-2 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        موافقت و پاداش دهی
                      </button>
                      <button
                        onClick={() => {
                          onRejectSuggestion(sug.id, sugComment || 'متاسفانه طرح در مقطع فعلی قابل اجرا نیست.');
                          setSugComment('');
                        }}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs py-2 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        عدم موافقت و ارجاع
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Business Rules Engine builder - "موتور قوانین هوشمند" */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-800">موتور قوانین اتوماسیون سازمانی (Business Rules Engine)</h3>
              <p className="text-[10px] text-slate-400">مثال: در هر خرید یا فروش نقدی، سامانه به صورت خودکار پرونده را به مدیر دفتر ارجاع دهد.</p>
            </div>
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="bg-brand-navy hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-reverse space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-cyan" />
              <span>قانون هوشمند جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessRules.map((rule) => (
              <div key={rule.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-start justify-between gap-4 relative">
                <div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
                    <h4 className="text-xs font-extrabold text-slate-900">{rule.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{rule.descr}</p>
                  
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold">شرط/رویداد:</span>
                      <span className="font-extrabold text-slate-700">{rule.triggerEvent}</span>
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold">اکشن اجرایی:</span>
                      <span className="font-extrabold text-brand-cyan">{rule.actionType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-slate-400 mb-2 font-bold block">وضعیت موتور</span>
                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className="focus:outline-none cursor-pointer"
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-10 h-10 text-brand-cyan" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Daily Manager Executive Report layout - "گزارش روزانه مدیریت" */}
      {activeTab === 'daily_report' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xs font-black text-slate-800">تولید خودکار گزارش روزانه ستاد مرکزی هلدینگ کاویان سپنتا</h3>
              <p className="text-[10px] text-slate-400">شامل خلاصه معاملات، تناژهای انبار، مبالغ خرید و فروش و وضعیت خروجی حضور و غیاب روز</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="bg-slate-50 p-2 border border-slate-200 rounded-xl text-xs w-28 text-center font-bold"
              />
              <button
                onClick={exportReportExcel}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>خروجی Excel</span>
              </button>
              <button
                onClick={() => printDocument('print_daily_report_box')}
                className="bg-brand-cyan hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ و تولید PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Report Content Box */}
          <div id="print_daily_report_box" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm print:p-0">
            <div className="text-center pb-6 border-b border-dashed border-slate-200">
              <h2 className="text-base font-black text-slate-800">گزارش روزانه مدیریت عالی هلدینگ کاویان سپنتا</h2>
              <p className="text-xs text-brand-cyan mt-1">سامانه هوشمند پصداتصدیع ستاد مرکزی - تاریخ گزارش: {reportDate}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              {/* Purchase summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-850 border-b border-slate-200 pb-2 mb-3">آمار خریدهای روزانه انبار کک و مواد خام</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">تناژ کل خرید:</span>
                    <span className="font-extrabold text-slate-800">۴۰ تن</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">مجموع مبالغ خرید نقدی:</span>
                    <span className="font-extrabold text-brand-cyan">{toPersianDigits(formatCurrency(680000000))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-600">
                    <span>ثبت اتوماتیک به مدیر دفتر:</span>
                    <span>تایید شد</span>
                  </div>
                </div>
              </div>

              {/* Sales summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-850 border-b border-slate-200 pb-2 mb-3">آمار فروش‌های روزانه خطوط تولید</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">تناژ کل فروش:</span>
                    <span className="font-extrabold text-slate-800">۱۲۰ تن (میلگرد)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">مبلغ کل معاملات فروش:</span>
                    <span className="font-extrabold text-green-600">{toPersianDigits(formatCurrency(3600000000))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-blue-600">
                    <span>مجموع پورسانت مصوب:</span>
                    <span>۱۸,۰۰۰,۰۰۰ تومان</span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-850 border-b border-slate-200 pb-2 mb-3">مخارج و هزینه‌های جاری اداری</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">هزینه‌های تنخواه‌گردان:</span>
                    <span className="font-extrabold text-slate-800">{toPersianDigits(formatCurrency(8200000))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">تسویه تسجیلات همکاران:</span>
                    <span className="font-extrabold text-slate-800">{toPersianDigits(formatCurrency(34500000))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>مجموع هزینه‌های نهایی:</span>
                    <span>۴۲,۷۰۰,۰۰۰ تومان</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Employee daily outcoming panel */}
            <div className="mt-6">
              <h4 className="text-xs font-black text-slate-800 mb-3 block">شرح عملکرد روزانه و حضور و غیاب کارکنان</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-slate-55 p-3 font-bold border-b border-slate-100">
                  <span>نام کارمند</span>
                  <span>ساعت حضور</span>
                  <span>وضعیت انضباطی</span>
                  <span className="text-left">تعداد وظایف خاتمه یافته</span>
                </div>
                <div className="divide-y divide-slate-100 bg-slate-50/20">
                  <div className="grid grid-cols-4 p-3 text-slate-700">
                    <span>خانم عطایی</span>
                    <span>۰۸:۰۵ ورود / ۱۷:۰۲ خروجی</span>
                    <span className="text-green-650">ایده‌آل (بدون کسر امتیاز)</span>
                    <span className="text-left font-bold">۱ وظیفه</span>
                  </div>
                  <div className="grid grid-cols-4 p-3 text-slate-700">
                    <span>خانم زرگر</span>
                    <span>۰۸:۴۵ ورود (تاخیر) / ۱۷:۰۰</span>
                    <span className="text-rose-650">۴۵ دقیقه تأخیر ورود (-۱ امتیاز)</span>
                    <span className="text-left font-bold">۱ وظیفه (تکمیل شده)</span>
                  </div>
                  <div className="grid grid-cols-4 p-3 text-slate-700">
                    <span>آقای موسوی</span>
                    <span>۰۹:۱۵ ورود (تاخیر) / ۱۶:۳۰ خروجی</span>
                    <span className="text-rose-650">نیاز به تذکر انضباطی (-۲ امتیاز)</span>
                    <span className="text-left font-bold">۰ وظیفه (در حال اجرا)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">تولید کننده گزارش</span>
                <span className="text-xs text-brand-navy font-bold">اتوماسیون هوشمند مرکز کاویان سپنتا</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold">تاییدیه نهایی دفتر</span>
                <span className="text-xs text-emerald-600 font-bold border-2 border-emerald-600 py-1 px-3 rounded">تایید الکترونیک شد</span>
              </div>
            </div>
          </div>

          {/* Sub-panel inside Daily Report: Team Submitted Performance Reports */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-6">
            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
              <span>گزارش‌های روزانه تفصیلی ارسال شده توسط کارکنان امروز</span>
              <span className="text-[10px] text-brand-cyan bg-brand-light px-2.5 py-1 rounded font-bold">زنده و برخط</span>
            </h3>

            {dailyReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">تاکنون هیچ گزارش عملکرد روزانه‌ای توسط پرسنل مکتوب و ثبت نشده است.</div>
            ) : (
              <div className="space-y-4">
                {dailyReports.map((rep) => (
                  <div key={rep.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative text-right">
                    <span className="absolute top-4 left-4 text-[10px] text-brand-navy bg-brand-cyan/20 px-2 py-0.5 rounded font-black">{rep.date}</span>
                    <div className="flex items-center space-x-reverse space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center">
                        {rep.userName.charAt(0)}
                      </div>
                      <span className="text-xs font-black text-slate-800">{rep.userName}</span>
                      <span className="text-[9px] text-slate-400">(شناسه: {rep.userId})</span>
                    </div>
                    <p className="text-xs text-slate-655 leading-relaxed pr-8 whitespace-pre-wrap">{rep.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Leaves and Missions - "مرخصی و ماموریت" */}
      {activeTab === 'leaves_missions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Right side: Leave / Mission Approval List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6 text-right">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4">
                کارتابل درخواست‌های مرخصی و ماموریت کارکنان
              </h3>

              <div className="space-y-6">
                {/* Leaves Section */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">درخواست‌های مرخصی جاری:</span>
                  {leaveRequests.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-center text-slate-400 text-xs rounded-xl">درخواستی یافت نشد.</div>
                  ) : (
                    <div className="space-y-2.5">
                      {leaveRequests.map((req) => (
                        <div key={req.id} className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-reverse space-x-2">
                              <span className="font-extrabold text-xs text-slate-850">{req.userName}</span>
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 py-0.5 px-2 rounded-lg">
                                مرخصی {req.type === 'daily' ? 'روزانه' : 'ساعتی'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">علت: {req.reason}</p>
                            <span className="text-[9px] text-slate-400 block font-mono">ثبت شده در: {req.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => onApproveLeave(req.id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all border border-emerald-100"
                                >
                                  تایید و اعمال حقوق
                                </button>
                                <button
                                  onClick={() => onRejectLeave(req.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all border border-rose-100"
                                >
                                  رد درخواست
                                </button>
                              </>
                            ) : (
                              <span className={`px-2.5 py-1 rounded text-[10px] font-black ${
                                req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'
                              }`}>
                                {req.status === 'approved' ? 'مصوب اداری' : 'مردود شده'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missions Section */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">درخواست‌های ماموریت جاری:</span>
                  {missionRequests.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-center text-slate-400 text-xs rounded-xl">درخواستی یافت نشد.</div>
                  ) : (
                    <div className="space-y-2.5">
                      {missionRequests.map((req) => (
                        <div key={req.id} className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-reverse space-x-2">
                              <span className="font-extrabold text-xs text-slate-850">{req.userName}</span>
                              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 py-0.5 px-2 rounded-lg">
                                ماموریت {req.type === 'daily' ? 'روزانه' : 'ساعتی'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">علت و مقصد: {req.reason}</p>
                            <span className="text-[9px] text-slate-400 block font-mono">ثبت شده در: {req.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => onApproveMission(req.id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all border border-emerald-100"
                                >
                                  تایید و فوق‌العاده
                                </button>
                                <button
                                  onClick={() => onRejectMission(req.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all border border-rose-100"
                                >
                                  رد درخواست
                                </button>
                              </>
                            ) : (
                              <span className={`px-2.5 py-1 rounded text-[10px] font-black ${
                                req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'
                              }`}>
                                {req.status === 'approved' ? 'مصوب اداری' : 'مردود شده'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Left side: Declare Emergency Company Holiday */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit space-y-6 text-right">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-brand-cyan animate-pulse" />
                <span>تعریف تعطیلی اضطراری در ستاد</span>
              </h3>
              
              <div className="mt-4 space-y-4">
                <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-[10px] leading-relaxed">
                  ⚠️ <strong>توجه ویژه:</strong> طبق ضوابط، خانم عطایی (مدیر داخلی) یا موسوی-وظیفه می‌توانند در شرایط خاص (آلودگی هوا، قطع برق یا گرما) کل شرکت را در یک تاریخ تعطیل اعلام کنند.
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">مناسبت یا علت تعطیلی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تعطیلی سراسری آلودگی شدید هوا، قطع برق ناحیه صنعتی..."
                    value={holidayTitle}
                    onChange={(e) => setHolidayTitle(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">تاریخ خورشیدی تعطیلی</label>
                  <input
                    type="text"
                    required
                    placeholder="۱۴۰۵/۰۴/۰۳"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!holidayTitle) return;
                onAddEmergencyHoliday({
                  id: 'hol_' + Math.random().toString(36).substring(2, 9),
                  date: holidayDate,
                  title: holidayTitle,
                  declaredBy: currentUser.name,
                  createdAt: '۱۴۰۵/۰۴/۰۳'
                });
                setHolidayTitle('');
                setHolidayDate('۱۴۰۵/۰۴/۰۳');
              }}
              className="mt-4 bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
            >
              ابلاغ و ثبت رسمی تعطیلی ستاد
            </button>

            <div className="border-t border-slate-100 pt-4">
              <span className="text-[10px] font-bold text-slate-700 block mb-2">تقویم تعطیلات اضطراری تصویب شده:</span>
              {emergencyHolidays.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic">هیچ تعطیلی اضطراری ثبت نشده است.</span>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {emergencyHolidays.map((hol) => (
                    <div key={hol.id} className="bg-rose-50 text-rose-800 p-2 rounded-lg border border-rose-100 flex justify-between items-center text-[10px]">
                      <span className="font-bold">{hol.title}</span>
                      <span className="font-mono">{hol.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB: Documents and Loan Escrow - "مدیریت اسناد و امانات" */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Main List: Company Documents view and approval */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-right">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
                <span>کارتابل ممیزی دو مرحله‌ای و بایگانی اسناد هلدینگ (مشاهده اسناد و امانات)</span>
                <span className="text-[10px] text-slate-400">تایید فاز ۱: خانم عطایی | تایید فاز ۲: موسوی-وظیفه</span>
              </h3>

              {companyDocuments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">هیچ سندی در سامانه یافت نشد.</div>
              ) : (
                <div className="overflow-x-auto text-xs text-right">
                  <table className="w-full">
                    <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="p-2.5">عنوان / دسته‌بندی / ثبت‌کننده</th>
                        <th className="p-2.5">شناسه مجازی فایل</th>
                        <th className="p-2.5">وضعیت و ممیزی اداری</th>
                        <th className="p-2.5">وضعیت امانت (امانت‌دهی)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companyDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/40">
                          <td className="p-2.5 font-bold text-slate-800">
                            <span>{doc.title}</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">ثبت شده توسط: {doc.uploadedByUserName}</span>
                            <span className="block text-[8px] text-slate-500 mt-0.5">{doc.description}</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-500 text-[10px]">{doc.fileName}</td>
                          <td className="p-2.5 space-y-2">
                            {/* Actions or Status Badge */}
                            {doc.status === 'pending_internal' && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black w-fit">گام ۱: تایید مدیر داخلی</span>
                                {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => onApproveDocument(doc.id, 'internal')}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                                    >
                                      موافقت مرحله ۱
                                    </button>
                                    <button
                                      onClick={() => onRejectDocument(doc.id)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                                    >
                                      رد سند
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {doc.status === 'pending_admin' && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black w-fit">گام ۲: تایید موسوی-وظیفه</span>
                                {currentUser.isAdmin && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => onApproveDocument(doc.id, 'admin')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                                    >
                                      تایید نهایی و امضا
                                    </button>
                                    <button
                                      onClick={() => onRejectDocument(doc.id)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-2 py-1 rounded text-[9px] font-bold cursor-pointer"
                                    >
                                      رد سند
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {doc.status === 'approved' && (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-black block text-center w-fit border border-emerald-100">
                                تایید نهایی شده
                              </span>
                            )}

                            {doc.status === 'rejected' && (
                              <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded font-black block text-center w-fit border border-rose-100">
                                مردود شده
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {doc.isEscrow ? (
                              doc.escrowStatus === 'pending_approval' ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded block text-center">
                                    در انتظار تایید امانت (مدیر داخلی)
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">متقاضی امانت: {doc.escrowBorrower}</span>
                                  {doc.escrowImportance && <span className="text-[9px] text-indigo-600 block">اهمیت: {doc.escrowImportance}</span>}
                                  <span className="text-[9px] text-slate-400 block">موعد عودت پیشنهادی: {doc.escrowReturnDate}</span>
                                  {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                    <div className="flex gap-1 mt-1.5">
                                      <button
                                        onClick={() => onApproveEscrow && onApproveEscrow(doc.id)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-bold py-1 rounded transition-colors cursor-pointer"
                                      >
                                        تایید امانت
                                      </button>
                                      <button
                                        onClick={() => onRejectEscrow && onRejectEscrow(doc.id)}
                                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[8px] font-bold py-1 rounded transition-colors cursor-pointer"
                                      >
                                        عدم تایید
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : doc.escrowStatus === 'pending_return' ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded block text-center">
                                    اعلام عودت توسط پرسنل (منتظر تایید نهایی)
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">امانت‌گیرنده: {doc.escrowBorrower}</span>
                                  {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                    <button
                                      onClick={() => onEscrowReturn(doc.id)}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-bold py-1.5 rounded mt-1.5 transition-colors cursor-pointer"
                                    >
                                      تایید بازگشت و خاتمه امانت
                                    </button>
                                  )}
                                </div>
                              ) : doc.escrowStatus === 'returned' ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded block text-center">
                                    عودت داده شده به بایگانی
                                  </span>
                                  <span className="text-[9px] text-slate-400 block">تاریخ بازگشت: {doc.escrowActualReturnDate}</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded block text-center">
                                    امانت رفته (تایید شده)
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">امانت‌گیرنده: {doc.escrowBorrower}</span>
                                  {doc.escrowImportance && <span className="text-[9px] text-indigo-600 block">اهمیت: {doc.escrowImportance}</span>}
                                  <span className="text-[9px] text-slate-400 block">موعد عودت: {doc.escrowReturnDate}</span>
                                  {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                    <button
                                      onClick={() => onEscrowReturn(doc.id)}
                                      className="w-full bg-slate-150 hover:bg-slate-200 text-slate-700 text-[8px] font-bold py-1 rounded mt-1.5 transition-colors cursor-pointer"
                                    >
                                      تایید و ثبت بازگشت امانت
                                    </button>
                                  )}
                                </div>
                              )
                            ) : doc.status === 'approved' ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold block text-center text-[10px]">
                                آماده امانت‌دهی در پنل پرسنل
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">غیرقابل امانت</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Prayers Management (پوشه دعای پرسنل) */}
      {activeTab === 'prayers' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">پوشه دعای پرسنل هلدینگ</h3>
                  <p className="text-xs text-slate-400 mt-0.5">مشاهده نیایش‌های روزانه همکاران و ارسال پاسخ مستقیم مدیر سیستم به کارتابل پرسنل</p>
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-[240px]">
                <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">انتخاب نام پرسنل:</label>
                <select
                  value={selectedPrayerUserId}
                  onChange={(e) => setSelectedPrayerUserId(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-1 focus:ring-purple-500 focus:outline-none text-slate-800"
                >
                  <option value="all">همه پرسنل (نمایش کل دعاها)</option>
                  {Array.from(new Set(dailyPrayers.map(p => p.userName))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            {dailyPrayers.filter(p => selectedPrayerUserId === 'all' || p.userName === selectedPrayerUserId).length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                هیچ دعایی برای نمایش یا پاسخ‌دهی یافت نشد.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyPrayers
                  .filter(p => selectedPrayerUserId === 'all' || p.userName === selectedPrayerUserId)
                  .map(prayer => (
                    <div key={prayer.id} className="bg-gradient-to-br from-purple-50 via-purple-50/30 to-white rounded-2xl p-5 border border-purple-200/60 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                              {prayer.userName.slice(0, 2)}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800">{prayer.userName}</h4>
                              <span className="text-[10px] text-slate-400">{prayer.createdAt}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full">
                            نیایش روزانه
                          </span>
                        </div>

                        <div className="mt-3 bg-white p-3.5 rounded-xl border border-purple-100/80 text-slate-700 text-xs leading-relaxed">
                          « {prayer.text} »
                        </div>
                      </div>

                      {/* Reply section */}
                      <div className="space-y-2.5 pt-2 border-t border-purple-100">
                        {prayer.adminReply && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                            <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-800 mb-1">
                              <span>پاسخ مدیر به دعا:</span>
                              <span>{prayer.repliedAt || 'ثبت شده'}</span>
                            </div>
                            <p className="text-emerald-900 leading-relaxed font-medium">{prayer.adminReply}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="پاسخ مدیر سیستم به این دعا (ارسال به کارتابل پرسنل)..."
                            value={prayerReplyInputs[prayer.id] || ''}
                            onChange={(e) => setPrayerReplyInputs({ ...prayerReplyInputs, [prayer.id]: e.target.value })}
                            className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                          />
                          <button
                            onClick={() => {
                              const reply = prayerReplyInputs[prayer.id];
                              if (!reply?.trim() || !onReplyPrayer) return;
                              onReplyPrayer(prayer.id, reply.trim(), prayer.userId);
                              setPrayerReplyInputs({ ...prayerReplyInputs, [prayer.id]: '' });
                            }}
                            disabled={!prayerReplyInputs[prayer.id]?.trim()}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
                              !prayerReplyInputs[prayer.id]?.trim()
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>ارسال پاسخ مدیر</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: Data Management & Template exporter */}
      {activeTab === 'data_management' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: Backup and Import - "نگه داشتن این نمونه و خروجی خام" */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 text-right">
              <div className="flex items-center space-x-reverse space-x-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 bg-brand-cyan/10 text-brand-navy rounded-2xl">
                  <Database className="w-5 h-5 text-brand-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">نسخه‌برداری و پشتیبان‌گیری کامل</h3>
                  <p className="text-[10px] text-slate-400">انتقال فوری پایگاه داده برای پرزنت در شرکت‌های دیگر یا ذخیره داده‌های فعلی</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                  <span className="text-xs font-black text-slate-800 block">۱. خروجی کامل سناریوی دمو جاری (شخصی‌سازی شده)</span>
                  <p className="text-[10px] leading-relaxed text-slate-400">پیکربندی جاری شامل تمام پرونده‌های همکاران، امتیازات انضباطی، وظایف، پورسانت‌ها و تراکنش‌ها را در یک فایل فشرده الکترونیکی دانلود کنید.</p>
                  <button
                    onClick={() => {
                      const backup = {
                        users: localStorage.getItem('ks_users'),
                        current_user: localStorage.getItem('ks_current_user'),
                        tasks: localStorage.getItem('ks_tasks'),
                        workflows: localStorage.getItem('ks_workflows'),
                        bank: localStorage.getItem('ks_bank'),
                        commercials: localStorage.getItem('ks_commercials'),
                        suggestions: localStorage.getItem('ks_suggestions'),
                        rules: localStorage.getItem('ks_rules'),
                        transfers: localStorage.getItem('ks_transfers'),
                        evaluations: localStorage.getItem('ks_evaluations'),
                        attendance: localStorage.getItem('ks_attendance'),
                        alerts: localStorage.getItem('ks_alerts'),
                        delegated: localStorage.getItem('ks_delegated'),
                      };
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `kavian_sepanta_backup.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="w-full mt-2 bg-brand-navy hover:bg-slate-800 text-white font-black text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-brand-navy/10"
                    type="button"
                  >
                    <Download className="w-4 h-4 text-brand-cyan" />
                    <span>دانلود نسخه پشتیبان کامل (JSON)</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                  <span className="text-xs font-black text-slate-800 block">۲. بازگردانی داده‌ها از فایل پشتیبان</span>
                  <p className="text-[10px] leading-relaxed text-slate-400">فایل پشتیبان دانلود شده قبلی را انتخاب کنید تا پنل ستاد فوراً به همان لحظه بازنشانی و اجرا شود.</p>
                  
                  <div className="relative mt-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const backup = JSON.parse(event.target?.result as string);
                            if (onImportFullBackup) {
                              onImportFullBackup(backup);
                              setActiveTab('kpis');
                            } else {
                              alert('خواننده فایل بازیابی هم‌اکنون در دسترس نیست.');
                            }
                          } catch (err) {
                            alert('فرمت فایل نامعتبر است یا مشکلی در خواندن فایل بوجود آمد.');
                          }
                        };
                        reader.readAsText(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-200 hover:border-brand-cyan bg-white p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <span className="text-xs font-bold text-slate-650">انتخاب فایل پشتیبان ستاد و بارگذاری</span>
                      <span className="text-[9px] text-slate-400">فرمت مجاز: .json (تولید شده توسط همین بخش)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: System Factory reset - "نسخه کاملاً خام برای شرکت جدید" */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 text-right">
              <div className="flex items-center space-x-reverse space-x-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">راه‌اندازی خام (بهره‌برداری جدید)</h3>
                  <p className="text-[10px] text-slate-400">آماده‌سازی پلتفرم جهت پیاده‌سازی و استقرار در شرکت جدید بدون داده‌های دمو</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2">
                  <span className="text-xs font-black text-rose-700 block">راه‌اندازی کاملاً خام و اولیه (تنظیم کارخانه)</span>
                  <p className="text-[10px] leading-relaxed text-slate-500 font-bold">تمام همکاران، کارنامه‌ها، وظایف، پورسانت‌ها، فاکتورها، انبار و مرخصی‌ها کاملاً پاک شده و پلتفرم به صورت یک لایسنس کاملاً نو فقط با مدیرعامل (موسوی-وظیفه) و رمز عبور پیش‌فرض <span className="font-mono text-cyan-600 text-xs text-brand-navy">1234</span> بالا می‌آید تا برای هر شرکت دلخواه دیگری گام‌به‌گام اضافه گشته و بالا برده شود.</p>
                  
                  <button
                    onClick={() => {
                      if (confirm('آیا مطمئن هستید که می‌خواهید کل سیستم را صفر کنید؟ دیتای دمو کاملاً پاک خواهد شد.')) {
                        if (onWipeAndResetRaw) {
                          onWipeAndResetRaw('only_ceo');
                          setActiveTab('kpis');
                        }
                      }
                    }}
                    className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-rose-200"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>پاکسازی کامل و تحویل نسخه خام (از صفر)</span>
                  </button>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
                  <span className="text-xs font-black text-amber-800 block">پاکسازی تراکنش‌ها (فقط دیتای انظباطی و کارنامه‌ها)</span>
                  <p className="text-[10px] leading-relaxed text-slate-500">اطلاعات، شماره موبایل و فیش حقوقی پرسنل دمو حفظ می‌شوند، اما وظایف، صندوق ایده‌ها، گواهی کسر حقوق، تسویه‌حساب‌ها و گزارش‌های تردد صفر غیابی می‌گردند.</p>
                  
                  <button
                    onClick={() => {
                      if (confirm('آیا مایلید تمام تراکنش‌ها و تاریخچه‌ها پاک شده و فقط ساختار کارکنان حفظ شود؟')) {
                        if (onWipeAndResetRaw) {
                          onWipeAndResetRaw('keep_personnel_clean');
                          setActiveTab('kpis');
                        }
                      }
                    }}
                    className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    type="button"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>تخلیه تاریخچه تراکنش‌ها و پرونده‌ها</span>
                  </button>
                </div>

                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-2">
                  <span className="text-xs font-black text-teal-850 block">بازنشانی فوری سناریوی دمو کاویان سپنتا</span>
                  <p className="text-[10px] leading-relaxed text-slate-500">پلتفرم را مجدداً با حجم کامل دیتای دمو (تراکنش‌های نمونه، نمودارها، اسناد پورسانت صادراتی و آمار غیبت‌‌ها) شارژ کنید تا بتوانید مجدداً آن را پرزنت کنید.</p>
                  
                  <button
                    onClick={() => {
                      if (onRestoreDemoScenario) {
                        onRestoreDemoScenario();
                        setActiveTab('kpis');
                      }
                    }}
                    className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center"
                    type="button"
                  >
                    <Check className="w-4 h-4" />
                    <span>تزریق ثانویه دیتای نمونه دمو (ویژه پرزنت مجدد)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Define new User Dialog */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100">ایجاد پرونده الکترونیکی پرسنل جدید</h3>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">نام و خانوادگی پرسنل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلا: آقای احمدی"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">سمت سازمانی</label>
                  <input
                    type="text"
                    required
                    placeholder="مثلا: کارشناس تدارکات"
                    value={newUserPosition}
                    onChange={(e) => setNewUserPosition(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">عکس / آواتار پرسنل (اختیاری)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="لینک عکس یا انتخاب فایل..."
                    value={newUserAvatar}
                    onChange={(e) => setNewUserAvatar(e.target.value)}
                    className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-left focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-2.5 rounded-xl cursor-pointer flex-shrink-0">
                    انتخاب فایل
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewUserAvatar(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">شماره تلفن همراه</label>
                  <input
                    type="tel"
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-left focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">واحد سازمانی</label>
                  <input
                    type="text"
                    placeholder="تدارکات، کارخانه، عمومی"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">حقوق پایه ماهیانه (تومان)</label>
                  <input
                    type="number"
                    value={newUserSalary}
                    onChange={(e) => setNewUserSalary(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-left focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">مزایای جانبی ثابت (تومان)</label>
                  <input
                    type="number"
                    value={newUserBenefits}
                    onChange={(e) => setNewUserBenefits(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-left focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-cyan hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  ذخیره پرونده و تولید کد پرسنلی
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Define new Business Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setShowAddRuleModal(false)}
              className="absolute top-4 left-4 bg-slate-100 p-2 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100">تعریف قانون جدید موتور انبار/خرید</h3>
            <form onSubmit={handleCreateRule} className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">عنوان قانون</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تخصیص انحصاری نقدی به خانم عطایی"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">شرط فعال‌کننده (Trigger Event)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پرداخت نقد خرید ملزومات بالای ۱۰۰،۰۰۰ تومان"
                  value={ruleTrigger}
                  onChange={(e) => setRuleTrigger(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">عملکرد خودکار (Action)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: انتقال اتوماتیک پرونده به کارتابل مدیر دفتر"
                  value={ruleAction}
                  onChange={(e) => setRuleAction(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">توضیحات تکمیلی</label>
                <textarea
                  placeholder="شرح مختصری از ضرورت این قاعده تجاری در انباشت دارایی..."
                  value={ruleDescr}
                  onChange={(e) => setRuleDescr(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-16"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-cyan text-white text-xs py-2.5 rounded-xl font-black transition-all cursor-pointer"
                >
                  ذخیره و فعال‌سازی در موتور قوانین
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset User Password by System Admin */}
      {selectedUserToReset && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-slate-800 text-right font-sans">
            <button
              onClick={() => setSelectedUserToReset(null)}
              className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-brand-cyan" />
              <span>تغییر رمز پرونده‌های پرسنلی</span>
            </h3>
            
            <div className="mt-4 p-3.5 bg-slate-55 bg-slate-50 rounded-2xl border border-slate-150 flex items-center space-x-reverse space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan text-brand-navy font-black flex items-center justify-center text-sm overflow-hidden">
                {selectedUserToReset.avatar && (selectedUserToReset.avatar.startsWith('http') || selectedUserToReset.avatar.startsWith('data:image')) ? (
                  <img src={selectedUserToReset.avatar} alt={selectedUserToReset.name} className="w-full h-full object-cover" />
                ) : (
                  selectedUserToReset.avatar
                )}
              </div>
              <div className="mr-3 text-right">
                <span className="font-extrabold text-slate-900 text-xs block">{selectedUserToReset.name}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{selectedUserToReset.position} (کد: {selectedUserToReset.employeeCode})</span>
              </div>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!resetPasswordValue || resetPasswordValue.length < 3) return;
                onUpdateUser(selectedUserToReset.id, { password: resetPasswordValue });
                setResetPassSuccess(true);
                setTimeout(() => {
                  setSelectedUserToReset(null);
                  setResetPassSuccess(false);
                }, 1500);
              }} 
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 pr-1">رمز عبور دلخواه جدید</label>
                <input
                  type="text"
                  required
                  placeholder="رمز عبور جدید را بنویسید..."
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-800 text-center"
                  autoFocus
                />
                <span className="text-[9px] text-slate-400 mt-1 block pr-1">مدیر سیستم می‌تواند هر رمز دلخواهی برای کاربر وضع و ابلاغ کند.</span>
              </div>

              {resetPassSuccess && (
                <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                  رمز عبور با موفقیت به مقدار جدید تغییر یافت!
                </div>
              )}

              <div className="pt-2 flex gap-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={resetPasswordValue.length < 3}
                  className={`flex-1 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center ${
                    resetPasswordValue.length >= 3 
                      ? 'bg-brand-cyan hover:bg-blue-600 text-white shadow-md shadow-brand-cyan/25 font-black'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  ذخیره رمز عبور دلخواه
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserToReset(null)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
