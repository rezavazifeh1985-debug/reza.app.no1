/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { User, AttendanceRecord, CommercialRecord, Suggestion, Message, LeaveRequest, MissionRequest, CompanyDocument, DailyPerformanceReport, DailyPrayer, AttendanceCorrectionRequest, Task } from '../types';
import { formatCurrency, toPersianDigits, getPersianTodayString } from '../utils';
import { 
  Clock, LogIn, LogOut, Sun, Calendar, FileText, Send, Share2, Award, Landmark, AlertCircle, Sparkles, MessageSquare, Briefcase, Lock, Upload, Trash2, MapPin, CheckCircle, CheckCircle2, ShieldAlert, Clipboard, ArrowRightLeft, HeartHandshake, Search, X, Users
} from 'lucide-react';
import { motion } from 'motion/react';

interface PersonnelDashboardProps {
  currentUser: User;
  onPunchIn: (lat?: number, lng?: number, manualDesc?: string, customTime?: string, locationName?: string, isLocationDiscrepancy?: boolean) => void;
  onPunchOut: (customTime?: string) => void;
  onRequestLeave: (type: 'daily' | 'hourly', reason: string) => void;
  onAddCommercial: (type: 'purchase' | 'sale' | 'customer_intro' | 'participation', title: string, details: string, tonnage: number, value: number) => void;
  onAddSuggestion: (type: 'idea' | 'process_improvement' | 'saving' | 'commercial' | 'other', title: string, content: string) => void;
  onSendMessage: (content: string, isConfidential: boolean) => void;
  attendanceRecords: AttendanceRecord[];
  allCommercials: CommercialRecord[];
  allSuggestions: Suggestion[];
  allMessages: Message[];
  onUpdateUser?: (userId: string, updated: Partial<User>) => void;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (req: LeaveRequest) => void;
  missionRequests: MissionRequest[];
  onAddMissionRequest: (req: MissionRequest) => void;
  companyDocuments: CompanyDocument[];
  onAddCompanyDocument: (doc: CompanyDocument) => void;
  dailyReports: DailyPerformanceReport[];
  onAddDailyReport: (rep: DailyPerformanceReport) => void;
  onEscrowLend?: (id: string, borrower: string, returnDate: string, status?: 'pending_approval' | 'borrowed', importance?: string) => void;
  onEscrowReturn?: (id: string) => void;
  onEscrowReturnRequest?: (id: string) => void;
  dailyPrayers?: DailyPrayer[];
  onAddPrayer?: (text: string) => void;
  allUsers?: User[];
  attendanceCorrections: AttendanceCorrectionRequest[];
  onAddAttendanceCorrection: (req: AttendanceCorrectionRequest) => void;
  allTasks?: Task[];
  onCancelLeaveRequest?: (id: string) => void;
  onCancelMissionRequest?: (id: string) => void;
  onUpdateMissionRequest?: (req: MissionRequest) => void;
}

