/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Task, WorkflowInstance, BankingRecord, CommercialRecord, Suggestion, BusinessRule, TaskTransferRequest, SystemAlert, PerformanceEvaluation, AttendanceRecord, Message,
  LeaveRequest, MissionRequest, EmergencyHoliday, CompanyDocument, DailyPerformanceReport, DailyPrayer
} from './types';
import { 
  INITIAL_USERS, INITIAL_TASKS, INITIAL_WORKFLOWS, INITIAL_BANK_RECORDS, INITIAL_COMMERCIALS, INITIAL_SUGGESTIONS, INITIAL_RULES, INITIAL_EVALUATIONS, TEMPORARY_ATTENDANCE
} from './data';
import { toPersianDigits, getPersianTodayString } from './utils';
import Header from './components/Header';
import PersonnelDashboard from './components/PersonnelDashboard';
import AdminDashboard from './components/AdminDashboard';
import TaskModule from './components/TaskModule';
import EvaluationAndReportCard from './components/EvaluationAndReportCard';
import { 
  LayoutDashboard, ClipboardList, Briefcase, Landmark, Shield, Award, AlertCircle, Sparkles, LogOut, CheckSquare, Settings, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  
  // 1. STATE ORCHESTRATORS - Load from localStorage if available, or fall back to seed data
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ks_users');
    const parsed = saved ? JSON.parse(saved) : INITIAL_USERS;
    return parsed.map((u: any) => {
      const isCeo = u.id === 'reza' || u.name === 'رضا وظیفه' || (u.isAdmin && u.id === 'reza');
      return {
        ...u,
        name: isCeo ? 'موسوی-وظیفه' : u.name,
        position: isCeo ? 'مدیرعامل و مدیر سیستم' : u.position,
        password: u.password || '1234'
      };
    });
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('ks_current_user');
    const parsed = saved ? JSON.parse(saved) : INITIAL_USERS[0];
    const isCeo = parsed.id === 'reza' || parsed.name === 'رضا وظیفه' || (parsed.isAdmin && parsed.id === 'reza');
    return {
      ...parsed,
      name: isCeo ? 'موسوی-وظیفه' : parsed.name,
      position: isCeo ? 'مدیرعامل و مدیر سیستم' : parsed.position,
      password: parsed.password || '1234'
    };
  });

  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ks_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [workflows, setWorkflows] = useState<WorkflowInstance[]>(() => {
    const saved = localStorage.getItem('ks_workflows');
    return saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
  });

  const [bankRecords, setBankRecords] = useState<BankingRecord[]>(() => {
    const saved = localStorage.getItem('ks_bank');
    return saved ? JSON.parse(saved) : INITIAL_BANK_RECORDS;
  });

  const [commercials, setCommercials] = useState<CommercialRecord[]>(() => {
    const saved = localStorage.getItem('ks_commercials');
    return saved ? JSON.parse(saved) : INITIAL_COMMERCIALS;
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => {
    const saved = localStorage.getItem('ks_suggestions');
    return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
  });

  const [businessRules, setBusinessRules] = useState<BusinessRule[]>(() => {
    const saved = localStorage.getItem('ks_rules');
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [transferRequests, setTransferRequests] = useState<TaskTransferRequest[]>(() => {
    const saved = localStorage.getItem('ks_transfers');
    return saved ? JSON.parse(saved) : [];
  });

  const [evaluations, setEvaluations] = useState<Record<string, PerformanceEvaluation>>(() => {
    const saved = localStorage.getItem('ks_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ks_attendance');
    return saved ? JSON.parse(saved) : TEMPORARY_ATTENDANCE;
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem('ks_alerts');
    return saved ? JSON.parse(saved) : [
      { id: 'al_1', userId: 'reza', title: 'درخواست تایید مالی', message: 'خانم عطایی فاکتور اضطراری خرید ملزومات اداری را ارسال کرد.', createdAt: '۱۰:۳۵', isRead: false },
      { id: 'al_2', userId: 'ataei', title: 'ثبت ورود پرسنل', message: 'آقای موسوی با ۷۵ دقیقه تاخیر ورود خود را ثبت کرد.', createdAt: '۰۹:۱۵', isRead: false }
    ];
  });

  const [isDelegatedToOfficeManager, setIsDelegatedToOfficeManager] = useState<boolean>(() => {
    const saved = localStorage.getItem('ks_delegated');
    return saved ? JSON.parse(saved) : false;
  });

  // NEW MODULES STATES WITH DURABLE OFFLINE PERSISTENCE
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('ks_leave_reqs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'lv_1',
        userId: 'ghorbi',
        userName: 'خانم قربی',
        type: 'daily',
        startDate: '۱۴۰۵/۰۴/۰۴',
        endDate: '۱۴۰۵/۰۴/۰۵',
        reason: 'انجام امور درمانی فرزند',
        status: 'approved',
        createdAt: '۱۴۰۵/۰۴/۰۳',
        sentToPayroll: true
      },
      {
        id: 'lv_2',
        userId: 'mousavi',
        userName: 'آقای موسوی',
        type: 'hourly',
        startDate: '۱۴۰۵/۰۴/۰۳',
        startTime: '۱۰:۰۰',
        endTime: '۱۲:۰۰',
        reason: 'مراجعه به بانک سپه شعبه مرکزی',
        status: 'pending',
        createdAt: '۱۴۰۵/۰۴/۰۳',
        sentToPayroll: false
      }
    ];
  });

  const [missionRequests, setMissionRequests] = useState<MissionRequest[]>(() => {
    const saved = localStorage.getItem('ks_mission_reqs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ms_1',
        userId: 'mousavi',
        userName: 'آقای موسوی',
        type: 'daily',
        date: '۱۴۰۵/۰۴/۰۵',
        location: 'امور مالیاتی شمال تهران',
        reason: 'رسیدگی به پرونده معوقه هلدینگ کاویان سپنتا',
        status: 'approved',
        createdAt: '۱۴۰۵/۰۴/۰۲',
        sentToPayroll: true
      },
      {
        id: 'ms_2',
        userId: 'ataei',
        userName: 'خانم عطایی',
        type: 'hourly',
        date: '۱۴۰۵/۰۴/۰۳',
        startTime: '۱۴:۰۰',
        endTime: '۱۶:۰۰',
        location: 'دفتر مرکزی بانک تجارت',
        reason: 'دریافت ضمانت‌نامه بانکی خرید مواد اولیه',
        status: 'pending',
        createdAt: '۱۴۰۵/۰۴/۰۳',
        sentToPayroll: false
      }
    ];
  });

  const [emergencyHolidays, setEmergencyHolidays] = useState<EmergencyHoliday[]>(() => {
    const saved = localStorage.getItem('ks_holidays');
    return saved ? JSON.parse(saved) : [];
  });

  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>(() => {
    const saved = localStorage.getItem('ks_documents');
    return saved ? JSON.parse(saved) : [
      {
        id: 'doc_1',
        title: 'اسناد شرکت و آگهی تغییرات',
        description: 'آخرین روزنامه رسمی و اساسنامه هلدینگ کاویان سپنتا جهت خرید آهن‌آلات',
        uploadedByUserId: 'ataei',
        uploadedByUserName: 'خانم عطایی',
        fileName: 'Kavian_Sepanta_Statutes_1404.pdf',
        createdAt: '۱۴۰۵/۰۴/۰۲',
        status: 'approved',
        internalApproverId: 'ataei',
        adminApproverId: 'reza',
        isEscrow: true,
        escrowStatus: 'returned',
        escrowBorrower: 'آقای موسوی',
        escrowReturnDate: '۱۴۰۵/۰۴/۰۲',
        escrowActualReturnDate: '۱۴۰۵/۰۴/۰۲'
      }
    ];
  });

  const [dailyReports, setDailyReports] = useState<DailyPerformanceReport[]>(() => {
    const saved = localStorage.getItem('ks_daily_reports');
    return saved ? JSON.parse(saved) : [
      {
        id: 'dr_1',
        userId: 'ghorbi',
        userName: 'خانم قربی',
        date: '۱۴۰۵/۰۴/۰۲',
        content: '۱- ورود اطلاعات کارتهای ورود و خروج خردادماه پرسنل هلدینگ\n۲- پیگیری امور بیمه تکمیلی همکاران سپنتا\n۳- تنظیم لیست نهایی کسر از حقوق غائبین و ارسال گزارش به خانم عطایی',
        createdAt: '۱۴۰۵/۰۴/۰۲'
      }
    ];
  });

  const [dailyPrayers, setDailyPrayers] = useState<DailyPrayer[]>(() => {
    const saved = localStorage.getItem('ks_prayers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pr_1',
        userName: 'خانم عطایی',
        text: 'خداوندا، امروز را روزیِ پربرکت، آرامش روحی و توفیق خدمت صادقانه برای تمامی همکاران هلدینگ کاویان سپنتا مقدر فرما.',
        createdAt: '۱۴۰۵/۰۴/۰۳'
      }
    ];
  });

  // Sidebar navigation panel selection state
  const [activeMenu, setActiveMenu] = useState<'personnel' | 'tasks' | 'evaluations' | 'admin' | 'prayers'>(
    currentUser.isAdmin ? 'admin' : 'personnel'
  );
  const [appPrayerFilter, setAppPrayerFilter] = useState<string>('all');

  // Sync to localStorage automatically whenever states change
  useEffect(() => {
    localStorage.setItem('ks_users', JSON.stringify(allUsers));
    localStorage.setItem('ks_current_user', JSON.stringify(currentUser));
    localStorage.setItem('ks_tasks', JSON.stringify(allTasks));
    localStorage.setItem('ks_workflows', JSON.stringify(workflows));
    localStorage.setItem('ks_bank', JSON.stringify(bankRecords));
    localStorage.setItem('ks_commercials', JSON.stringify(commercials));
    localStorage.setItem('ks_suggestions', JSON.stringify(suggestions));
    localStorage.setItem('ks_rules', JSON.stringify(businessRules));
    localStorage.setItem('ks_transfers', JSON.stringify(transferRequests));
    localStorage.setItem('ks_evaluations', JSON.stringify(evaluations));
    localStorage.setItem('ks_attendance', JSON.stringify(attendanceRecords));
    localStorage.setItem('ks_alerts', JSON.stringify(alerts));
    localStorage.setItem('ks_delegated', JSON.stringify(isDelegatedToOfficeManager));
    localStorage.setItem('ks_leave_reqs', JSON.stringify(leaveRequests));
    localStorage.setItem('ks_mission_reqs', JSON.stringify(missionRequests));
    localStorage.setItem('ks_holidays', JSON.stringify(emergencyHolidays));
    localStorage.setItem('ks_documents', JSON.stringify(companyDocuments));
    localStorage.setItem('ks_daily_reports', JSON.stringify(dailyReports));
    localStorage.setItem('ks_prayers', JSON.stringify(dailyPrayers));
  }, [
    allUsers, currentUser, allTasks, workflows, bankRecords, commercials, suggestions, businessRules, transferRequests, evaluations, attendanceRecords, alerts, isDelegatedToOfficeManager,
    leaveRequests, missionRequests, emergencyHolidays, companyDocuments, dailyReports, dailyPrayers
  ]);

  // CEO delegation authority check
  const isAdminOrDelegator = currentUser.isAdmin || (isDelegatedToOfficeManager && currentUser.isOfficeManager);

  // System notification appending wrapper
  const pushAlert = (title: string, message: string, userId: string = 'reza') => {
    const newAlert: SystemAlert = {
      id: 'alert_' + Math.random().toString(36).substring(2, 9),
      userId,
      title,
      message,
      createdAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // 2. ACTION HANDLERS

  // Update specific User data (used for activating/suspending prsonal directories)
  const handleUpdateUser = (userId: string, updated: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
    
    // If updating current user's profile, synchronize current user state
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updated }));
    }
    
    pushAlert('بروزرسانی پرونده', `مشخصات اداری کاربر با شناسه ${userId} بازبینی گردید.`);
  };

  // Add a newly defined user profile
  const handleAddUser = (newUser: User) => {
    setAllUsers(prev => [...prev, newUser]);
    pushAlert('عضو جدید ستاد', `پرونده پرسنلی الکترونیک برای ${newUser.name} صادر و ثبت شد.`);
  };

  // Completely delete a user
  const handleDeleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    pushAlert('حذف پرسنل', `پرونده پرسنلی همکار با کد ${userId} به باجه ابطال اسناد فرستاده شد.`);
  };

  // Master backup and demo data restore actions
  const handleRestoreDemoScenario = () => {
    localStorage.clear();
    setAllUsers(INITIAL_USERS.map(u => ({ ...u, password: '1234' })));
    setCurrentUser({ ...INITIAL_USERS[0], password: '1234' });
    setAllTasks(INITIAL_TASKS);
    setWorkflows(INITIAL_WORKFLOWS);
    setBankRecords(INITIAL_BANK_RECORDS);
    setCommercials(INITIAL_COMMERCIALS);
    setSuggestions(INITIAL_SUGGESTIONS);
    setBusinessRules(INITIAL_RULES);
    setTransferRequests([]);
    setEvaluations(INITIAL_EVALUATIONS);
    setAttendanceRecords(TEMPORARY_ATTENDANCE);
    setAlerts([
      { id: 'al_1', userId: 'reza', title: 'درخواست تایید مالی', message: 'خانم عطایی فاکتور اضطراری خرید ملزومات اداری را ارسال کرد.', createdAt: '۱۰:۳۵', isRead: false },
      { id: 'al_2', userId: 'ataei', title: 'ثبت ورود پرسنل', message: 'آقای موسوی با ۷۵ دقیقه تاخیر ورود خود را ثبت کرد.', createdAt: '۰۹:۱۵', isRead: false }
    ]);
    setIsDelegatedToOfficeManager(false);
    pushAlert('بازنشانی شرکت نمونه', 'حساب‌ها، فاکتورها، انبار و عملکرد پرسنل به حالت پیش‌فرض پروژه دمو بازنشانی شدند.');
  };

  const handleWipeAndResetRaw = (mode: 'only_ceo' | 'keep_personnel_clean') => {
    localStorage.clear();
    const rawCeo: User = {
      id: 'reza',
      name: 'موسوی-وظیفه',
      position: 'مدیرعامل و مدیر سیستم',
      employeeCode: 'KS-101',
      avatar: 'RV',
      department: 'مدیریت ارشد',
      hireDate: '۱۴۰۵/۰۱/۰۱',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      isWorking: true,
      financialInfo: {
        baseSalary: 45000000,
        benefits: 15000000,
        bonus: 0,
        commission: 0,
        deductions: 0
      },
      currentScore: 100,
      avgScore: 100,
      isAdmin: true,
      isOfficeManager: false,
      password: '1234'
    };

    if (mode === 'only_ceo') {
      setAllUsers([rawCeo]);
      setCurrentUser(rawCeo);
    } else {
      setAllUsers(INITIAL_USERS.map(u => ({
        ...u,
        currentScore: 100,
        avgScore: 100,
        password: '1234',
        financialInfo: { ...u.financialInfo, bonus: 0, commission: 0, deductions: 0 }
      })));
      setCurrentUser(rawCeo);
    }

    setAllTasks([]);
    setWorkflows([]);
    setBankRecords([]);
    setCommercials([]);
    setSuggestions([]);
    setBusinessRules(INITIAL_RULES.map(r => ({ ...r, isActive: true })));
    setTransferRequests([]);
    setEvaluations({});
    setAttendanceRecords([]);
    setAlerts([]);
    setIsDelegatedToOfficeManager(false);
    pushAlert('راه‌اندازی خام ستاد', 'پایگاه‌های اطلاعاتی تراکنش‌ها، وظایف، پورسانت‌ها و سیستم ثبت تردد با موفقیت صفر شدند.');
  };

  const handleImportFullBackup = (backup: any) => {
    try {
      if (backup.users) setAllUsers(JSON.parse(backup.users));
      if (backup.current_user) setCurrentUser(JSON.parse(backup.current_user));
      if (backup.tasks) setAllTasks(JSON.parse(backup.tasks));
      if (backup.workflows) setWorkflows(JSON.parse(backup.workflows));
      if (backup.bank) setBankRecords(JSON.parse(backup.bank));
      if (backup.commercials) setCommercials(JSON.parse(backup.commercials));
      if (backup.suggestions) setSuggestions(JSON.parse(backup.suggestions));
      if (backup.rules) setBusinessRules(JSON.parse(backup.rules));
      if (backup.transfers) setTransferRequests(JSON.parse(backup.transfers));
      if (backup.evaluations) setEvaluations(JSON.parse(backup.evaluations));
      if (backup.attendance) setAttendanceRecords(JSON.parse(backup.attendance));
      if (backup.alerts) setAlerts(JSON.parse(backup.alerts));
      if (backup.delegated) setIsDelegatedToOfficeManager(JSON.parse(backup.delegated));
      pushAlert('پایان بازیابی پرونده‌ها', 'کلیه اطلاعات سیستم از روی فایل بازیابی بارگذاری شد.');
    } catch (e) {
      alert('قالب فایل پشتیبان اشتباه است!');
    }
  };

  // Attendance Clock card actions: register arrival punch
  const handlePunchIn = (lat?: number, lng?: number, manualDesc?: string, customTime?: string, locationName?: string, isLocationDiscrepancy?: boolean) => {
    const today = '۱۴۰۵/۰۴/۰۳';
    
    // Check if already punched today
    const exists = attendanceRecords.find(r => r.userId === currentUser.id && r.date === today);
    if (exists) return;

    const checkInTime = customTime || '۰۸:۳۵';
    
    let delayMinutes = 0;
    let earlyArrivalMinutes = 0;
    try {
      const parts = checkInTime.split(':');
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      const totalMinutes = hour * 60 + minute;
      const expectedMinutes = 8 * 60; // Expected start is 08:00 AM
      if (totalMinutes > expectedMinutes) {
        delayMinutes = totalMinutes - expectedMinutes;
      } else if (totalMinutes < expectedMinutes) {
        earlyArrivalMinutes = expectedMinutes - totalMinutes;
      }
    } catch (e) {
      delayMinutes = 0;
    }

    // Determine score deduction for lateness
    let scoreDeducted = 0;
    if (delayMinutes > 15 && delayMinutes <= 45) {
      scoreDeducted = 1;
    } else if (delayMinutes > 45 && delayMinutes <= 60) {
      scoreDeducted = 2;
    } else if (delayMinutes > 60) {
      scoreDeducted = 5;
    }

    // Determine score addition for early arrival
    let scoreAdded = 0;
    if (earlyArrivalMinutes >= 30 && earlyArrivalMinutes <= 60) {
      scoreAdded = 1;
    } else if (earlyArrivalMinutes > 60) {
      scoreAdded = 3;
    }

    const calculatedScore = Math.min(100, Math.max(0, currentUser.currentScore + scoreAdded - scoreDeducted));

    const newRecord: AttendanceRecord = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      date: today,
      dayOfWeek: 'یکشنبه',
      checkIn: checkInTime,
      checkOut: null,
      status: scoreDeducted > 0 ? 'late' : 'present',
      delayMinutes,
      earlyDepartureMinutes: 0,
      leaveType: null,
      overtimeMinutes: 0,
      scoreDeducted,
      calculatedScore,
      latitude: lat,
      longitude: lng,
      locationName: locationName || 'دفتر مرکزی هلدینگ',
      locationDescription: manualDesc,
      isLocationDiscrepancy: !!isLocationDiscrepancy,
      locationApprovalStatus: isLocationDiscrepancy ? 'pending' : 'approved'
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    
    // Subtract/Add score dynamically on overall user score 
    handleUpdateUser(currentUser.id, { currentScore: calculatedScore });
    if (isLocationDiscrepancy) {
      pushAlert('اختلال موقعیت مکانی حضور', `${currentUser.name} ورود خود را با ثبت دستی موقعیت "${manualDesc || locationName}" (اختلال GPS) ثبت کرد و به کارتابل مدیر داخلی ارجاع شد.`);
    } else {
      pushAlert('ثبت حضور روزانه', `${currentUser.name} ورود خود را در موقعیت "${locationName || 'دفتر مرکزی هلدینگ'}" در ساعت ${checkInTime} ${scoreDeducted > 0 ? `با ${delayMinutes} دقیقه تاخیر (-${scoreDeducted} امتیاز)` : scoreAdded > 0 ? `با تعجیل ورود (+${scoreAdded} امتیاز)` : 'بموقع'} ثبت کرد.`);
    }
  };

  // Punch out clock card trigger
  const handlePunchOut = (customTime?: string) => {
    const today = '۱۴۰۵/۰۴/۰۳';
    const checkOutTime = customTime || '۱۷:۰۵';

    setAttendanceRecords(prev => prev.map((r) => {
      if (r.userId === currentUser.id && r.date === today) {
        let earlyDepartureMinutes = 0;
        let overtimeMinutes = 0;
        const requiredHours = currentUser.id === 'ghorbi' ? 8 : 9; // خانم قربی 8 ساعت، بقیه 9 ساعت
        const expectedCheckOutHour = 8 + requiredHours; // 16:00 or 17:00

        try {
          const parts = checkOutTime.split(':');
          const hour = parseInt(parts[0], 10);
          const minute = parseInt(parts[1], 10);
          const totalMinutes = hour * 60 + minute;
          const expectedMinutes = expectedCheckOutHour * 60;
          if (totalMinutes < expectedMinutes) {
            earlyDepartureMinutes = expectedMinutes - totalMinutes;
          } else if (totalMinutes > expectedMinutes) {
            overtimeMinutes = totalMinutes - expectedMinutes;
          }
        } catch (e) {
          earlyDepartureMinutes = 0;
        }

        // Determine score deduction for early departure
        let exitScoreDeducted = 0;
        if (earlyDepartureMinutes > 15 && earlyDepartureMinutes <= 45) {
          exitScoreDeducted = 1;
        } else if (earlyDepartureMinutes > 45 && earlyDepartureMinutes <= 60) {
          exitScoreDeducted = 2;
        } else if (earlyDepartureMinutes > 60) {
          exitScoreDeducted = 5;
        }

        // Determine score addition for overtime
        let overtimeScoreAdded = 0;
        if (overtimeMinutes >= 30 && overtimeMinutes <= 60) {
          overtimeScoreAdded = 1;
        } else if (overtimeMinutes > 60) {
          overtimeScoreAdded = 3;
        }

        const scoreChange = overtimeScoreAdded - exitScoreDeducted;
        const calculatedScore = Math.min(100, Math.max(0, r.calculatedScore + scoreChange));

        setTimeout(() => {
          handleUpdateUser(currentUser.id, { currentScore: calculatedScore });
        }, 100);

        if (overtimeScoreAdded > 0) {
          pushAlert('پاداش اضافه کاری', `${currentUser.name} به دلیل اضافه کاری در ساعت ${checkOutTime}، ${overtimeScoreAdded}+ امتیاز تشویقی دریافت کرد.`);
        } else if (exitScoreDeducted > 0) {
          pushAlert('کسر امتیاز تعجیل خروج', `${currentUser.name} به دلیل تعجیل خروج در ساعت ${checkOutTime}، ${exitScoreDeducted}- امتیاز انضباطی گرفت.`);
        }

        return {
          ...r,
          checkOut: checkOutTime,
          earlyDepartureMinutes,
          overtimeMinutes,
          scoreDeducted: r.scoreDeducted + exitScoreDeducted,
          calculatedScore,
          status: exitScoreDeducted > 0 ? 'early_departure' : 'present'
        };
      }
      return r;
    }));
    pushAlert('ثبت خروج روزانه', `${currentUser.name} خروج خود را در ساعت ${checkOutTime} ثبت کرد.`);
  };

  // Request leave (hourly or daily) actions
  const handleRequestLeave = (type: 'daily' | 'hourly', reason: string) => {
    const today = '۱۴۰۵/۰۴/۰۳';
    const scoreDeducted = 1; // 1 point negative constraint per leave
    const calculatedScore = currentUser.currentScore - scoreDeducted;

    const newRecord: AttendanceRecord = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      date: today,
      dayOfWeek: 'یکشنبه',
      checkIn: null,
      checkOut: null,
      status: type === 'daily' ? 'leave_daily' : 'leave_hourly',
      delayMinutes: 0,
      earlyDepartureMinutes: 0,
      leaveType: type,
      overtimeMinutes: 0,
      scoreDeducted,
      calculatedScore
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    handleUpdateUser(currentUser.id, { currentScore: calculatedScore });
    pushAlert('درخواست مرخصی', `${currentUser.name} ثبت مرخصی ${type === 'daily' ? 'روزانه' : 'ساعتی'} نمود: ${reason}`);
  };

  // Define task creation
  const handleAddTask = (newTask: Task) => {
    setAllTasks(prev => [newTask, ...prev]);
    if (newTask.status === 'pending_internal_approval') {
      pushAlert('ثبت فرآیند جدید', `وظیفه "${newTask.title}" ایجاد شد و منتظر تایید مدیر داخلی است.`);
    } else {
      pushAlert('تعریف تسک سازمانی', `ماموریت اداری جدید با عنوان "${newTask.title}" به مجریان ابلاغ گردید.`);
    }
  };

  // Progress slide or status transition modifications
  const handleUpdateTask = (taskId: string, updated: Partial<Task>) => {
    setAllTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const next = { ...t, ...updated };
        // If transitioning to active/new status from pending_internal_approval
        if (t.status === 'pending_internal_approval' && updated.status === 'new') {
          setTimeout(() => pushAlert('تایید وظیفه', `وظیفه با عنوان "${t.title}" توسط مدیر داخلی تایید و فعال شد.`, t.creatorId || 'reza'), 100);
        }
        // If rejected
        if (updated.status === 'rejected_by_internal') {
          setTimeout(() => pushAlert('عدم تایید وظیفه', `وظیفه با عنوان "${t.title}" مورد تایید مدیر داخلی قرار نگرفت.`, t.creatorId || 'reza'), 100);
        }
        return next;
      }
      return t;
    }));
    
    // Custom triggers
    if (updated.status === 'completed') {
      pushAlert('اتمام کار محوله', `وظیفه با کد ${taskId} با تایید بخش ارزیابی بسته و بایگانی شد.`);
    }
  };

  // Employee report submission back on task board
  const handleSubmitTaskResult = (taskId: string, text: string, attachmentName?: string) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { 
      ...t, 
      resultText: text, 
      attachmentName: attachmentName || t.attachmentName,
      status: t.requireApproval ? 'pending_approval' : 'completed',
      progress: 100 
    } : t));

    pushAlert('تحویل گزارش وظیفه', `${currentUser.name} گزارش خروجی ماموریت شماره ${taskId} را ارسال کرد.`);
  };

  // Ask colleague to take over/transfer task assignment
  const handleRequestTransfer = (taskId: string, toUserId: string, reason: string) => {
    const taskObj = allTasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const targetUser = allUsers.find(u => u.id === toUserId);
    if (!targetUser) return;

    const newReq: TaskTransferRequest = {
      id: 'req_' + Math.random().toString(36).substring(2, 9),
      taskId,
      taskTitle: taskObj.title,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: targetUser.id,
      toUserName: targetUser.name,
      reason,
      status: 'pending',
      createdAt: '۱۴۰۵/۰۴/۰۳'
    };

    setTransferRequests(prev => [newReq, ...prev]);
    pushAlert('درخواست جابجایی کار', `${currentUser.name} درخواست واگذاری وظیفه "${taskObj.title}" را به ${targetUser.name} ثبت کرد.`);
  };

  // CEO review triggers for task swap transfer authorization
  const handleApproveTransfer = (reqId: string) => {
    const req = transferRequests.find(r => r.id === reqId);
    if (!req) return;

    // Mutate the task assignment
    setAllTasks(prev => prev.map((t) => {
      if (t.id === req.taskId) {
        // Replace previous worker with new colleague
        const listWithoutSource = t.assignees.filter(uid => uid !== req.fromUserId);
        return {
          ...t,
          assignees: [...listWithoutSource, req.toUserId]
        };
      }
      return t;
    }));

    setTransferRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
    pushAlert('تایید انتقال وظیفه', `درخواست جابجایی تسک تایید شد. مجری پروژه با تایید رسمی مدیر جابجا گردید.`);
  };

  const handleRejectTransfer = (reqId: string) => {
    setTransferRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    pushAlert('رد انتقال وظیفه', `درخواست انتقال تسک به دلیل نیاز به تخصص فرد ارجاع‌دهنده توسط مدیریت رد شد.`);
  };

  // Multi-step Workflows launchers
  const handleAddWorkflow = (flow: WorkflowInstance) => {
    setWorkflows(prev => [flow, ...prev]);
    pushAlert('گردش کار جدید', `فرآیند گردش مدرک چندمرحله‌ای با عنوان "${flow.title}" استارت خورد.`);
  };

  // Sign or approve current workflow step nodes
  const handleApproveStep = (flowId: string, stepIndex: number, comment: string) => {
    setWorkflows(prev => prev.map((flow) => {
      if (flow.id === flowId) {
        const nextSteps = [...flow.steps];
        nextSteps[stepIndex].status = 'approved';
        nextSteps[stepIndex].updateTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        nextSteps[stepIndex].comment = comment;

        // Is there a next node?
        const isLastNode = stepIndex === flow.steps.length - 1;
        const nextIdx = isLastNode ? stepIndex : stepIndex + 1;
        
        return {
          ...flow,
          steps: nextSteps,
          currentStepIndex: nextIdx,
          status: isLastNode ? 'completed' : 'in_progress' as any,
          history: [...flow.history, {
            stepIndex,
            action: 'approved' as const,
            user: currentUser.name,
            comment,
            time: nextSteps[stepIndex].updateTime
          }]
        };
      }
      return flow;
    }));

    pushAlert('امضای موافقت مدارک', `${currentUser.name} امضای خود را پای مجوز شماره ${flowId} ثبت کرد.`);
  };

  const handleRejectStep = (flowId: string, stepIndex: number, comment: string) => {
    setWorkflows(prev => prev.map((flow) => {
      if (flow.id === flowId) {
        const nextSteps = [...flow.steps];
        nextSteps[stepIndex].status = 'rejected';
        nextSteps[stepIndex].comment = comment;

        return {
          ...flow,
          steps: nextSteps,
          status: 'rejected' as any,
          history: [...flow.history, {
            stepIndex,
            action: 'rejected' as const,
            user: currentUser.name,
            comment,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return flow;
    }));

    pushAlert('لغو و رد مدارک', `${currentUser.name} مخالفت قاطع خود را در پرونده شماره ${flowId} ثبت کرد.`);
  };

  // Banking Operation items approvals
  const handleApproveBank = (bankId: string) => {
    setBankRecords(prev => prev.map(b => b.id === bankId ? { ...b, status: 'ceo_approved' } : b));
    pushAlert('تایید ابلاغیه بانکی', `چک بانکی صادر شده تحت تعهد ${bankId} موافقت و تایید شد.`);
  };

  const handleRejectBank = (bankId: string) => {
    setBankRecords(prev => prev.map(b => b.id === bankId ? { ...b, status: 'rejected' } : b));
    pushAlert('رد سند بانکی', `امور مالی به دلیل ناهمخوانی حساب، ابلاغیه ${bankId} را رد نمود.`);
  };

  // Performance Rating index setting
  const handleRateEmployee = (userId: string, ratings: Partial<PerformanceEvaluation>) => {
    setEvaluations(prev => {
      const currentEval = prev[userId] || {};
      return {
        ...prev,
        [userId]: {
          ...currentEval,
          ...ratings as any
        }
      };
    });

    const target = allUsers.find(u=>u.id===userId);
    pushAlert('ثبت امتیاز عملکرد', `شاخص عملکردی و کارنامه اداری برای ${target?.name} صادر و ثبت شد.`);
  };

  // Submit Commercial purchases/sales
  const handleAddCommercial = (
    type: 'purchase' | 'sale' | 'customer_intro' | 'participation',
    title: string, subDetails: string, tonnage: number, val: number
  ) => {
    const autoRoute = businessRules.find(r => r.name === 'تغییر مسیر خرید نقدی کالا به دفتر مدیریت' && r.isActive);
    
    // Auto calculated commission based on scale of the deal (example: 0.5% commission)
    const commissionVal = Math.round(val * 0.005);

    const newDeal: CommercialRecord = {
      id: 'comm_' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userPosition: currentUser.position,
      type,
      title,
      details: subDetails,
      tonnage,
      value: val,
      commissionAmount: commissionVal,
      status: 'pending',
      createdAt: '۱۴۰۵/۰۴/۰۳'
    };

    setCommercials(prev => [newDeal, ...prev]);
    pushAlert('ثبت مشارکت تجاری', `${currentUser.name} معامله تجاری با انضمام پورسانت پیشنهادی به مبلغ ${commissionVal} تومان را ثبت کرد.`);

    // BUSINESS RULES ENGINE LINK: Auto-routing cash acquisitions
    if (type === 'purchase' && autoRoute) {
      pushAlert('راه‌اندازی قوانین انبار', `طبق قواعد فعال موتور قوانین، پوشه خرید نقدی ${newDeal.id} مستقیماً به دفتر خانم عطایی تخصیص داده شد.`);
    }
  };

  // Approving commercial points
  const handleApproveCommercial = (commId: string, commissionPercent: number) => {
    let earnedComm = 0;
    let targetEmpId = '';

    setCommercials(prev => prev.map((c) => {
      if (c.id === commId) {
        earnedComm = c.commissionAmount;
        targetEmpId = c.userId;
        return { ...c, status: 'approved' };
      }
      return c;
    }));

    // Inject the certified commission cash straight back inside their salary statement! "پورسانت تأییدشده به صورت خودکار در دریافتی ماهانه لحاظ شود."
    setAllUsers(prev => prev.map((u) => {
      if (u.id === targetEmpId) {
        return {
          ...u,
          financialInfo: {
            ...u.financialInfo,
            commission: u.financialInfo.commission + earnedComm
          }
        };
      }
      return u;
    }));

    pushAlert('تصویب کمیسیون معامله', `جلسه مالی پورسانت را برای همکاران تصویب کرد. این پورسانت به دریافتی حقوق ماه جاری ایشان فورا واریز گردید.`);
  };

  const handleRejectCommercial = (commId: string) => {
    setCommercials(prev => prev.map(c => c.id === commId ? { ...c, status: 'rejected' } : c));
    pushAlert('مخالفت با پورسانت معامله', `فعالیت بازرگانی مربوط به سند ${commId} خارج از قالب آیین‌نامه شناخته شد.`);
  };

  // Suggeston Box submissions
  const handleAddSuggestion = (type: any, title: string, content: string) => {
    const nextSug: Suggestion = {
      id: 'sug_' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      title,
      content,
      type,
      status: 'pending',
      bonusReward: 0,
      createdAt: '۱۴۰۵/۰۴/۰۳'
    };

    setSuggestions(prev => [nextSug, ...prev]);
    pushAlert('پیشنهاد و نوآوری نوین', `طرح توسعه جدید با عنوان "${title}" در صندوق ممیزی مدیرعامل قرار گرفت.`);
  };

  const handleApproveSuggestion = (sugId: string, bonus: number, comment: string) => {
    let targetUId = '';
    setSuggestions(prev => prev.map((s) => {
      if (s.id === sugId) {
        targetUId = s.userId;
        return { ...s, status: 'approved', bonusReward: bonus, reviewComment: comment };
      }
      return s;
    }));

    // Reward cash is immediately added underneath their salary bonus! "پاداش واگذار شده به حقوق ماهانه لحاظ گردد"
    if (bonus > 0) {
      setAllUsers(prev => prev.map((u) => {
        if (u.id === targetUId) {
          return {
            ...u,
            financialInfo: {
              ...u.financialInfo,
              bonus: u.financialInfo.bonus + bonus
            }
          };
        }
        return u;
      }));
    }

    pushAlert('تایید ایده پرسنل', `ایده نوآور با تخصیص پاداش مصوب موافقت گردید و پاداش در حقوق اعمال گشت.`);
  };

  const handleRejectSuggestion = (sugId: string, comment: string) => {
    setSuggestions(prev => prev.map(s => s.id === sugId ? { ...s, status: 'rejected', reviewComment: comment } : s));
  };

  // Messaging directly with CEO
  const handleSendMessage = (body: string, isConf: boolean) => {
    const nextMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: 'reza',
      receiverName: 'موسوی-وظیفه',
      content: body,
      createdAt: '۱۴۰۵/۰۴/۰۳ - ۱۳:۰۰',
      isConfidential: isConf,
      isRead: false,
      type: isConf ? 'confidential' : 'message'
    };

    setAlerts((prev) => [
      {
        id: 'al_' + Math.random().toString(36).substring(2, 9),
        userId: 'reza',
        title: isConf ? 'پیام فوق محرمانه' : 'پیام جدید کارکنان',
        message: `${currentUser.name} پیامی را به صورت مستقیم ارسال کرده است.`,
        createdAt: '۱۳:۰۰',
        isRead: false
      },
      ...prev
    ]);
  };

  // NEW MODULES HANDLERS
  const handleAddLeaveRequest = (req: LeaveRequest) => {
    setLeaveRequests(prev => [req, ...prev]);
    pushAlert('درخواست مرخصی جدید', `کاربر ${req.userName} یک درخواست مرخصی ${req.type === 'daily' ? 'روزانه' : 'ساعتی'} ثبت کرد.`);
  };

  const handleApproveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === id) {
        // Integrate with Payroll after approval: "پس از تایید مدیر داخلی در سیستم حقوق و دستمزد اعمال شود."
        setAllUsers(users => users.map(u => {
          if (u.id === l.userId) {
            return {
              ...u,
              financialInfo: {
                ...u.financialInfo,
                deductions: u.financialInfo.deductions + (l.type === 'daily' ? 1000000 : 200000)
              }
            };
          }
          return u;
        }));
        return { ...l, status: 'approved', sentToPayroll: true };
      }
      return l;
    }));
    pushAlert('تایید مرخصی', 'درخواست مرخصی با موفقیت تایید و در سیستم حقوق و دستمزد ثبت گردید.');
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
    pushAlert('رد مرخصی', 'درخواست مرخصی پرسنل رد گردید.');
  };

  const handleAddMissionRequest = (req: MissionRequest) => {
    setMissionRequests(prev => [req, ...prev]);
    pushAlert('درخواست ماموریت جدید', `کاربر ${req.userName} یک درخواست ماموریت ${req.type === 'daily' ? 'روزانه' : 'ساعتی'} ثبت کرد.`);
  };

  const handleApproveMission = (id: string) => {
    setMissionRequests(prev => prev.map(m => {
      if (m.id === id) {
        // Integrate with Payroll: add mission bonus
        setAllUsers(users => users.map(u => {
          if (u.id === m.userId) {
            return {
              ...u,
              financialInfo: {
                ...u.financialInfo,
                bonus: u.financialInfo.bonus + 1500000
              }
            };
          }
          return u;
        }));
        return { ...m, status: 'approved', sentToPayroll: true };
      }
      return m;
    }));
    pushAlert('تایید ماموریت', 'ماموریت اداری تایید گردید و فوق‌العاده ماموریت در فیش حقوقی پرسنل منظور شد.');
  };

  const handleRejectMission = (id: string) => {
    setMissionRequests(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
    pushAlert('رد ماموریت', 'درخواست ماموریت پرسنل رد شد.');
  };

  const handleAddEmergencyHoliday = (hol: EmergencyHoliday) => {
    setEmergencyHolidays(prev => [hol, ...prev]);
    pushAlert('ثبت تعطیلی اضطراری', `تعطیلی اضطراری "${hol.title}" برای تاریخ ${hol.date} توسط مدیر داخلی ثبت گردید.`);
  };

  const handleAddCompanyDocument = (doc: CompanyDocument) => {
    setCompanyDocuments(prev => [doc, ...prev]);
    pushAlert('بارگذاری سند جدید', `سند جدید با عنوان "${doc.title}" توسط ${doc.uploadedByUserName} بارگذاری شد و منتظر تایید دو مرحله‌ای است.`);
  };

  const handleApproveDocument = (id: string, phase: 'internal' | 'admin') => {
    setCompanyDocuments(prev => prev.map(d => {
      if (d.id === id) {
        if (phase === 'internal') {
          return { ...d, internalApproverId: currentUser.id, status: 'pending_admin' };
        } else {
          return { ...d, adminApproverId: currentUser.id, status: 'approved' };
        }
      }
      return d;
    }));
    pushAlert('تایید سند', phase === 'internal' ? 'سند در مرحله اول (مدیر داخلی) تایید شد و به کارتابل مدیر سیستم ارسال گردید.' : 'سند در مرحله دوم (مدیر سیستم) نهایی شد و تایید گردید.');
  };

  const handleRejectDocument = (id: string) => {
    setCompanyDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
    pushAlert('رد سند', 'سند مورد تایید قرار نگرفت و عودت داده شد.');
  };

  const handleEscrowLend = (id: string, borrower: string, returnDate: string, status: 'pending_approval' | 'borrowed' = 'pending_approval', importance: string = 'عادی') => {
    setCompanyDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      isEscrow: true,
      escrowStatus: status,
      escrowBorrower: borrower,
      escrowReturnDate: returnDate,
      escrowImportance: importance,
      escrowActualReturnDate: undefined
    } : d));
    if (status === 'pending_approval') {
      pushAlert('ثبت درخواست امانت', `درخواست امانت سند به نام "${borrower}" با اهمیت (${importance}) ثبت شد و جهت تایید مدیر داخلی در کارتابل قرار گرفت.`);
    } else {
      pushAlert('امانت‌دهی مدرک', `سند انتخابی به امانت به آقای/خانم "${borrower}" سپرده شد. موعد عودت: ${returnDate}`);
    }
  };

  const handleEscrowReturnRequest = (id: string) => {
    setCompanyDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      escrowStatus: 'pending_return'
    } : d));
    pushAlert('اعلام عودت امانت', 'پرسنل اعلام عودت امانت نموده است. جهت اعمال نهایی در سیستم نیازمند تایید مدیر داخلی است.');
  };

  const handleApproveEscrow = (id: string) => {
    setCompanyDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      escrowStatus: 'borrowed'
    } : d));
    pushAlert('تایید امانت مدرک', 'درخواست امانت سند توسط مدیر داخلی تایید شد و وضعیت آن به امانت‌رفته تغییر یافت.');
  };

  const handleRejectEscrow = (id: string) => {
    setCompanyDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      isEscrow: false,
      escrowStatus: 'rejected'
    } : d));
    pushAlert('عدم تایید امانت', 'درخواست امانت سند توسط مدیر داخلی رد شد.');
  };

  const handleEscrowReturn = (id: string) => {
    setCompanyDocuments(prev => prev.map(d => d.id === id ? {
      ...d,
      escrowStatus: 'returned',
      escrowActualReturnDate: '۱۴۰۵/۰۴/۰۳'
    } : d));
    pushAlert('عودت مدرک امانی', 'مدرک امانی توسط مدیر داخلی تایید بازگشت شد و وضعیت آن به تحویل‌شده تغییر یافت.');
  };

  const handleAddPrayer = (text: string) => {
    const newPrayer: DailyPrayer = {
      id: 'pr_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      text,
      createdAt: '۱۴۰۵/۰۴/۰۳'
    };
    setDailyPrayers(prev => [newPrayer, ...prev]);
    pushAlert(`دعای امروز از طرف ${currentUser.name}`, text);
  };

  const handleReplyPrayer = (prayerId: string, replyText: string, targetUserId?: string) => {
    setDailyPrayers(prev => prev.map(p => p.id === prayerId ? {
      ...p,
      adminReply: replyText,
      repliedAt: '۱۴۰۵/۰۴/۰۳'
    } : p));
    pushAlert('پیام مدیر', `پاسخ مدیر به دعای امروز شما: ${replyText}`, targetUserId || currentUser.id);
  };

  const handleApproveLocationDiscrepancy = (attId: string, status: 'approved' | 'rejected') => {
    setAttendanceRecords(prev => prev.map(r => r.id === attId ? { ...r, locationApprovalStatus: status } : r));
    pushAlert('بررسی اختلال موقعیت مکانی', status === 'approved' ? 'موقعیت مکانی ثبت‌شده به صورت دستی توسط مدیر داخلی تایید شد.' : 'موقعیت مکانی دستی مورد تایید قرار نگرفت.');
  };

  const handleAddDailyReport = (rep: DailyPerformanceReport) => {
    setDailyReports(prev => [rep, ...prev]);
    pushAlert('ثبت گزارش عملکرد', `گزارش عملکرد روزانه توسط ${rep.userName} در سیستم درج گردید.`);
  };

  const handleToggleRule = (ruleId: string) => {
    setBusinessRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
  };

  const handleAddRule = (rule: BusinessRule) => {
    setBusinessRules(prev => [...prev, rule]);
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    // Auto switch tab to prevent lockups on different privilege viewports
    if (user.isAdmin || user.id === 'reza' || (isDelegatedToOfficeManager && user.id === 'ataei')) {
      setActiveMenu('admin');
    } else {
      setActiveMenu('personnel');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      
      {/* 1. MASTER BRAND NAVIGATION HEADER */}
      <Header 
        currentUser={currentUser} 
        onUserChange={handleUserChange}
        allUsers={allUsers}
        alerts={alerts}
        onClearAlerts={handleClearAlerts}
        isDelegatedToOfficeManager={isDelegatedToOfficeManager}
        onToggleDelegation={() => {
          const nextState = !isDelegatedToOfficeManager;
          setIsDelegatedToOfficeManager(nextState);
          pushAlert('وضعیت تفویض دسترسی', nextState ? 'تمام اختیارات مدیرعامل رسماً به خانم عطایی تفویض شد' : 'اختیارات تفویض شده مجدداً به دست به مدیرعامل ملغی گردید');
        }}
      />

      {/* 2. DUAL SIDEBAR WORKSPACE AND COMPONENT SECTIONS */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Right Navigation Panel Drawer (RTL Oriented) */}
          <aside className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5 lg:col-span-1">
            <div className="text-right pb-3 border-b border-rose-50/50">
              <span className="text-[10px] text-brand-cyan/85 font-black uppercase">ناوبر اداری ستاد</span>
              <h3 className="text-xs font-black text-slate-800 mt-1">امور جاری هلدینگ</h3>
            </div>

            <nav className="flex flex-col gap-1.5">
              
              {!currentUser.isAdmin && (
                <button
                  onClick={() => setActiveMenu('personnel')}
                  className={`w-full text-right p-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-reverse space-x-2.5 cursor-pointer ${
                    activeMenu === 'personnel' ? 'bg-brand-cyan text-white shadow-lg font-bold' : 'hover:bg-slate-55 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  <span>میز اداری پرسنل</span>
                </button>
              )}

              <button
                onClick={() => setActiveMenu('tasks')}
                className={`w-full text-right p-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-reverse space-x-2.5 cursor-pointer ${
                  activeMenu === 'tasks' ? 'bg-brand-cyan text-white shadow-lg font-bold' : 'hover:bg-slate-55 text-slate-650 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-5 h-5 flex-shrink-0" />
                <span>میز تیمی کارها</span>
              </button>

              <button
                onClick={() => setActiveMenu('evaluations')}
                className={`w-full text-right p-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-reverse space-x-2.5 cursor-pointer ${
                  activeMenu === 'evaluations' ? 'bg-brand-cyan text-white shadow-lg font-bold' : 'hover:bg-slate-55 text-slate-650 hover:bg-slate-100'
                }`}
              >
                <Award className="w-5 h-5 flex-shrink-0" />
                <span>کارنامه و ارزیابی</span>
              </button>

              {/* Only reveal admin tab for CEO or when delegation is on and you are Ms. Ataei */}
              {isAdminOrDelegator && (
                <button
                  onClick={() => setActiveMenu('admin')}
                  className={`w-full text-right p-3 rounded-2xl text-xs font-black transition-all flex items-center space-x-reverse space-x-2.5 cursor-pointer border ${
                    activeMenu === 'admin' ? 'bg-emerald-605 bg-emerald-600 text-white shadow-lg border-emerald-600 font-bold' : 'hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}
                  id="admin_menu_sidebar_btn"
                >
                  <Shield className="w-5 h-5 flex-shrink-0 text-amber-400" />
                  <span>پرچم مدیریت ارشد</span>
                </button>
              )}

              {/* Glowing, shining Daily Prayer Tab inside Office Navigation of Headquarters (Only for Admin/Delegator) */}
              {isAdminOrDelegator && (
                <button
                  onClick={() => setActiveMenu('prayers')}
                  className={`w-full text-right p-3 rounded-2xl text-xs font-black transition-all flex items-center justify-between cursor-pointer border relative overflow-hidden group ${
                    activeMenu === 'prayers'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border-purple-600 font-bold'
                      : 'hover:bg-purple-50 text-purple-700 border-purple-200 bg-purple-50/20'
                  }`}
                  id="sidebar_prayers_btn"
                >
                  {/* Shining animated laser overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  <div className="flex items-center space-x-reverse space-x-2.5">
                    <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-400 animate-pulse" />
                    <span>دعای پرسنل</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeMenu === 'prayers' ? 'bg-purple-500 text-purple-100' : 'bg-purple-100 text-purple-700'}`}>
                    {toPersianDigits(dailyPrayers.length)}
                  </span>
                </button>
              )}

            </nav>
          </aside>

          {/* MAIN MODULE VIEWPORT */}
          <main className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMenu}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                {activeMenu === 'personnel' && !currentUser.isAdmin && (
                  <PersonnelDashboard 
                    currentUser={currentUser}
                    onPunchIn={handlePunchIn}
                    onPunchOut={handlePunchOut}
                    onRequestLeave={handleRequestLeave}
                    onAddCommercial={handleAddCommercial}
                    onAddSuggestion={handleAddSuggestion}
                    onSendMessage={handleSendMessage}
                    attendanceRecords={attendanceRecords}
                    allCommercials={commercials}
                    allSuggestions={suggestions}
                    allMessages={[]}
                    onUpdateUser={handleUpdateUser}
                    leaveRequests={leaveRequests}
                    onAddLeaveRequest={handleAddLeaveRequest}
                    missionRequests={missionRequests}
                    onAddMissionRequest={handleAddMissionRequest}
                    companyDocuments={companyDocuments}
                    onAddCompanyDocument={handleAddCompanyDocument}
                    dailyReports={dailyReports}
                    onAddDailyReport={handleAddDailyReport}
                    onEscrowLend={handleEscrowLend}
                    onEscrowReturn={handleEscrowReturn}
                    onEscrowReturnRequest={handleEscrowReturnRequest}
                    dailyPrayers={dailyPrayers}
                    onAddPrayer={handleAddPrayer}
                    allUsers={allUsers}
                  />
                )}

                {activeMenu === 'tasks' && (
                  <TaskModule 
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allTasks={allTasks}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onSubmitTaskResult={handleSubmitTaskResult}
                    onRequestTransfer={handleRequestTransfer}
                    isDelegatedToOfficeManager={isDelegatedToOfficeManager}
                  />
                )}

                {activeMenu === 'evaluations' && (
                  <EvaluationAndReportCard 
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allTasks={allTasks}
                    evaluations={evaluations}
                    onRateEmployee={handleRateEmployee}
                    isDelegatedToOfficeManager={isDelegatedToOfficeManager}
                  />
                )}

                {activeMenu === 'admin' && isAdminOrDelegator && (
                  <AdminDashboard 
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allTasks={allTasks}
                    bankRecords={bankRecords}
                    commercials={commercials}
                    suggestions={suggestions}
                    businessRules={businessRules}
                    transferRequests={transferRequests}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onApproveBank={handleApproveBank}
                    onRejectBank={handleRejectBank}
                    onApproveCommercial={handleApproveCommercial}
                    onRejectCommercial={handleRejectCommercial}
                    onApproveSuggestion={handleApproveSuggestion}
                    onRejectSuggestion={handleRejectSuggestion}
                    onToggleRule={handleToggleRule}
                    onApproveTransfer={handleApproveTransfer}
                    onRejectTransfer={handleRejectTransfer}
                    isDelegatedToOfficeManager={isDelegatedToOfficeManager}
                    onToggleDelegation={() => {
                      const nextState = !isDelegatedToOfficeManager;
                      setIsDelegatedToOfficeManager(nextState);
                      pushAlert('وضعیت تفویض دسترسی', nextState ? 'تمام اختیارات مدیرعامل رسماً به خانم عطایی تفویض شد' : 'اختیارات تفویض شده مجدداً به دست به مدیرعامل ملغی گردید');
                    }}
                    onAddRule={handleAddRule}
                    onRestoreDemoScenario={handleRestoreDemoScenario}
                    onWipeAndResetRaw={handleWipeAndResetRaw}
                    onImportFullBackup={handleImportFullBackup}
                    leaveRequests={leaveRequests}
                    onApproveLeave={handleApproveLeave}
                    onRejectLeave={handleRejectLeave}
                    missionRequests={missionRequests}
                    onApproveMission={handleApproveMission}
                    onRejectMission={handleRejectMission}
                    emergencyHolidays={emergencyHolidays}
                    onAddEmergencyHoliday={handleAddEmergencyHoliday}
                    companyDocuments={companyDocuments}
                    onApproveDocument={handleApproveDocument}
                    onRejectDocument={handleRejectDocument}
                    onEscrowLend={handleEscrowLend}
                    onEscrowReturn={handleEscrowReturn}
                    onApproveEscrow={handleApproveEscrow}
                    onRejectEscrow={handleRejectEscrow}
                    dailyReports={dailyReports}
                    attendanceRecords={attendanceRecords}
                    onApproveLocationDiscrepancy={handleApproveLocationDiscrepancy}
                    dailyPrayers={dailyPrayers}
                    onReplyPrayer={handleReplyPrayer}
                  />
                )}

                {activeMenu === 'prayers' && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 text-right">
                    {/* Submit Prayer Box */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-5 rounded-2xl border border-purple-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                        <span className="text-xs font-black text-purple-950">دعای امروز مدیر</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          id="app_prayer_input"
                          placeholder="نیایش یا دعای خود را برای امروز بنویسید..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium shadow-inner"
                        />
                        <button
                          onClick={() => {
                            const inputEl = document.getElementById('app_prayer_input') as HTMLInputElement;
                            if (inputEl && inputEl.value.trim()) {
                              handleAddPrayer(inputEl.value.trim());
                              inputEl.value = '';
                            }
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-500/10"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ثبت و ارسال دعا</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter dropdown and prayer records list */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                        <span className="text-xs font-black text-slate-800">دعا امروز پرسنل</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">نمایش دعای:</span>
                          <select
                            value={appPrayerFilter}
                            onChange={(e) => setAppPrayerFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer shadow-sm"
                          >
                            <option value="all">همه پرسنل</option>
                            {allUsers.map((u) => (
                              <option key={u.id} value={u.name}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {dailyPrayers.filter(p => appPrayerFilter === 'all' || p.userName === appPrayerFilter).length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl text-slate-400 text-xs">
                            هیچ دعایی برای {appPrayerFilter === 'all' ? 'امروز' : appPrayerFilter} ثبت نشده است.
                          </div>
                        ) : (
                          dailyPrayers
                            .filter(p => appPrayerFilter === 'all' || p.userName === appPrayerFilter)
                            .map((prayer) => {
                              const pUser = allUsers.find(u => u.name === prayer.userName);
                              return (
                                <div key={prayer.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center font-extrabold text-purple-700 text-xs">
                                        {pUser?.avatar && (pUser.avatar.startsWith('http') || pUser.avatar.startsWith('data:image')) ? (
                                          <img src={pUser.avatar} alt={prayer.userName} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                          prayer.userName.substring(0, 2)
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-xs font-black text-slate-800 block">{prayer.userName}</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5">{pUser?.position || 'پرسنل'}</span>
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-sans">{prayer.createdAt}</span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed pr-12">{prayer.text}</p>

                                  {/* Admin Reply or Response form */}
                                  {prayer.adminReply ? (
                                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 text-xs pr-12">
                                      <div className="flex items-center gap-1.5 mb-1.5 text-purple-900 font-extrabold">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                        <span>پاسخ مدیریت ارشد:</span>
                                      </div>
                                      <span className="text-slate-650 leading-relaxed">{prayer.adminReply}</span>
                                    </div>
                                  ) : (
                                    isAdminOrDelegator && (
                                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 pr-12 space-y-2">
                                        <span className="text-[10px] font-black text-purple-900 block">پاسخ به دعای پرسنل (پنل مدیریت):</span>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            placeholder="پاسخ خود را به عنوان مدیر سیستم بنویسید..."
                                            id={`prayer_reply_input_${prayer.id}`}
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
                                          />
                                          <button
                                            onClick={() => {
                                              const replyEl = document.getElementById(`prayer_reply_input_${prayer.id}`) as HTMLInputElement;
                                              if (replyEl && replyEl.value.trim()) {
                                                handleReplyPrayer(prayer.id, replyEl.value.trim(), prayer.userId);
                                                replyEl.value = '';
                                              }
                                            }}
                                            className="bg-brand-cyan hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                                          >
                                            ثبت پاسخ
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-brand-navy py-6 text-slate-400 text-xs border-t border-slate-800 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p>© {toPersianDigits(1405)} هلدینگ کاویان سپنتا. تمامی حقوق مادی و معنوی این سامانه متعلق به ستاد مرکزی می‌باشد.</p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-bold">
            <span className="hover:text-slate-300 cursor-pointer">سند نیازمندی‌های کسب‌وکار (BRD)</span>
            <span className="hover:text-slate-300 cursor-pointer">قوانین حاکمیت داده‌ها</span>
            <span className="hover:text-slate-300 cursor-pointer">ارتباط با دپارتمان فنی</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