export default function PersonnelDashboard({
  currentUser,
  onPunchIn,
  onPunchOut,
  onRequestLeave,
  onAddCommercial,
  onAddSuggestion,
  onSendMessage,
  attendanceRecords,
  allCommercials,
  allSuggestions,
  allMessages,
  onUpdateUser,
  leaveRequests,
  onAddLeaveRequest,
  onCancelLeaveRequest,
  missionRequests,
  onAddMissionRequest,
  onCancelMissionRequest,
  onUpdateMissionRequest,
  companyDocuments,
  onAddCompanyDocument,
  dailyReports,
  onAddDailyReport,
  onEscrowLend,
  onEscrowReturn,
  onEscrowReturnRequest,
  dailyPrayers = [],
  onAddPrayer,
  allUsers = [],
  attendanceCorrections = [],
  onAddAttendanceCorrection,
  allTasks = [],
}: PersonnelDashboardProps) {

  // Nested active navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'finance' | 'deals' | 'suggestions' | 'pms' | 'documents' | 'reports'>('home');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Location Punch States
  const [punchLocationName, setPunchLocationName] = useState('دفتر مرکزی هلدینگ (خیابان شریعتی)');
  const [punchGpsDiscrepancy, setPunchGpsDiscrepancy] = useState(false);
  const [punchManualLocation, setPunchManualLocation] = useState('');

  // GPS/Geofencing processing states
  const [gpsProcessing, setGpsProcessing] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  const handleLocalPunchIn = () => {
    if (punchGpsDiscrepancy) {
      if (!punchManualLocation.trim()) {
        setGpsNotification({
          type: 'error',
          text: 'لطفاً آدرس دستی محل استقرار خود را وارد کنید.'
        });
        return;
      }
      onPunchIn(undefined, undefined, punchManualLocation, undefined, punchLocationName, true);
      setGpsNotification({
        type: 'success',
        text: 'ثبت ورود با موقعیت دستی با موفقیت انجام شد و برای تایید به کارتابل مدیر داخلی ارسال گردید.'
      });
      return;
    }

    setGpsProcessing(true);
    setGpsNotification({
      type: 'warning',
      text: 'در حال استعلام دقیق جی‌پی‌اس مرورگر و تطبیق فاصله با محدوده مجاز شرکت...'
    });

    if (!navigator.geolocation) {
      setGpsProcessing(false);
      setGpsNotification({
        type: 'error',
        text: 'مرورگر شما از قابلیت مکان‌یابی پشتیبانی نمی‌کند. لطفا تیک اختلال جی‌پی‌اس را زده و دستی آدرس وارد کنید.'
      });
      setPunchGpsDiscrepancy(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        let targetLat = 35.75;
        let targetLng = 51.43;

        if (punchLocationName === "دفتر مرکزی هلدینگ (خیابان شریعتی)") {
          targetLat = 35.75; targetLng = 51.43;
        } else if (punchLocationName === "کارخانه تولیدی (شهرک صنعتی)") {
          targetLat = 35.61; targetLng = 50.85;
        } else if (punchLocationName === "دفتر بازرگانی و فروش") {
          targetLat = 35.72; targetLng = 51.41;
        } else if (punchLocationName === "انبار مرکزی") {
          targetLat = 35.65; targetLng = 51.35;
        }

        const distance = getDistance(latitude, longitude, targetLat, targetLng);
        setGpsProcessing(false);

        if (distance <= 200) {
          onPunchIn(latitude, longitude, undefined, undefined, punchLocationName, false);
          setGpsNotification({
            type: 'success',
            text: `مکان‌یابی با موفقیت در محدوده مجاز منطبق شد (فاصله تا مرکز: ${Math.round(distance)} متر).`
          });
        } else {
          const desc = `خارج از محدوده مجاز شرکت - فاصله: ${Math.round(distance)} متر`;
          onPunchIn(latitude, longitude, desc, undefined, punchLocationName, true);
          setGpsNotification({
            type: 'warning',
            text: `شما خارج از محدوده مجاز هستید (فاصله: ${Math.round(distance)} متر). ورود به عنوان دورکاری موقت تایید نشده ثبت شد.`
          });
        }
      },
      (error) => {
        setGpsProcessing(false);
        setGpsNotification({
          type: 'error',
          text: 'خطا در دریافت جی‌پی‌اس! لطفا تیک اختلال جی‌پی‌اس را بزنید و آدرس حضور را دستی وارد نمایید.'
        });
        setPunchGpsDiscrepancy(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Hourly leave start/end
  const [leaveStartTime, setLeaveStartTime] = useState('۰۹:۰۰');
  const [leaveEndTime, setLeaveEndTime] = useState('۱۱:۰۰');

  // Hourly mission start/end
  const [missionStartTime, setMissionStartTime] = useState('۱۰:۰۰');
  const [missionEndTime, setMissionEndTime] = useState('۱۴:۰۰');

  // Month selection for payslips
  const [selectedPayslipMonth, setSelectedPayslipMonth] = useState('تیر ۱۴۰۵');

  // Escrow lending states
  const [selectedDocIdForEscrow, setSelectedDocIdForEscrow] = useState('');
  const [escrowBorrowerInput, setEscrowBorrowerInput] = useState(currentUser.name);
  const [escrowImportanceInput, setEscrowImportanceInput] = useState('عادی');
  const [escrowReturnDateInput, setEscrowReturnDateInput] = useState('۱۴۰۵/۰۴/۱۰');
  const [prayerText, setPrayerText] = useState('');
  const [selectedPrayerUser, setSelectedPrayerUser] = useState<string>('all');

  // Interactive Form Inputs
  const [leaveType, setLeaveType] = useState<'daily' | 'hourly'>('daily');
  const [leaveCategory, setLeaveCategory] = useState<'earned' | 'sick' | 'unpaid'>('earned');
  const [leaveEndDate, setLeaveEndDate] = useState('۱۴۰۵/۰۴/۰۴');
  const [leaveSubstituteId, setLeaveSubstituteId] = useState('');
  const [leaveAttachmentName, setLeaveAttachmentName] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [showLeaveSuccess, setShowLeaveSuccess] = useState(false);

  // Mission Advanced inputs
  const [missionSubType, setMissionSubType] = useState<'intra_city' | 'inter_city' | 'abroad'>('intra_city');
  const [missionEndDate, setMissionEndDate] = useState('۱۴۰۵/۰۴/۰۴');
  const [missionDestinationCompany, setMissionDestinationCompany] = useState('');
  const [missionApproximateGps, setMissionApproximateGps] = useState('');
  const [missionBudget, setMissionBudget] = useState(0);
  const [missionVehicleType, setMissionVehicleType] = useState<'personal' | 'company' | 'public'>('personal');
  const [postMissionReportText, setPostMissionReportText] = useState('');

  // Commercial Transaction Inputs
  const [dealType, setDealType] = useState<'purchase' | 'sale' | 'customer_intro' | 'participation'>('sale');
  const [dealTitle, setDealTitle] = useState('');
  const [dealDetails, setDealDetails] = useState('');
  const [dealTonnage, setDealTonnage] = useState(0);
  const [dealValue, setDealValue] = useState(10000000);
  const [showDealSuccess, setShowDealSuccess] = useState(false);

  // Suggestion Box Inputs
  const [sugType, setSugType] = useState<'idea' | 'process_improvement' | 'saving' | 'commercial' | 'other'>('idea');
  const [sugTitle, setSugTitle] = useState('');
  const [sugContent, setSugContent] = useState('');
  const [showSugSuccess, setShowSugSuccess] = useState(false);

  // Direct CEO Inbox Inputs
  const [msgBody, setMsgBody] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [showMsgSuccess, setShowMsgSuccess] = useState(false);

  // GPS Simulation and Punch-In/Out states
  const [simLat, setSimLat] = useState('35.6892');
  const [simLng, setSimLng] = useState('51.3890');
  const [simManualDesc, setSimManualDesc] = useState('ستاد مرکزی تهران - خیابان شریعتی');
  const [simCheckInTime, setSimCheckInTime] = useState('08:00');
  const [simCheckOutTime, setSimCheckOutTime] = useState('17:00');
  const [simGPSFailed, setSimGPSFailed] = useState(false);

  // Leave and Mission Requests states
  const [leaveDate, setLeaveDate] = useState('۱۴۰۵/۰۴/۰۴');
  const [missionType, setMissionType] = useState<'daily' | 'hourly'>('daily');
  const [missionDate, setMissionDate] = useState('۱۴۰۵/۰۴/۰۴');
  const [missionReason, setMissionReason] = useState('');
  const [showMissionSuccess, setShowMissionSuccess] = useState(false);

  // Attendance Correction Requests states
  const [correctionDate, setCorrectionDate] = useState(getPersianTodayString());
  const [correctionCheckIn, setCorrectionCheckIn] = useState('');
  const [correctionCheckOut, setCorrectionCheckOut] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [showCorrectionSuccess, setShowCorrectionSuccess] = useState(false);

  // Document Upload states
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('سند مالی');
  const [docDetails, setDocDetails] = useState('');
  const [showDocSuccess, setShowDocSuccess] = useState(false);

  // Daily Work Performance Report states
  const [reportDetails, setReportDetails] = useState('');
  const [reportHours, setReportHours] = useState('۹');
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('لطفا تمامی فیلدها را کامل کنید.');
      return;
    }
    if (currentPassword !== currentUser.password) {
      setPassError('رمز عبور فعلی نامعتبر است!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('رمز عبور جدید و تکرار آن همخوانی ندارند.');
      return;
    }
    if (newPassword.length < 3) {
      setPassError('رمز عبور جدید باید حداقل ۳ کاراکتر باشد.');
      return;
    }
    if (onUpdateUser) {
      onUpdateUser(currentUser.id, { password: newPassword });
      setPassSuccess('رمز عبور با موفقیت بروزرسانی شد.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassError('');
    } else {
      setPassError('خطا در دسترسی به سیستم ثبت اطلاعات.');
    }
  };

  // Calculators
  const personalAttendances = attendanceRecords.filter((rec) => rec.userId === currentUser.id);
  const personalDeals = allCommercials.filter((c) => c.userId === currentUser.id);
  const personalSuggestions = allSuggestions.filter((s) => s.userId === currentUser.id);
  
  // Calculate Net Salary (حقوق پایه + مزایا + پورسانت + پاداش - کسورات)
  const baseSal = currentUser.financialInfo.baseSalary;
  const benefits = currentUser.financialInfo.benefits;
  const bonus = currentUser.financialInfo.bonus;
  const comm = currentUser.financialInfo.commission;
  const deductions = currentUser.financialInfo.deductions;
  const netEarnings = baseSal + benefits + bonus + comm - deductions;

  // Retrieve today attendances
  const todayDateString = '۱۴۰۵/۰۴/۰۳';
  const todayRecord = personalAttendances.find((r) => r.date === todayDateString);

  return (
    <div className="space-y-6">

      {/* GLOBAL SEARCH MODULE */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md">
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی سریع بین پرسنل، تسک‌ها و مدارک شرکت..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full bg-slate-50 p-4 pr-12 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:bg-white transition-all text-right font-bold"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* SEARCH RESULTS CONTAINER */}
        {globalSearchQuery.trim() !== '' && (() => {
          const matchingUsers = allUsers.filter(u =>
            u.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            u.position.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            u.department.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            u.employeeCode.toLowerCase().includes(globalSearchQuery.toLowerCase())
          );

          const matchingTasks = allTasks.filter(t => {
            const assigneeNames = t.assignees.map(id => allUsers.find(u => u.id === id)?.name || id).join('، ');
            return t.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              (t.description && t.description.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
              assigneeNames.toLowerCase().includes(globalSearchQuery.toLowerCase());
          });

          const matchingDocs = companyDocuments.filter(d =>
            d.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            (d.description && d.description.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
            d.uploadedByUserName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
            d.fileName.toLowerCase().includes(globalSearchQuery.toLowerCase())
          );

          return (
            <div className="mt-4 border-t border-slate-100 pt-3 space-y-4 max-h-96 overflow-y-auto">
              <div className="text-right pb-1 border-b border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400">نتایج جستجو برای "{globalSearchQuery}"</span>
                <button onClick={() => setGlobalSearchQuery('')} className="text-[10px] font-bold text-brand-cyan hover:underline cursor-pointer">پاک کردن</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. USERS */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-600 border-r-2 border-amber-500 pr-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span>کاربران و پرسنل ({toPersianDigits(matchingUsers.length)})</span>
                  </h4>
                  {matchingUsers.length === 0 ? (
                    <p className="text-[10px] text-slate-400 pr-2">کاربری یافت نشد.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {matchingUsers.slice(0, 5).map(u => (
                        <div key={u.id} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100/85 transition-all text-right text-xs border border-slate-100">
                          <div className="font-extrabold text-slate-800 flex justify-between">
                            <span>{u.name}</span>
                            <span className="text-[9px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">{u.employeeCode}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">{u.position} • {u.department}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. TASKS */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-600 border-r-2 border-brand-cyan pr-1.5 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>وظایف و کارها ({toPersianDigits(matchingTasks.length)})</span>
                  </h4>
                  {matchingTasks.length === 0 ? (
                    <p className="text-[10px] text-slate-400 pr-2">وظیفه‌ای یافت نشد.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {matchingTasks.slice(0, 5).map(t => (
                        <div key={t.id} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100/85 transition-all text-right text-xs border border-slate-100">
                          <div className="font-extrabold text-slate-800 flex justify-between items-center">
                            <span className="truncate max-w-[150px]">{t.title}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                              t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                              t.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {t.status === 'completed' ? 'تکمیل‌شده' : t.status === 'in_progress' ? 'در جریان' : 'کارتابل'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">مسئول: {t.assignees.map(id => allUsers.find(u => u.id === id)?.name || id).join('، ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. DOCUMENTS */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-600 border-r-2 border-indigo-500 pr-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>اسناد و مدارک ({toPersianDigits(matchingDocs.length)})</span>
                  </h4>
                  {matchingDocs.length === 0 ? (
                    <p className="text-[10px] text-slate-400 pr-2">سندی یافت نشد.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {matchingDocs.slice(0, 5).map(d => (
                        <div key={d.id} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100/85 transition-all text-right text-xs border border-slate-100">
                          <div className="font-extrabold text-slate-800 flex justify-between">
                            <span className="truncate max-w-[150px]">{d.title}</span>
                            <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">{d.fileName.slice(-10)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">بارگذاری: {d.uploadedByUserName} • تاریخ: {d.createdAt}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 1. Header welcome widget displaying the required indicators on home screen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Profile overview card with Today's Prayer embedded inside the purple box */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-purple-500/40 md:col-span-2 flex flex-col justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-purple-500/10 skew-x-12 transform origin-top-left pointer-events-none blur-2xl" />
          
          <div className="flex items-center space-x-reverse space-x-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-black text-purple-200 text-2xl shadow-xl overflow-hidden">
              {currentUser.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('data:image')) ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.avatar
              )}
            </div>
            <div>
              <span className="text-[10px] bg-purple-500/30 border border-purple-400/40 text-purple-200 px-2.5 py-0.5 rounded-full font-bold">بایگانی فعال پرسنل هلدینگ</span>
              <h3 className="text-lg font-black mt-1 text-white">{currentUser.name}</h3>
              <p className="text-xs text-purple-200 mt-0.5">{currentUser.position}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-purple-800/60 pt-4 text-xs relative z-10">
            <div>
              <span className="text-purple-300 text-[10px] block">تاریخ ثبت سیستم</span>
              <span className="font-extrabold text-white mt-1 block">{toPersianDigits(getPersianTodayString().split(' ').slice(1).join(' '))}</span>
            </div>
            <div>
              <span className="text-purple-300 text-[10px] block">امتیاز انضباطی ماه</span>
              <span className="font-extrabold text-emerald-300 text-sm mt-1 block">
                {toPersianDigits(currentUser.currentScore)} / ۱۰۰
              </span>
            </div>
            <div>
              <span className="text-purple-300 text-[10px] block">میانگین سالیانه</span>
              <span className="font-extrabold text-purple-200 text-sm mt-1 block">
                {toPersianDigits(currentUser.avgScore)}
              </span>
            </div>
          </div>

          {/* Today's Prayer inside the Active Personnel Archive Purple Box */}
          <div className="border-t border-purple-800/60 pt-4 relative z-10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                <span className="text-xs font-black text-purple-100">دعا امروز</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] text-purple-200 font-bold">انتخاب پرسنل:</span>
                <select
                  value={selectedPrayerUser}
                  onChange={(e) => setSelectedPrayerUser(e.target.value)}
                  className="bg-purple-900/60 border border-purple-500/40 rounded-xl px-2.5 py-1 text-[10px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
                >
                  <option value="all" className="bg-purple-950 text-white">همه پرسنل</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.name} className="bg-purple-950 text-white">
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="نیایش یا دعای امروز خود را اینجا بنویسید..."
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                className="flex-1 bg-purple-900/50 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              />
              <button
                onClick={() => {
                  if (!prayerText.trim() || !onAddPrayer) return;
                  onAddPrayer(prayerText);
                  setPrayerText('');
                }}
                disabled={!prayerText.trim()}
                className={`px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !prayerText.trim()
                    ? 'bg-purple-800/40 text-purple-400/50 cursor-not-allowed border border-purple-700/30'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-md shadow-purple-500/25'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>ارسال دعای امروز</span>
              </button>
            </div>

            {/* List of Today's Prayers within the purple box */}
            {dailyPrayers.filter(p => selectedPrayerUser === 'all' || p.userName === selectedPrayerUser).length > 0 ? (
              <div className="mt-3 pt-3 border-t border-purple-800/40 space-y-2 max-h-40 overflow-y-auto pr-1">
                {dailyPrayers
                  .filter(p => selectedPrayerUser === 'all' || p.userName === selectedPrayerUser)
                  .map((prayer) => (
                    <div key={prayer.id} className="bg-purple-900/30 rounded-xl p-2.5 border border-purple-500/20 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-purple-200">{prayer.userName}</span>
                        <span className="text-purple-400 text-[9px]">{prayer.createdAt}</span>
                      </div>
                      <p className="text-xs text-purple-100 leading-relaxed pr-1">{prayer.text}</p>
                      {prayer.adminReply && (
                        <div className="mt-1 bg-purple-950/60 p-2 rounded-lg border border-purple-400/30 text-[10px]">
                          <span className="font-extrabold text-purple-300 block mb-0.5">پاسخ مدیر به دعای امروز:</span>
                          <span className="text-purple-100">{prayer.adminReply}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              selectedPrayerUser !== 'all' && (
                <div className="mt-3 pt-3 border-t border-purple-800/40 text-center text-[10px] text-purple-300">
                  هیچ دعایی برای {selectedPrayerUser} ثبت نشده است.
                </div>
              )
            )}
          </div>
        </div>

        {/* Rapid Arrival Checklist Clock - Punching card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-black text-slate-800">دستگاه حضور و غیاب</span>
              <Clock className="w-4 h-4 text-brand-cyan animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400">ساعت کاری: شنبه تا چهارشنبه ۸ الی ۱۷ / پنجشنبه تعجیل تعطیل</p>
          </div>

          <div className="my-3 space-y-2.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">انتخاب نام موقعیت مکانی استقرار</label>
              <select
                value={punchLocationName}
                onChange={(e) => setPunchLocationName(e.target.value)}
                disabled={!!todayRecord?.checkIn}
                className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-800 font-bold"
              >
                <option value="دفتر مرکزی هلدینگ (خیابان شریعتی)">دفتر مرکزی هلدینگ (خیابان شریعتی)</option>
                <option value="کارخانه تولیدی (شهرک صنعتی)">کارخانه تولیدی (شهرک صنعتی)</option>
                <option value="دفتر بازرگانی و فروش">دفتر بازرگانی و فروش</option>
                <option value="انبار مرکزی">انبار مرکزی</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="gps_discrepancy_home"
                checked={punchGpsDiscrepancy}
                onChange={(e) => setPunchGpsDiscrepancy(e.target.checked)}
                disabled={!!todayRecord?.checkIn}
                className="w-4 h-4 text-brand-cyan border-slate-300 rounded focus:ring-brand-cyan"
              />
              <label htmlFor="gps_discrepancy_home" className="text-xs font-extrabold text-amber-700 cursor-pointer">
                اختلال جی‌پی‌اس (تیک تایید مغایرت موقعیت مکانی)
              </label>
            </div>

            {punchGpsDiscrepancy && (
              <div className="animate-fadeIn pt-1">
                <input
                  type="text"
                  placeholder="آدرس دستی محل استقرار (جهت تایید فوری مدیر داخلی)..."
                  value={punchManualLocation}
                  onChange={(e) => setPunchManualLocation(e.target.value)}
                  disabled={!!todayRecord?.checkIn}
                  className="w-full bg-amber-50/80 p-2 rounded-xl border border-amber-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}
          </div>

          <div className="my-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">ثبت ورود امروز</span>
              <span className="text-xs font-extrabold text-slate-800">
                {todayRecord?.checkIn ? toPersianDigits(todayRecord.checkIn) : 'ثبت نشده'}
              </span>
            </div>
            <div className="border-r border-slate-200 h-8" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">ثبت خروج امروز</span>
              <span className="text-xs font-extrabold text-slate-800">
                {todayRecord?.checkOut ? toPersianDigits(todayRecord.checkOut) : 'ثبت نشده'}
              </span>
            </div>
          </div>

          {gpsNotification && (
            <div className={`my-2.5 p-2.5 rounded-xl text-[10px] text-right font-bold border ${
              gpsNotification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              gpsNotification.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {gpsNotification.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleLocalPunchIn}
              disabled={!!todayRecord?.checkIn || gpsProcessing}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-reverse space-x-1.5 transition-all outline-none ${
                todayRecord?.checkIn 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 cursor-pointer'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{gpsProcessing ? 'در حال استعلام...' : 'ثبت ورود'}</span>
            </button>
            <button
              onClick={() => onPunchOut()}
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-reverse space-x-1.5 transition-all outline-none ${
                !todayRecord?.checkIn || todayRecord?.checkOut
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-rose-500/10 cursor-pointer'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ثبت خروج</span>
            </button>
          </div>
        </div>

      </div>

      {/* 2. PERS PERSONNEL TABS */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'home' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          نما کلی عملکرد پرسنل
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'attendance' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          حضور و درخواست مرخصی
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'finance' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          فیش حقوق و مزایا
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'suggestions' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          صندوق پیشنهادات من
        </button>
        <button
          onClick={() => setActiveTab('pms')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'pms' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          ارتباط مستقیم با مدیر
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'documents' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          اسناد و امانات
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'reports' ? 'bg-brand-navy text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          گزارش روزانه کار
        </button>
      </div>

      {/* 3. TABS CONTENT */}

      {/* TAB 1: Home dashboard Overview & summary metrics */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Quick Metrics display - "میانگین فصلی، میانگین سالانه، رتبه سازمانی" */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800">کارنامه خلاصه عملکرد ماه جاری</h4>
            <div className="space-y-3.5 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">میانگین فصلی (بهار):</span>
                <span className="font-extrabold text-slate-800">{toPersianDigits(currentUser.avgScore - 0.5)}</span>
              </div>
              <div className="flex justify-between items-center pt-3.5">
                <span className="text-slate-500">میانگین انضباطی سالانه:</span>
                <span className="font-extrabold text-slate-800">{toPersianDigits(currentUser.avgScore)}</span>
              </div>
              <div className="flex justify-between items-center pt-3.5">
                <span className="text-slate-500">رتبه سازمانی در هلدینگ:</span>
                <span className="font-bold text-brand-cyan bg-brand-light py-0.5 px-2.5 rounded-full">
                  رتبه {toPersianDigits(currentUser.id === 'ghorbi' ? '۱' : (currentUser.id === 'reza' || currentUser.id === 'mousavi') ? 'مدیر' : '۳')} بین کادر
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800">ارتباطات و تسلیحات مالی سریع</h4>
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-brand-light rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block">دریافتی خالص ماه قبل</span>
                  <span className="font-extrabold text-brand-navy mt-1 block">{toPersianDigits(formatCurrency(netEarnings))}</span>
                </div>
                <Landmark className="w-5 h-5 text-brand-cyan" />
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-amber-800 text-[10px] block">پیشنهادات پذیرفته شده</span>
                  <span className="font-extrabold text-amber-700 mt-1 block">{toPersianDigits(personalSuggestions.filter(s=>s.status==='approved').length)} ایده</span>
                </div>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-cyan" />
              <span>امنیت و تغییر رمز عبور پرسنل</span>
            </h4>
            <p className="text-[10px] text-slate-400">جهت حفاظت از کارنامه انضباطی، وظایف و صندوق پیشنهادات، رمز خود را تغییر دهید.</p>
            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs text-right">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">رمز عبور فعلی</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPassError('');
                    setPassSuccess('');
                  }}
                  className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-800 pr-3.5"
                  placeholder="••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">رمز عبور جدید</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPassError('');
                      setPassSuccess('');
                    }}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-800 pr-3.5"
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">تکرار رمز جدید</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPassError('');
                      setPassSuccess('');
                    }}
                    className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-800 pr-3.5"
                    placeholder="••••"
                  />
                </div>
              </div>

              {passError && (
                <p className="text-[10px] font-bold text-rose-500 bg-rose-50 p-1.5 rounded-lg border border-rose-100 text-center">
                  {passError}
                </p>
              )}

              {passSuccess && (
                <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 text-center">
                  {passSuccess}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-brand-navy hover:bg-slate-850 text-white font-bold py-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                بروزرسانی رمز عبور
              </button>
            </form>
          </div>

        </div>
      )}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Main Attendance Card in Attendance Tab */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-cyan" />
                  <span>دستگاه حضور و غیاب</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">کلیه محاسبات پاداش و جریمه انضباطی به صورت خودکار توسط همین دستگاه اعمال می‌گردد.</p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-100 text-[10px] font-bold">
                💡 بدون نیاز به طول و عرض جغرافیایی مختصاتی
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">انتخاب نام موقعیت مکانی استقرار</label>
                <select
                  value={punchLocationName}
                  onChange={(e) => setPunchLocationName(e.target.value)}
                  disabled={!!todayRecord?.checkIn}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-800 font-bold"
                >
                  <option value="دفتر مرکزی هلدینگ (خیابان شریعتی)">دفتر مرکزی هلدینگ (خیابان شریعتی)</option>
                  <option value="کارخانه تولیدی (شهرک صنعتی)">کارخانه تولیدی (شهرک صنعتی)</option>
                  <option value="دفتر بازرگانی و فروش">دفتر بازرگانی و فروش</option>
                  <option value="انبار مرکزی">انبار مرکزی</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="gps_discrepancy_tab"
                    checked={punchGpsDiscrepancy}
                    onChange={(e) => setPunchGpsDiscrepancy(e.target.checked)}
                    disabled={!!todayRecord?.checkIn}
                    className="w-4 h-4 text-brand-cyan border-slate-300 rounded focus:ring-brand-cyan"
                  />
                  <label htmlFor="gps_discrepancy_tab" className="text-xs font-extrabold text-amber-700 cursor-pointer">
                    اختلال جی‌پی‌اس (تیک تایید مغایرت موقعیت مکانی)
                  </label>
                </div>
              </div>
            </div>

            {punchGpsDiscrepancy && (
              <div className="animate-fadeIn pt-1">
                <label className="text-[10px] font-bold text-amber-800 block mb-1">وارد کردن دستی مکان حضور (ارجاع فوری جهت تایید مدیر داخلی):</label>
                <input
                  type="text"
                  placeholder="علت اختلال و آدرس دقیق محل استقرار فعلی را بنویسید..."
                  value={punchManualLocation}
                  onChange={(e) => setPunchManualLocation(e.target.value)}
                  disabled={!!todayRecord?.checkIn}
                  className="w-full bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-800 font-medium"
                />
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-around my-4">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block">ثبت ورود امروز</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {todayRecord?.checkIn ? toPersianDigits(todayRecord.checkIn) : 'ثبت نشده'}
                </span>
              </div>
              <div className="border-r border-slate-200 h-8" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block">ثبت خروج امروز</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {todayRecord?.checkOut ? toPersianDigits(todayRecord.checkOut) : 'ثبت نشده'}
                </span>
              </div>
            </div>

            {gpsNotification && (
              <div className={`my-2.5 p-2.5 rounded-xl text-[10px] text-right font-bold border ${
                gpsNotification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                gpsNotification.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              }`}>
                {gpsNotification.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleLocalPunchIn}
                disabled={!!todayRecord?.checkIn || gpsProcessing}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
                  todayRecord?.checkIn 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 cursor-pointer'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{gpsProcessing ? 'در حال استعلام...' : 'ثبت ورود اداری'}</span>
              </button>
              <button
                onClick={() => onPunchOut()}
                disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
                  !todayRecord?.checkIn || todayRecord?.checkOut
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-rose-500/10 cursor-pointer'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>ثبت خروج اداری</span>
              </button>
            </div>

            <div className="bg-brand-cyan/10 p-3 rounded-xl border border-brand-cyan/20 text-xs text-slate-700 leading-relaxed mt-2">
              📣 <strong>توضیحات جریمه و پاداش انضباطی:</strong> کسر ۱ امتیاز بابت تاخیر بین ۱۵ تا ۴۵ دقیقه، کسر ۲ امتیاز بین ۴۵ تا ۹۰ دقیقه، کسر ۵ امتیاز برای بیش از ۹۰ دقیقه تاخیر. تخصیص +۱ تا +۳ امتیاز پاداش انضباطی خودکار در صورت حضور دقیق یا تعجیل مجاز در ورود!
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Submit Leave & Mission requests */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              {/* Disciplinary Past-Mission Blocking System */}
              {(() => {
                const pendingMissionReport = missionRequests.find(m => m.userId === currentUser.id && m.status === 'approved' && !m.isReportSubmitted);
                if (pendingMissionReport) {
                  return (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs space-y-2 text-right">
                      <span className="font-extrabold flex items-center gap-1.5 text-rose-700">
                        ⚠️ محدودیت انضباطی: گزارش ماموریت ثبت‌نشده
                      </span>
                      <p className="leading-relaxed">
                        بر اساس آیین‌نامه انضباطی و مالی شرکت، تا زمانی که «گزارش دستاوردها» را برای ماموریت مصوب گذشته خود به مقصد <strong className="text-rose-900 font-bold">«{pendingMissionReport.location}»</strong> ثبت نکنید، سیستم مجاز به ثبت درخواست‌های مرخصی و ماموریت جدید شما نخواهد بود.
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold block">شرح دستاوردها و خلاصه دستاوردهای ماموریت اداری:</label>
                        <textarea
                          placeholder="مثال: مذاکره با کارفرما تکمیل شد و تاییدیه فنی فاز ۲ دریافت گردید..."
                          value={postMissionReportText}
                          onChange={(e) => setPostMissionReportText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs h-16 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                        <button
                          onClick={() => {
                            if (!postMissionReportText.trim()) return;
                            if (onUpdateMissionRequest) {
                              onUpdateMissionRequest({
                                ...pendingMissionReport,
                                isReportSubmitted: true,
                                reportContent: postMissionReportText
                              });
                              setPostMissionReportText('');
                            }
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 rounded-lg cursor-pointer"
                        >
                          ثبت گزارش و رفع مسدودی سیستم
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Leave Request Box */}
              <div>
                <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5 mb-3">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span>ثبت درخواست مرخصی</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">نوع مرخصی درخواستی</label>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setLeaveType('daily')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap outline-none cursor-pointer ${
                          leaveType === 'daily' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        روزانه
                      </button>
                      <button
                        onClick={() => setLeaveType('hourly')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap outline-none cursor-pointer ${
                          leaveType === 'hourly' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        ساعتی
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">دسته‌بندی مرخصی</label>
                    <select
                      value={leaveCategory}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setLeaveCategory(val);
                        if (val !== 'sick') {
                          setLeaveAttachmentName('');
                        }
                      }}
                      className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                    >
                      <option value="earned">استحقاقی (کسر از مرخصی سالانه)</option>
                      <option value="sick">استعلاجی (دارای تاییدیه پزشکی)</option>
                      <option value="unpaid">بدون حقوق (بدون احتساب سابقه کار)</option>
                    </select>
                  </div>

                  {leaveCategory === 'sick' && (
                    <div className="animate-fadeIn">
                      <label className="text-[10px] text-slate-500 block mb-1">نام یا فایل پیوست گواهی پزشکی (اجباری)</label>
                      <input
                        type="text"
                        placeholder="مثال: medical_cert_h_ghorbi.jpg"
                        value={leaveAttachmentName}
                        onChange={(e) => setLeaveAttachmentName(e.target.value)}
                        className="w-full bg-amber-50/60 p-2 rounded-xl border border-amber-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">تاریخ شروع مرخصی</label>
                      <input 
                        type="text" 
                        value={leaveDate}
                        onChange={(e) => setLeaveDate(e.target.value)}
                        className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                      />
                    </div>

                    {leaveType === 'daily' && (
                      <div className="animate-fadeIn">
                        <label className="text-[10px] text-slate-500 block mb-1">تاریخ پایان مرخصی</label>
                        <input 
                          type="text" 
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {leaveType === 'hourly' && (
                    <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">ساعت شروع مرخصی</label>
                        <input
                          type="text"
                          placeholder="۰۹:۰۰"
                          value={leaveStartTime}
                          onChange={(e) => setLeaveStartTime(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">ساعت پایان مرخصی</label>
                        <input
                          type="text"
                          placeholder="۱۱:۳۰"
                          value={leaveEndTime}
                          onChange={(e) => setLeaveEndTime(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">انتخاب پرسنل جانشین در سازمان (جهت هماهنگی وظایف)</label>
                    <select
                      value={leaveSubstituteId}
                      onChange={(e) => setLeaveSubstituteId(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                    >
                      <option value="">بدون جانشین (پیش‌فرض)</option>
                      {allUsers.filter(u => u.id !== currentUser.id).map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">علت و جزییات مرخصی</label>
                    <textarea
                      placeholder="علت درخواست را بنویسید..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs h-14 focus:outline-none"
                    />
                  </div>

                  {(() => {
                    const isBlocked = !!missionRequests.find(m => m.userId === currentUser.id && m.status === 'approved' && !m.isReportSubmitted);
                    const substituteUser = allUsers.find(u => u.id === leaveSubstituteId);

                    return (
                      <button
                        onClick={() => {
                          if (isBlocked) return;
                          if (!leaveReason) return;
                          if (leaveCategory === 'sick' && !leaveAttachmentName.trim()) {
                            alert('ثبت فایل ضمیمه گواهی پزشکی برای مرخصی استعلاجی اجباری است.');
                            return;
                          }

                          const req: LeaveRequest = {
                            id: 'lv_' + Math.random().toString(36).substring(2, 9),
                            userId: currentUser.id,
                            userName: currentUser.name,
                            type: leaveType,
                            leaveCategory: leaveCategory,
                            startDate: leaveDate,
                            endDate: leaveType === 'daily' ? leaveEndDate : undefined,
                            startTime: leaveType === 'hourly' ? leaveStartTime : undefined,
                            endTime: leaveType === 'hourly' ? leaveEndTime : undefined,
                            reason: leaveReason,
                            substituteId: leaveSubstituteId || undefined,
                            substituteName: substituteUser ? substituteUser.name : undefined,
                            attachmentName: leaveAttachmentName || undefined,
                            status: 'pending',
                            createdAt: '۱۴۰۵/۰۴/۰۳',
                            sentToPayroll: false
                          };
                          onAddLeaveRequest(req);
                          setShowLeaveSuccess(true);
                          setLeaveReason('');
                          setLeaveSubstituteId('');
                          setLeaveAttachmentName('');
                          setTimeout(() => setShowLeaveSuccess(false), 4000);
                        }}
                        disabled={isBlocked}
                        className={`w-full font-bold text-xs py-2 rounded-xl text-center transition-all ${
                          isBlocked 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-brand-cyan hover:bg-blue-600 text-white cursor-pointer shadow-md shadow-cyan-500/10'
                        }`}
                      >
                        {isBlocked ? 'سیستم مسدود است (ثبت گزارش ماموریت گذشته)' : 'ثبت مرخصی'}
                      </button>
                    );
                  })()}

                  {showLeaveSuccess && (
                    <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                      درخواست مرخصی ثبت شد و جهت تایید به کارتابل مدیر داخلی ارسال گردید.
                    </div>
                  )}
                </div>
              </div>

              {/* Mission Request Box */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5 mb-3">
                  <Briefcase className="w-4 h-4 text-brand-cyan" />
                  <span>ثبت درخواست ماموریت کاری</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">نوع ماموریت اداری</label>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setMissionType('daily')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap outline-none cursor-pointer ${
                          missionType === 'daily' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        روزانه
                      </button>
                      <button
                        onClick={() => setMissionType('hourly')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap outline-none cursor-pointer ${
                          missionType === 'hourly' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        ساعتی
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">قلمرو و محدوده جغرافیایی</label>
                    <select
                      value={missionSubType}
                      onChange={(e) => setMissionSubType(e.target.value as any)}
                      className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                    >
                      <option value="intra_city">ساعتی درون‌شهری (بازدید کارگاه/بانک)</option>
                      <option value="inter_city">روزانه بین‌شهری (دفاتر استانی / کارخانجات)</option>
                      <option value="abroad">روزانه بین‌المللی (خارج از کشور)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">سازمان، موسسه یا شرکت مقصد ماموریت</label>
                    <input
                      type="text"
                      placeholder="مثال: بانک مرکزی شعبه میرداماد / کارخانه ابهر"
                      value={missionDestinationCompany}
                      onChange={(e) => setMissionDestinationCompany(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">تاریخ شروع ماموریت</label>
                      <input 
                        type="text" 
                        value={missionDate}
                        onChange={(e) => setMissionDate(e.target.value)}
                        className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                      />
                    </div>

                    {missionType === 'daily' && (
                      <div className="animate-fadeIn">
                        <label className="text-[10px] text-slate-500 block mb-1">تاریخ پایان ماموریت</label>
                        <input 
                          type="text" 
                          value={missionEndDate}
                          onChange={(e) => setMissionEndDate(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {missionType === 'hourly' && (
                    <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">ساعت شروع ماموریت</label>
                        <input
                          type="text"
                          placeholder="۱۰:۰۰"
                          value={missionStartTime}
                          onChange={(e) => setMissionStartTime(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">ساعت پایان ماموریت</label>
                        <input
                          type="text"
                          placeholder="۱۴:۰۰"
                          value={missionEndTime}
                          onChange={(e) => setMissionEndTime(e.target.value)}
                          className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">وسیله نقلیه سفر</label>
                      <select
                        value={missionVehicleType}
                        onChange={(e) => setMissionVehicleType(e.target.value as any)}
                        className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                      >
                        <option value="personal">خودرو شخصی پرسنل</option>
                        <option value="company">خودرو شرکتی هلدینگ</option>
                        <option value="public">حمل‌ونقل عمومی / قطار / هواپیما</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">تنخواه مورد نیاز درخواستی (ریال)</label>
                      <input
                        type="number"
                        placeholder="مثال: ۵۰۰۰۰۰۰"
                        value={missionBudget || ''}
                        onChange={(e) => setMissionBudget(Number(e.target.value))}
                        className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">لوکیشن تقریبی جی‌پی‌اس مقصد (مختصات یا نام خیابان)</label>
                    <input
                      type="text"
                      placeholder="مثال: 35.72, 51.41 / میدان ونک"
                      value={missionApproximateGps}
                      onChange={(e) => setMissionApproximateGps(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">هدف سفر و شرح تفصیلی ماموریت</label>
                    <textarea
                      placeholder="هدف سفر و جزئیات قرار اداری را بنویسید..."
                      value={missionReason}
                      onChange={(e) => setMissionReason(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs h-14 focus:outline-none"
                    />
                  </div>

                  {(() => {
                    const isBlocked = !!missionRequests.find(m => m.userId === currentUser.id && m.status === 'approved' && !m.isReportSubmitted);

                    return (
                      <button
                        onClick={() => {
                          if (isBlocked) return;
                          if (!missionReason) return;
                          const req: MissionRequest = {
                            id: 'ms_' + Math.random().toString(36).substring(2, 9),
                            userId: currentUser.id,
                            userName: currentUser.name,
                            type: missionType,
                            subType: missionSubType,
                            date: missionDate,
                            endDate: missionType === 'daily' ? missionEndDate : undefined,
                            startTime: missionType === 'hourly' ? missionStartTime : undefined,
                            endTime: missionType === 'hourly' ? missionEndTime : undefined,
                            location: missionDestinationCompany || 'محل ماموریت',
                            destinationCompany: missionDestinationCompany || undefined,
                            approximateGps: missionApproximateGps || undefined,
                            budget: missionBudget || undefined,
                            vehicleType: missionVehicleType,
                            reason: missionReason,
                            status: 'pending',
                            createdAt: '۱۴۰۵/۰۴/۰۳',
                            sentToPayroll: false,
                            isReportSubmitted: false
                          };
                          onAddMissionRequest(req);
                          setShowMissionSuccess(true);
                          setMissionReason('');
                          setMissionDestinationCompany('');
                          setMissionApproximateGps('');
                          setMissionBudget(0);
                          setTimeout(() => setShowMissionSuccess(false), 4000);
                        }}
                        disabled={isBlocked}
                        className={`w-full font-bold text-xs py-2 rounded-xl text-center transition-all ${
                          isBlocked 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-brand-cyan hover:bg-blue-600 text-white cursor-pointer shadow-md shadow-cyan-500/10'
                        }`}
                      >
                        {isBlocked ? 'سیستم مسدود است (ثبت گزارش ماموریت گذشته)' : 'ثبت ماموریت اداری'}
                      </button>
                    );
                  })()}

                  {showMissionSuccess && (
                    <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                      درخواست ماموریت کاری با موفقیت ثبت و جهت ممیزی ارسال شد.
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Correction Request Box */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5 mb-3">
                  <Clock className="w-4 h-4 text-brand-cyan" />
                  <span>درخواست اصلاح ساعت ورود/خروج</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">تاریخ خورشیدی</label>
                    <input 
                      type="text" 
                      value={correctionDate}
                      onChange={(e) => setCorrectionDate(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">ساعت ورود صحیح</label>
                      <input
                        type="text"
                        placeholder="مثال: ۰۸:۰۰"
                        value={correctionCheckIn}
                        onChange={(e) => setCorrectionCheckIn(e.target.value)}
                        className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">ساعت خروج صحیح</label>
                      <input
                        type="text"
                        placeholder="مثال: ۱۷:۰۰"
                        value={correctionCheckOut}
                        onChange={(e) => setCorrectionCheckOut(e.target.value)}
                        className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs font-mono text-center focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">علت اصلاح</label>
                    <textarea
                      placeholder="دلیل عدم ثبت صحیح ساعت را بنویسید..."
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs h-14 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!correctionReason) return;
                      const req: AttendanceCorrectionRequest = {
                        id: 'acor_' + Math.random().toString(36).substring(2, 9),
                        userId: currentUser.id,
                        userName: currentUser.name,
                        date: correctionDate,
                        requestedCheckIn: correctionCheckIn || undefined,
                        requestedCheckOut: correctionCheckOut || undefined,
                        reason: correctionReason,
                        status: 'pending',
                        createdAt: getPersianTodayString()
                      };
                      onAddAttendanceCorrection(req);
                      setShowCorrectionSuccess(true);
                      setCorrectionReason('');
                      setCorrectionCheckIn('');
                      setCorrectionCheckOut('');
                      setTimeout(() => setShowCorrectionSuccess(false), 4000);
                    }}
                    className="w-full bg-brand-cyan hover:bg-blue-600 text-white font-bold text-xs py-2 rounded-xl cursor-pointer text-center transition-all"
                  >
                    ثبت درخواست اصلاح تردد
                  </button>

                  {showCorrectionSuccess && (
                    <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                      درخواست اصلاح تردد با موفقیت ثبت و به مدیریت ارسال شد.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Personal attendance logs & leaves logs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Table of attendance logs */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                  <span>گزارشات حضور و غیاب شخصی شما</span>
                  <span className="text-[10px] text-slate-400">ثبت شده در سرور ستاد مرکزی</span>
                </h3>

                <div className="overflow-x-auto text-xs text-right">
                  {personalAttendances.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">هیچ رکوردی ثبت نشده است. از کارت فوق ثبت تردد کنید.</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="p-3">تاریخ / روز</th>
                          <th className="p-3">ساعت ورود / خروج</th>
                          <th className="p-3">وضعیت انضباطی</th>
                          <th className="p-3 text-center">تخلف جریمه</th>
                          <th className="p-3 text-left">کسب امتیاز نهایی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {personalAttendances.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-slate-630">
                              <span className="block font-bold text-slate-800">{rec.date}</span>
                              <span className="text-[10px] text-slate-400">{rec.dayOfWeek}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-700">{rec.checkIn ? toPersianDigits(rec.checkIn) : '--:--'}</span>
                              <span className="mx-1 text-slate-400">الی</span>
                              <span className="font-bold text-slate-700">{rec.checkOut ? toPersianDigits(rec.checkOut) : '--:--'}</span>
                            </td>
                            <td className="p-3">
                              {rec.status === 'present' && <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded font-bold">بموقع و حاضر</span>}
                              {rec.status === 'late' && (
                                <span className="text-rose-500 bg-rose-50 px-2.5 py-1 rounded font-bold">
                                  {toPersianDigits(rec.delayMinutes)} دقیقه تأخیر
                                </span>
                              )}
                              {rec.status === 'early_departure' && (
                                <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded font-bold">
                                  {toPersianDigits(rec.earlyDepartureMinutes)} دقیقه تعجیل خروج
                                </span>
                              )}
                              {rec.status === 'leave_daily' && <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded font-bold">مرخصی روزانه</span>}
                              {rec.status === 'leave_hourly' && <span className="text-sky-650 bg-sky-50 px-2.5 py-1 rounded font-bold">مرخصی ساعتی</span>}
                            </td>
                            <td className="p-3 text-center font-bold text-rose-500">
                              {rec.scoreDeducted > 0 ? `-${toPersianDigits(rec.scoreDeducted)} امتیاز` : 'بدون جریمه'}
                            </td>
                            <td className="p-3 font-black text-slate-900 text-left">
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black">
                                {toPersianDigits(rec.calculatedScore)} امتیاز
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Table of requests logs */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4">
                  کارتابل مانیتورینگ مرخصی‌ها و ماموریت‌های شما
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Leaves request status */}
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <span className="text-xs font-extrabold text-slate-800 block">درخواست‌های مرخصی</span>
                    {leaveRequests.filter(l => l.userId === currentUser.id).length === 0 ? (
                      <span className="text-[10px] text-slate-400 block py-4 text-center">هیچ درخواست مرخصی فعالی یافت نشد.</span>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {leaveRequests.filter(l => l.userId === currentUser.id).map(l => (
                          <div key={l.id} className="bg-slate-50 p-2.5 rounded-lg text-[10px] border border-slate-150 flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-slate-700 block">{l.startDate} ({l.type === 'daily' ? 'روزانه' : 'ساعتی'})</span>
                              <span className="text-slate-500 block truncate max-w-[140px]">{l.reason}</span>
                            </div>
                            <div className="text-left space-y-1">
                              {l.status === 'pending' && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">معلق دفتر</span>}
                              {l.status === 'approved' && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">تایید شده</span>}
                              {l.status === 'rejected' && <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">رد شده</span>}
                              {l.sentToPayroll && <span className="block text-[8px] text-blue-600 font-extrabold bg-blue-50 px-1 py-0.2 rounded mt-1">حقوق اعمال شد</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missions request status */}
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <span className="text-xs font-extrabold text-slate-800 block">درخواست‌های ماموریت اداری</span>
                    {missionRequests.filter(m => m.userId === currentUser.id).length === 0 ? (
                      <span className="text-[10px] text-slate-400 block py-4 text-center">هیچ درخواست ماموریتی ثبت نشده است.</span>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {missionRequests.filter(m => m.userId === currentUser.id).map(m => (
                          <div key={m.id} className="bg-slate-50 p-2.5 rounded-lg text-[10px] border border-slate-150 flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-slate-700 block">{m.date} ({m.type === 'daily' ? 'روزانه' : 'ساعتی'})</span>
                              <span className="text-slate-500 block truncate max-w-[140px]">{m.reason}</span>
                            </div>
                            <div className="text-left space-y-1">
                              {m.status === 'pending' && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">معلق</span>}
                              {m.status === 'approved' && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">تایید شده</span>}
                              {m.status === 'rejected' && <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">رد شده</span>}
                              {m.sentToPayroll && <span className="block text-[8px] text-blue-600 font-extrabold bg-blue-50 px-1 py-0.2 rounded mt-1">حقوق اعمال شد</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Corrections request status */}
                <div className="mt-4 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <span className="text-xs font-extrabold text-slate-800 block">درخواست‌های اصلاح ساعت تردد</span>
                  {attendanceCorrections?.filter(c => c.userId === currentUser.id).length === 0 ? (
                    <span className="text-[10px] text-slate-400 block py-4 text-center">هیچ درخواست اصلاح ترددی ثبت نشده است.</span>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {attendanceCorrections?.filter(c => c.userId === currentUser.id).map(c => (
                        <div key={c.id} className="bg-slate-50 p-2.5 rounded-lg text-[10px] border border-slate-150 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-700 block">تاریخ: {c.date}</span>
                            <span className="text-slate-500 block truncate max-w-[200px]">ورود: {c.requestedCheckIn || '-'} / خروج: {c.requestedCheckOut || '-'} ({c.reason})</span>
                          </div>
                          <div className="text-left space-y-1">
                            {c.status === 'pending' && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">معلق</span>}
                            {c.status === 'approved' && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">تایید شده</span>}
                            {c.status === 'rejected' && <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">رد شده</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Payroll metrics - "فیش حقوق و مزایا" */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 bg-brand-navy h-2.5" />
          
          <div className="flex justify-between items-start pb-5 border-b border-dashed border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-900">هلدینگ کاویان سپنتا</h2>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">سامانه مدیریت حقوق و دستمزد آنلاین</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-slate-500 font-bold">انتخاب ماه فیش حقوقی:</label>
              <select
                value={selectedPayslipMonth}
                onChange={(e) => setSelectedPayslipMonth(e.target.value)}
                className="bg-brand-cyan/10 text-brand-cyan text-xs py-1 px-3 rounded-xl font-bold border border-brand-cyan/20 focus:outline-none"
              >
                <option value="فروردین‌ماه ۱۴۰۵">فروردین‌ماه ۱۴۰۵</option>
                <option value="اردیبهشت‌ماه ۱۴۰۵">اردیبهشت‌ماه ۱۴۰۵</option>
                <option value="خردادماه ۱۴۰۵">خردادماه ۱۴۰۵</option>
                <option value="تیرماه ۱۴۰۵">تیرماه ۱۴۰۵</option>
                <option value="مردادماه ۱۴۰۵">مردادماه ۱۴۰۵</option>
                <option value="شهریورماه ۱۴۰۵">شهریورماه ۱۴۰۵</option>
                <option value="مهرماه ۱۴۰۵">مهرماه ۱۴۰۵</option>
                <option value="آبان‌ماه ۱۴۰۵">آبان‌ماه ۱۴۰۵</option>
                <option value="آذرماه ۱۴۰۵">آذرماه ۱۴۰۵</option>
                <option value="دی‌ماه ۱۴۰۵">دی‌ماه ۱۴۰۵</option>
                <option value="بهمن‌ماه ۱۴۰۵">بهمن‌ماه ۱۴۰۵</option>
                <option value="اسفندماه ۱۴۰۵">اسفندماه ۱۴۰۵</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block pb-1">مشخصات پرسنل:</span>
              <span className="font-extrabold text-slate-900 block">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block">سمت: {currentUser.position}</span>
            </div>
            <div className="text-left space-y-1">
              <span className="text-slate-400 block pb-1">شناسه پرداخت الکترونیک:</span>
              <span className="font-bold text-slate-800 block">PAY-{currentUser.employeeCode}</span>
              <span className="text-[10px] text-slate-400 block">کد ملی/پرسنلی: {currentUser.employeeCode}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-805 mb-3">اقلام حقوق و دستمزد دریافتی:</h4>
            
            <div className="flex justify-between p-2.5 hover:bg-slate-50 rounded-xl">
              <span className="text-slate-500">حقوق پایه وزارت کار و حق تخصص:</span>
              <span className="font-extrabold text-slate-800">{toPersianDigits(formatCurrency(baseSal))}</span>
            </div>

            <div className="flex justify-between p-2.5 hover:bg-slate-50 rounded-xl">
              <span className="text-slate-500">مزایا (حق مسکن، خواروبار و عائله‌مندی):</span>
              <span className="font-extrabold text-slate-800">{toPersianDigits(formatCurrency(benefits))}</span>
            </div>

            <div className="flex justify-between p-2.5 hover:bg-slate-50 rounded-xl">
              <span className="text-slate-500 text-teal-600">پورسانت مشارکت تجاری (تاییدشده):</span>
              <span className="font-extrabold text-teal-600">{toPersianDigits(formatCurrency(comm))}</span>
            </div>

            <div className="flex justify-between p-2.5 hover:bg-slate-50 rounded-xl">
              <span className="text-slate-500 text-blue-600">پاداش مدیرعامل بابت نوآوری و وظایف:</span>
              <span className="font-extrabold text-blue-600">{toPersianDigits(formatCurrency(bonus))}</span>
            </div>

            <div className="flex justify-between p-2.5 hover:bg-slate-50 rounded-xl border-b border-slate-100 pb-4">
              <span className="text-slate-500 text-rose-550">مجموع کسورات (بیمه، مالیات و دیرکرد):</span>
              <span className="font-extrabold text-rose-500">-{toPersianDigits(formatCurrency(deductions))}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-brand-light rounded-2xl border border-brand-cyan/20 mt-4">
              <span className="font-black text-brand-navy text-sm">مجموع خالص دریافتی ماهانه:</span>
              <span className="text-base font-black text-emerald-600">{toPersianDigits(formatCurrency(netEarnings))}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-6 text-center leading-relaxed">
            این فیش حقوقی فاقد وجاهت فیزیکی بوده و تحت تایید الکترونیک دپارتمان مالی خانم قربی صادر شده است.
          </p>
        </div>
      )}

      {/* TAB 5: Suggestions box - "صندوق پیشنهادات من" */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Submit Suggestion for employee view */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>ارائه ایده و بهبود فرآیند سازمانی</span>
              </h3>
              
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">دسته‌بندی ایده</label>
                  <select
                    value={sugType}
                    onChange={(e: any) => setSugType(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  >
                    <option value="idea">ایده فناورانه نوین</option>
                    <option value="process_improvement">بهبود فرآیندهای اداری کارخانه</option>
                    <option value="saving">کاهش هزینه‌های غیرضروری</option>
                    <option value="commercial">فرصت جدید تجاری سودآور</option>
                    <option value="other">غیره (سایر ایده‌ها و پیشنهادات)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">عنوان پیشنهاد</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: دیجیتالی کردن قبوض انبار"
                    value={sugTitle}
                    onChange={(e) => setSugTitle(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">شرح سناریو و جزئیات طرح</label>
                  <textarea
                    required
                    placeholder="طرح خود را به طور کامل تشریح کنید. ایده‌های پذیرفته شده دارای پاداش نقدی بالا خواهند بود."
                    value={sugContent}
                    onChange={(e) => setSugContent(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-24"
                  />
                </div>
              </div>
            </div>

            {showSugSuccess && (
              <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                ایده نوآورانه شما با موفقیت ثبت شد و به صندوق ایده‌های مدیرعامل منتقل گردید.
              </div>
            )}

            <button
              onClick={() => {
                if (!sugTitle || !sugContent) return;
                onAddSuggestion(sugType, sugTitle, sugContent);
                setShowSugSuccess(true);
                setSugTitle('');
                setSugContent('');
                setTimeout(() => setShowSugSuccess(false), 4500);
              }}
              className="mt-4 bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
            >
              ارسال مستقیم طرح به صندوق ایده‌ها
            </button>
          </div>

          {/* Personnel ideas directory list */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4">
              سبد ایده‌ها و نوآوری‌های ثبت شده شما
            </h3>

            {personalSuggestions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">تاکنون پیشنهادی ثبت نکرده‌اید. با اولین ایده خلاقانه شروع کنید!</div>
            ) : (
              <div className="space-y-4">
                {personalSuggestions.map((sug) => (
                  <div key={sug.id} className="bg-slate-50/60 p-4 border border-slate-100 rounded-2xl relative">
                    <span className={`absolute top-4 left-4 text-[9px] px-2 py-0.5 rounded font-bold ${
                      sug.status==='approved' ? 'bg-green-50 text-green-600' : sug.status==='rejected' ? 'bg-red-50 text-red-650' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {sug.status==='approved' ? 'تایید و پذیرش شده' : sug.status==='rejected' ? 'رد شده' : 'در انتظار ارزیابی'}
                    </span>

                    <div className="flex items-center space-x-reverse space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600">
                        {sug.type === 'saving' ? 'کاهش هزینه' : sug.type === 'idea' ? 'طرح فناورانه' : sug.type === 'commercial' ? 'فرصت تجاری' : sug.type === 'other' ? 'غیره' : 'بهبود اداری'}
                      </span>
                      <span className="text-[10px] text-slate-400">{sug.createdAt}</span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 mt-2.5">{sug.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sug.content}</p>

                    {sug.bonusReward > 0 && (
                      <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-xl flex justify-between items-center border border-emerald-100">
                        <span>مبلغ پاداش تخصیص یافته همراه با حقوق:</span>
                        <span className="font-extrabold text-xs text-emerald-600">{toPersianDigits(formatCurrency(sug.bonusReward))}</span>
                      </div>
                    )}

                    {sug.reviewComment && (
                      <div className="mt-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-[11px] text-slate-600">
                        <span className="font-bold text-slate-800 block">پاسخ مدیرعامل:</span>
                        <p className="mt-1">{sug.reviewComment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 6: Private PM Box to Manager - "ارتباط مستقیم با مدیر" */}
      {activeTab === 'pms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-brand-cyan" />
                <span>صندوق مکاتبات مستقیم با مدیرعامل</span>
              </h3>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-extrabold text-slate-800">ارسال به صورت کاملاً محرمانه</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">سایر پرسنل یا دپارتمان‌ها پیام را دریافت نخواهند کرد</span>
                  </div>
                  <button
                    onClick={() => setIsConfidential(!isConfidential)}
                    className="focus:outline-none cursor-pointer"
                    type="button"
                  >
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold block ${
                      isConfidential ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isConfidential ? 'پیام محرمانه فعال' : 'پیام عادی'}
                    </span>
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">متن پیام یا گزارش محرمانه</label>
                  <textarea
                    required
                    placeholder="پرسش، پیشنهاد، گزارش محرمانه یا درخواست خود را صریحاً مکتوب کنید..."
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-24"
                  />
                </div>
              </div>
            </div>

            {showMsgSuccess && (
              <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                گزارش شما با اولویت بالا به کارتابل شخصی مدیرعامل ارسال گردید.
              </div>
            )}

            <button
              onClick={() => {
                if (!msgBody) return;
                onSendMessage(msgBody, isConfidential);
                setShowMsgSuccess(true);
                setMsgBody('');
                setTimeout(() => setShowMsgSuccess(false), 4500);
              }}
              className="mt-4 bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
            >
              ارسال پیام به مدیر سیستم
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4">
              تاریخچه پیام‌های ارسالی با مدیریت و پاسخ‌ها
            </h3>

            {/* Displaying Replies to Today's Prayer (پاسخ مدیر به دعا) */}
            {dailyPrayers.filter(p => p.userName === currentUser.name && p.adminReply).length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-xs font-black text-purple-700 flex items-center gap-1.5 pb-2 border-b border-purple-100">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>پاسخ مدیر به دعا</span>
                </h4>
                {dailyPrayers.filter(p => p.userName === currentUser.name && p.adminReply).map(p => (
                  <div key={p.id} className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-200 shadow-sm relative">
                    <span className="absolute top-3.5 left-4 text-[10px] text-purple-400 font-bold">{p.repliedAt || p.createdAt}</span>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                      <span className="text-xs font-black text-purple-900">پاسخ مدیر به دعا</span>
                    </div>
                    <div className="text-xs text-slate-600 mb-2 bg-white/70 p-2 rounded-lg border border-purple-100 italic">
                      دعای ارسالی شما: « {p.text} »
                    </div>
                    <p className="text-xs text-purple-950 font-bold leading-relaxed pr-2">
                      {p.adminReply}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {allMessages.filter(m => m.senderId === currentUser.id).length === 0 && dailyPrayers.filter(p => p.userName === currentUser.name && p.adminReply).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">مکاتبه‌ای یافت نشد. اولین پیام را ارسال کنید.</div>
            ) : (
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {allMessages.filter(m => m.senderId === currentUser.id).map((m) => (
                  <div key={m.id} className="bg-slate-50/40 p-3.5 rounded-2xl border border-slate-100 relative">
                    <span className="absolute top-3.5 left-4 text-[10px] text-slate-400">{m.createdAt}</span>
                    <div className="flex items-center space-x-reverse space-x-1.5 mb-2">
                      <span className={`w-2 h-2 rounded-full ${m.isConfidential ? 'bg-rose-500' : 'bg-brand-cyan'}`} />
                      <span className="text-[10px] font-black text-slate-800">
                        {m.isConfidential ? 'گزارش فوق محرمانه' : 'مکاتبه اداری'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed pr-3">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 7: Company Documents Drawer / Vault - "اسناد و امانات" */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            {/* Box 1: Upload Document */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit">
              <div>
                <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-brand-cyan" />
                  <span>بارگذاری و ثبت سند جدید در بایگانی هلدینگ</span>
                </h3>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">عنوان کامل سند / مدرک</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: پایان کار پروژه، سند تفکیکی دفتر مرکزی، اساسنامه جدید..."
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">دسته بندی سند</label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-700"
                    >
                      <option value="سند مالی">سند مالی و گواهی پرداخت</option>
                      <option value="سند هویتی">سند هویتی و ثبت شرکت</option>
                      <option value="قرارداد رسمی">قرارداد رسمی فیمابین</option>
                      <option value="اسناد ترخیص کالا">اسناد ترخیص گمرک و کالا</option>
                      <option value="سایر اسناد">سایر اسناد و مکاتبات اداری</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">شرح جزییات و مشخصات تفصیلی سند</label>
                    <textarea
                      required
                      placeholder="شماره پلاک ثبتی، مشخصات طرفین، شماره حساب یا تعهدات درج شده..."
                      value={docDetails}
                      onChange={(e) => setDocDetails(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-20"
                    />
                  </div>
                </div>
              </div>

              {showDocSuccess && (
                <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  سند با موفقیت در فاز اول (منتظر تایید مدیر داخلی) ثبت گردید.
                </div>
              )}

              <button
                onClick={() => {
                  if (!docTitle || !docDetails) return;
                  const newDoc: CompanyDocument = {
                    id: 'doc_' + Math.random().toString(36).substring(2, 9),
                    title: docTitle,
                    description: docDetails,
                    uploadedByUserId: currentUser.id,
                    uploadedByUserName: currentUser.name,
                    fileName: `${docCategory}_${docTitle.replace(/\s+/g, '_')}.pdf`,
                    createdAt: '۱۴۰۵/۰۴/۰۳',
                    status: 'pending_internal',
                    isEscrow: false
                  };
                  onAddCompanyDocument(newDoc);
                  setShowDocSuccess(true);
                  setDocTitle('');
                  setDocDetails('');
                  setTimeout(() => setShowDocSuccess(false), 4500);
                }}
                className="mt-4 bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
              >
                ثبت و ارسال سند به کارتابل مراجع
              </button>
            </div>

            {/* Box 2: Escrow Request Form (امانت اسناد و اوراق) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit text-right space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-5 h-5 text-brand-cyan animate-pulse" />
                  <span>امانت اسناد و اوراق</span>
                </h3>

                <div className="mt-4 space-y-3.5">
                  <div className="p-2.5 bg-slate-50 text-slate-600 border border-slate-150 rounded-xl text-[10px] leading-relaxed">
                    درخواست امانت اسناد و اوراق. پس از عودت، پرسنل تیک عودت را زده و توسط مدیر داخلی تایید و نهایی می‌شود.
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">انتخاب سند</label>
                    <select
                      value={selectedDocIdForEscrow}
                      onChange={(e) => setSelectedDocIdForEscrow(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-700 font-bold"
                    >
                      <option value="">-- سند مورد نظر را انتخاب کنید --</option>
                      {companyDocuments.filter(d => !d.isEscrow).map(d => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">فرد امانت گیرنده</label>
                    <input
                      type="text"
                      placeholder="نام و نام خانوادگی امانت‌گیرنده..."
                      value={escrowBorrowerInput}
                      onChange={(e) => setEscrowBorrowerInput(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">میزان اهمیت</label>
                    <select
                      value={escrowImportanceInput}
                      onChange={(e) => setEscrowImportanceInput(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none text-slate-700 font-bold"
                    >
                      <option value="حیاتی و فوری">حیاتی و فوری</option>
                      <option value="مهم">مهم</option>
                      <option value="عادی">عادی</option>
                      <option value="کم‌اهمیت">کم‌اهمیت</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">تاریخ عودت امانت</label>
                    <input
                      type="text"
                      required
                      placeholder="۱۴۰۵/۰۴/۱۰"
                      value={escrowReturnDateInput}
                      onChange={(e) => setEscrowReturnDateInput(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!selectedDocIdForEscrow || !onEscrowLend || !escrowBorrowerInput.trim()) return;
                  onEscrowLend(selectedDocIdForEscrow, escrowBorrowerInput.trim(), escrowReturnDateInput, 'pending_approval', escrowImportanceInput);
                  setSelectedDocIdForEscrow('');
                }}
                disabled={!selectedDocIdForEscrow || !escrowBorrowerInput.trim()}
                className={`w-full bg-brand-navy hover:bg-slate-850 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md text-center cursor-pointer ${
                  !selectedDocIdForEscrow || !escrowBorrowerInput.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                ثبت درخواست امانت اسناد و اوراق
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4 flex justify-between items-center">
                <span>پوشه بایگانی و کارتابل اسناد و امانات پرسنل</span>
                <span className="text-[10px] text-slate-400">تایید و بازگشت امانات توسط مدیر داخلی</span>
              </h3>

              {companyDocuments.filter(d => d.uploadedByUserId === currentUser.id || d.status === 'approved' || d.isEscrow).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">هیچ سندی یافت نشد.</div>
              ) : (
                <div className="overflow-x-auto text-xs text-right">
                  <table className="w-full">
                    <thead className="bg-slate-50 font-extrabold text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="p-2.5">عنوان / ثبت‌کننده</th>
                        <th className="p-2.5">شناسه مجازی فایل</th>
                        <th className="p-2.5">مرحله تایید اداری</th>
                        <th className="p-2.5">وضعیت امانت (امانت‌دهی)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companyDocuments.filter(d => d.uploadedByUserId === currentUser.id || d.status === 'approved' || d.isEscrow).map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/40">
                          <td className="p-2.5 font-bold text-slate-800">
                            <span>{doc.title}</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">ثبت توسط: {doc.uploadedByUserName}</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-500 text-[10px]">{doc.fileName}</td>
                          <td className="p-2.5">
                            {doc.status === 'pending_internal' && (
                              <div className="flex flex-col gap-1">
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black w-fit">گام ۱: تایید مدیر داخلی</span>
                              </div>
                            )}
                            {doc.status === 'pending_admin' && (
                              <div className="flex flex-col gap-1">
                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black w-fit">گام ۲: تایید موسوی-وظیفه</span>
                              </div>
                            )}
                            {doc.status === 'approved' && (
                              <div className="flex flex-col gap-1">
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black w-fit">بایگانی شده رسمی (مصوب)</span>
                              </div>
                            )}
                            {doc.status === 'rejected' && (
                              <div className="flex flex-col gap-1">
                                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-black w-fit">مردود شده اداری</span>
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            {doc.isEscrow ? (
                              doc.escrowStatus === 'pending_approval' ? (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded block text-center">
                                    در انتظار تایید امانت (مدیر داخلی)
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">متقاضی: {doc.escrowBorrower}</span>
                                  {doc.escrowImportance && <span className="text-[9px] text-indigo-600 block">اهمیت: {doc.escrowImportance}</span>}
                                  <span className="text-[9px] text-slate-400 block">موعد عودت: {doc.escrowReturnDate}</span>
                                  {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                    <div className="flex gap-1 mt-1">
                                      <button
                                        onClick={() => onEscrowLend && onEscrowLend(doc.id, doc.escrowBorrower || currentUser.name, doc.escrowReturnDate || '', 'borrowed', doc.escrowImportance || 'عادی')}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1 rounded cursor-pointer"
                                      >
                                        تایید امانت
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : doc.escrowStatus === 'pending_return' ? (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded block text-center">
                                    اعلام عودت توسط پرسنل (منتظر تایید مدیر داخلی)
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">امانت‌گیرنده: {doc.escrowBorrower}</span>
                                  {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                    <button
                                      onClick={() => onEscrowReturn && onEscrowReturn(doc.id)}
                                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1.5 rounded mt-1 transition-colors cursor-pointer shadow-sm"
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
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded block text-center">
                                    به امانت رفته (تایید شده)
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">امانت‌گیرنده: {doc.escrowBorrower}</span>
                                  {doc.escrowImportance && <span className="text-[9px] text-indigo-600 block">اهمیت: {doc.escrowImportance}</span>}
                                  <span className="text-[9px] text-slate-400 block">موعد عودت: {doc.escrowReturnDate}</span>
                                  <button
                                    onClick={() => onEscrowReturnRequest && onEscrowReturnRequest(doc.id)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold py-1.5 rounded mt-1 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>تیک عودت امانت</span>
                                  </button>
                                  {(currentUser.isOfficeManager || currentUser.isAdmin) && (
                                    <button
                                      onClick={() => onEscrowReturn && onEscrowReturn(doc.id)}
                                      className="w-full bg-slate-150 hover:bg-slate-200 text-slate-700 text-[8px] font-bold py-1 rounded mt-1 transition-colors cursor-pointer"
                                    >
                                      تایید مستقیم بازگشت امانت (مدیر داخلی)
                                    </button>
                                  )}
                                </div>
                              )
                            ) : doc.status === 'approved' ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold block text-center text-[10px]">
                                آماده امانت‌دهی
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

      {/* TAB 8: Daily performance report submission - "گزارش روزانه کار" */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Clipboard className="w-5 h-5 text-brand-cyan" />
                <span>ثبت گزارش عملکرد روزانه جدید</span>
              </h3>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">میزان کارکرد روز (ساعت)</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={reportHours}
                    onChange={(e) => setReportHours(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">شرح کامل فعالیت‌ها و دستاوردهای امروز</label>
                  <textarea
                    required
                    placeholder="کارهای تکمیل شده، موانع کاری، هماهنگی‌های بازاریابی و امور محوله را دقیقاً بنویسید..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-44"
                  />
                </div>
              </div>
            </div>

            {showReportSuccess && (
              <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                گزارش روزانه شما ثبت شد و جهت ارزیابی در اختیار مدیر داخلی قرار گرفت.
              </div>
            )}

            <button
              onClick={() => {
                if (!reportDetails) return;
                const newReport: DailyPerformanceReport = {
                  id: 'rep_' + Math.random().toString(36).substring(2, 9),
                  userId: currentUser.id,
                  userName: currentUser.name,
                  date: '۱۴۰۵/۰۴/۰۳',
                  content: `[کارکرد: ${reportHours} ساعت] - ${reportDetails}`,
                  createdAt: '۱۴۰۵/۰۴/۰۳'
                };
                onAddDailyReport(newReport);
                setShowReportSuccess(true);
                setReportDetails('');
                setTimeout(() => setShowReportSuccess(false), 4500);
              }}
              className="mt-4 bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer text-center"
            >
              ثبت و ثبت نهایی گزارش عملکرد روزانه
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100 mb-4">
              تاریخچه گزارش‌های روزانه ارسالی شما
            </h3>

            {dailyReports.filter(r => r.userId === currentUser.id).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">گزارش روزانه‌ای برای شما یافت نشد. اولین گزارش را به صورت مکتوب ثبت کنید.</div>
            ) : (
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {dailyReports.filter(r => r.userId === currentUser.id).map((rep) => (
                  <div key={rep.id} className="bg-slate-50/40 p-4 rounded-2xl border border-slate-100 relative">
                    <span className="absolute top-4 left-4 text-[10px] text-brand-navy bg-brand-cyan/20 px-2 py-0.5 rounded font-black">{rep.date}</span>
                    <div className="flex items-center space-x-reverse space-x-1.5 mb-2">
                      <Clipboard className="w-4 h-4 text-brand-cyan" />
                      <span className="text-[10px] font-black text-slate-800">گزارش کار رسمی ثبت شده</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pr-3 whitespace-pre-wrap">{rep.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
