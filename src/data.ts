/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Task, WorkflowInstance, CommercialRecord, Suggestion, BankingRecord, BusinessRule, PerformanceEvaluation, AttendanceRecord } from './types';

// Predefined set of initial users
export const INITIAL_USERS: User[] = [
  {
    id: 'reza',
    name: 'موسوی-وظیفه',
    position: 'مدیرعامل و مدیر سیستم',
    employeeCode: 'KS-101',
    avatar: 'RV',
    department: 'مدیریت ارشد',
    hireDate: '۱۳۹۸/۰۴/۱۵',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    isWorking: true,
    financialInfo: {
      baseSalary: 45000000,
      benefits: 15000000,
      bonus: 10000000,
      commission: 0,
      deductions: 0
    },
    currentScore: 100,
    avgScore: 98.4,
    isAdmin: true,
    isOfficeManager: false
  },
  {
    id: 'ataei',
    name: 'خانم عطایی',
    position: 'مدیر داخلی',
    employeeCode: 'KS-102',
    avatar: 'A',
    department: 'دفتر مدیریت',
    hireDate: '۱۳۹۹/۰۲/۰۱',
    phone: '۰۹۱۸۲۳۴۵۶۷۸',
    isWorking: true,
    financialInfo: {
      baseSalary: 28000000,
      benefits: 8500000,
      bonus: 4500000,
      commission: 1500000,
      deductions: 450000
    },
    currentScore: 97,
    avgScore: 96.5,
    isAdmin: false,
    isOfficeManager: true
  },
  {
    id: 'zargar',
    name: 'خانم زرگر',
    position: 'مسئول اداری',
    employeeCode: 'KS-103',
    avatar: 'Z',
    department: 'منابع انسانی و اداری',
    hireDate: '۱۴۰۰/۰۳/۱۰',
    phone: '۰۹۱۹۳۴۵۶۷۸۹',
    isWorking: true,
    financialInfo: {
      baseSalary: 22000000,
      benefits: 6000000,
      bonus: 2000000,
      commission: 0,
      deductions: 200000
    },
    currentScore: 95,
    avgScore: 94.2,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'ghorbi',
    name: 'خانم قربی',
    position: 'مدیر مالی',
    employeeCode: 'KS-104',
    avatar: 'Q',
    department: 'مالی و حسابداری',
    hireDate: '۱۳۹۸/۱۰/۰۵',
    phone: '۰۹۱۲۹۸۷۶۵۴۳',
    isWorking: true,
    financialInfo: {
      baseSalary: 38000000,
      benefits: 12000000,
      bonus: 5000000,
      commission: 0,
      deductions: 0
    },
    currentScore: 99,
    avgScore: 97.8,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'marziyeh',
    name: 'خانم مرضیه',
    position: 'مسئول خدمات',
    employeeCode: 'KS-110',
    avatar: 'M',
    department: 'خدمات و پشتیبانی',
    hireDate: '۱۴۰۱/۰۸/۱۲',
    phone: '۰۹۳۵۱۲۳۴۵۶۷',
    isWorking: true,
    financialInfo: {
      baseSalary: 16000000,
      benefits: 4500000,
      bonus: 1500000,
      commission: 0,
      deductions: 100000
    },
    currentScore: 98,
    avgScore: 95.9,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'mousavi',
    name: 'آقای موسوی',
    position: 'مسئول انبار',
    employeeCode: 'KS-105',
    avatar: 'MO',
    department: 'تدارکات و انبار',
    hireDate: '۱۴۰۰/۱۱/۲۰',
    phone: '۰۹۳۰۴۵۶۷۸۹۰',
    isWorking: true,
    financialInfo: {
      baseSalary: 20000000,
      benefits: 5500000,
      bonus: 1000000,
      commission: 500000,
      deductions: 300000
    },
    currentScore: 93,
    avgScore: 91.5,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'zarrabi',
    name: 'آقای ضرابی',
    position: 'مسئول مالی',
    employeeCode: 'KS-106',
    avatar: 'D',
    department: 'مالی و حسابداری',
    hireDate: '۱۴۰۱/۰۲/۰۵',
    phone: '۰۹۱۵۶۷۸۹۰۱۲',
    isWorking: true,
    financialInfo: {
      baseSalary: 24000000,
      benefits: 6500000,
      bonus: 2500000,
      commission: 0,
      deductions: 150000
    },
    currentScore: 96,
    avgScore: 94.8,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'rahimi',
    name: 'آقای رحیمی',
    position: 'مدیر انبار',
    employeeCode: 'KS-107',
    avatar: 'R',
    department: 'تدارکات و انبار',
    hireDate: '۱۳۹۹/۰۶/۱۵',
    phone: '۰۹۱۲۴۵۶۷۸۹۰',
    isWorking: true,
    financialInfo: {
      baseSalary: 32000000,
      benefits: 9500000,
      bonus: 3500000,
      commission: 1200000,
      deductions: 0
    },
    currentScore: 95,
    avgScore: 93.9,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'yoosefi',
    name: 'آقای یوسفی',
    position: 'مدیر کنترل کیفیت',
    employeeCode: 'KS-108',
    avatar: 'Y',
    department: 'کنترل کیفیت (QA)',
    hireDate: '۱۴۰۰/۰۹/۰۱',
    phone: '۰۹۱۹۵۶۷۸۹۰۱',
    isWorking: true,
    financialInfo: {
      baseSalary: 30000000,
      benefits: 8000000,
      bonus: 4000000,
      commission: 0,
      deductions: 250000
    },
    currentScore: 98,
    avgScore: 96.2,
    isAdmin: false,
    isOfficeManager: false
  },
  {
    id: 'fallahzadeh',
    name: 'آقای فلاح‌زاده',
    position: 'مدیر فنی',
    employeeCode: 'KS-109',
    avatar: 'F',
    department: 'واحد فنی و مهندسی',
    hireDate: '۱۳۹۹/۱۰/۰۱',
    phone: '۰۹۱۲۷۶۵۴۳۲۱',
    isWorking: true,
    financialInfo: {
      baseSalary: 35000000,
      benefits: 10000000,
      bonus: 4500000,
      commission: 0,
      deductions: 500000
    },
    currentScore: 94,
    avgScore: 93.1,
    isAdmin: false,
    isOfficeManager: false
  }
];

// Initial Tasks State
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'بررسی فاکتورهای فصلی خرید مواد اولیه کارخانه',
    description: 'تمام فاکتورهای مربوط به خرید نقدی فصل بهار کارخانه باید از نظر مالیاتی و ثبت مودیان بررسی شوند.',
    assignees: ['ghorbi', 'zarrabi'],
    priority: 'high',
    startDate: '۱۴۰۵/۰۴/۰۱',
    deadline: '۱۴۰۵/۰۴/۱۰',
    status: 'in_progress',
    progress: 65,
    requireApproval: true,
    reminderSetting: 'weekly',
    createdAt: '۱۴۰۵/۰۳/۲۸',
    isTeamTask: true,
    teamLeaderId: 'ghorbi',
    teamContributions: {
      'ghorbi': 60,
      'zarrabi': 40
    }
  },
  {
    id: 'task_2',
    title: 'انبارگردانی جامع میاندوره‌ای سالن شماره ۲',
    description: 'سنجش و ثبت دقیق موجودی فیزیکی مواد خام و مقایسه آن با سیستم حسابداری سپیدار.',
    assignees: ['rahimi', 'mousavi'],
    priority: 'medium',
    startDate: '۱۴۰۵/۰۴/۰۳',
    deadline: '۱۴۰۵/۰۴/۰۷',
    status: 'new',
    progress: 0,
    requireApproval: true,
    reminderSetting: '2_days',
    createdAt: '۱۴۰۵/۰۴/۰۲',
    isTeamTask: true,
    teamLeaderId: 'rahimi',
    teamContributions: {
      'rahimi': 50,
      'mousavi': 50
    }
  },
  {
    id: 'task_3',
    title: 'تهیه و ارسال گزارش مرخصی‌های کارمندان در خردادماه',
    description: 'بررسی فایل اکسل حضور و غیاب و ثبت مرخصی‌های روزانه و ساعتی تایید شده در پرونده‌ها.',
    assignees: ['zargar'],
    priority: 'low',
    startDate: '۱۴۰۵/۰۳/۳۰',
    deadline: '۱۴۰۵/۰۴/۰۵',
    status: 'completed',
    progress: 100,
    resultText: 'گزارش کامل خردادماه تنظیم و در پوشه اشتراکی قرار گرفت. کل مرخصی‌ها ۴ روز روزانه و ۸ ساعت ساعتی بوده است.',
    requireApproval: false,
    reminderSetting: '2_days',
    createdAt: '۱۴۰۵/۰۳/۲۹',
    isTeamTask: false
  },
  {
    id: 'task_4',
    title: 'تست تست رندوم کنترل کیفی محموله جدید ورودی ورق آلیاژی',
    description: 'نمونه‌برداری رندوم بر اساس استاندارد ASTM و ثبت نتایج متالوگرافی و سختی‌سنجی.',
    assignees: ['yoosefi'],
    priority: 'high',
    startDate: '۱۴۰۵/۰۴/۰۲',
    deadline: '۱۴۰۵/۰۴/۰۶',
    status: 'in_progress',
    progress: 80,
    requireApproval: true,
    reminderSetting: 'custom',
    createdAt: '۱۴۰۵/۰۴/۰۱',
    isTeamTask: false
  },
  {
    id: 'task_5',
    title: 'عیب‌یابی برد کوره ذوب خط تولید شماره ۳',
    description: 'رفع خطای دمایی مکرر و بررسی کالیبراسیون ترموکوپل‌های کوره.',
    assignees: ['fallahzadeh'],
    priority: 'high',
    startDate: '۱۴۰۵/۰۴/۰۳',
    deadline: '۱۴۰۵/۰۴/۰۵',
    status: 'new',
    progress: 10,
    requireApproval: true,
    reminderSetting: '2_days',
    createdAt: '۱۴۰۵/۰۴/۰۳',
    isTeamTask: false
  }
];

// Seed Workflows
export const INITIAL_WORKFLOWS: WorkflowInstance[] = [
  {
    id: 'flow_1',
    title: 'درخواست خرید اضطراری ملزومات دفتر مرکزی',
    steps: [
      { name: 'درخواست خرید', role: 'مسئول اداری', assigneeName: 'خانم زرگر', status: 'approved', updateTime: '۱۰:۳۰' },
      { name: 'تایید مدیر دفتر', role: 'مدیر دفتر', assigneeName: 'خانم عطایی', status: 'approved', updateTime: '۱۱:۱۵' },
      { name: 'تایید نهایی مدیرعامل', role: 'مدیرعامل', assigneeName: 'موسوی-وظیفه', status: 'pending' },
      { name: 'تخصیص بودجه و پرداخت', role: 'مدیر مالی', assigneeName: 'خانم قربی', status: 'pending' }
    ],
    currentStepIndex: 2,
    status: 'in_progress',
    createdAt: '۱۴۰۵/۰۴/۰۳ - ۱۰:۳۰',
    history: [
      { stepIndex: 0, action: 'initiated', user: 'خانم زرگر', comment: 'ثبت و پیوست فاکتور پیش‌خرید کاغذ و پرینتر اداری با مبلغ ۸,۲۰۰,۰۰۰ تومان', time: '۱۰:۳۰' },
      { stepIndex: 1, action: 'approved', user: 'خانم عطایی', comment: 'تایید شد. نیاز مبرم به کاغذ و ملزومات واحدها وجود دارد.', time: '۱۱:۱۵' }
    ]
  },
  {
    id: 'flow_2',
    title: 'چرخه تایید فاکتور فروش صادراتی محموله میلگرد ذوب‌آهن',
    steps: [
      { name: 'ثبت فاکتور انبار', role: 'مدیر انبار', assigneeName: 'آقای رحیمی', status: 'approved', updateTime: '۰۹:۰۰' },
      { name: 'بررسی اداری و خروج', role: 'مسئول اداری', assigneeName: 'خانم زرگر', status: 'approved', updateTime: '۰۹:۴۵' },
      { name: 'بررسی و تایید کارخانه', role: 'مدیر فنی', assigneeName: 'آقای فلاح‌زاده', status: 'approved', updateTime: '۱۱:۰۰' },
      { name: 'تایید مالی و مودیان', role: 'مدیر مالی', assigneeName: 'خانم قربی', status: 'approved', updateTime: '۱۲:۳۰' },
      { name: 'ثبت سامانه مودیان', role: 'مسئول مالی', assigneeName: 'آقای ضرابی', status: 'approved', updateTime: '۱۴:۱۵' },
      { name: 'ثبت نرم‌افزار حسابداری', role: 'مسئول اداری', assigneeName: 'خانم زرگر', status: 'approved', updateTime: '۱۵:۰۰' }
    ],
    currentStepIndex: 5,
    status: 'completed',
    createdAt: '۱۴۰۵/۰۴/۰۲ - ۰۹:۰۰',
    history: [
      { stepIndex: 0, action: 'initiated', user: 'آقای رحیمی', comment: 'تناژ خروجی ۱۲۰ تن میلگرد بررسی و فاکتور شد.', time: '۰۹:۰۰' },
      { stepIndex: 1, action: 'approved', user: 'خانم زرگر', comment: 'تایید مجوز خروج تریلی‌ها', time: '۰۹:۴۵' },
      { stepIndex: 2, action: 'approved', user: 'آقای فلاح‌زاده', comment: 'تایید تست فنی آلیاژ میلگردها', time: '۱۱:۰۰' },
      { stepIndex: 3, action: 'approved', user: 'خانم قربی', comment: 'ارقام و مبالغ کل درست است. ارسال به مودیان بلامانع است.', time: '۱۲:۳۰' },
      { stepIndex: 4, action: 'approved', user: 'آقای ضرابی', comment: 'فاکتور با شناسه مالیاتی یکتا در سامانه مودیان کشور تایید نهایی شد.', time: '۱۴:۱۵' },
      { stepIndex: 5, action: 'approved', user: 'خانم زرگر', comment: 'ثبت نهایی آرتیکل در سیستم سپیدار انجام شد. فرآیند به طور کامل خاتمه یافت.', time: '۱۵:۰۰' }
    ]
  }
];

// Seed Banking Operations (Office Manager to CEO approved format)
export const INITIAL_BANK_RECORDS: BankingRecord[] = [
  {
    id: 'bank_1',
    title: 'انتقال وجه ساتنا بابت علی‌الحساب پیمانکار سازه سوله جدید کارخانه',
    amount: 120000000,
    registeredByUserId: 'ataei',
    registeredByUserName: 'خانم عطایی (مدیر دفتر)',
    registrationDate: '۱۴۰۵/۰۴/۰۳ - ۱۰:۱۵',
    status: 'ceo_approved',
    comments: 'مدیر دفتر چک فرآیند را برای تایید نهایی ارسال کرد و مدیرعامل تایید فرمودند.'
  },
  {
    id: 'bank_2',
    title: 'تسویه فاکتور نقدی شرکت گاز استان تهران - دوره خردادماه کارخانه',
    amount: 34500000,
    registeredByUserId: 'ataei',
    registeredByUserName: 'خانم عطایی (مدیر دفتر)',
    registrationDate: '۱۴۰۵/۰۴/۰۳ - ۱۲:۰۰',
    status: 'office_manager_sent',
    comments: 'ارسال شده جهت تایید مدیرعامل.'
  }
];

// Seed Commercial Collaborations & Commission logs
export const INITIAL_COMMERCIALS: CommercialRecord[] = [
  {
    id: 'comm_1',
    userId: 'rahimi',
    userName: 'آقای رحیمی',
    userPosition: 'مدیر انبار',
    type: 'sale',
    title: 'معرفی مشتری صادراتی میلگرد و مشارکت در معامله ۱۲۰ تنی',
    details: 'فروش مستقیم به هلدینگ بازرگانی العراقیه از طریق آشنایی قدیمی در مرز مهران.',
    tonnage: 120,
    value: 3600000000,
    commissionAmount: 18000000, // 0.5%
    status: 'approved',
    createdAt: '۱۴۰۵/۰۳/۲۹'
  },
  {
    id: 'comm_2',
    userId: 'mousavi',
    userName: 'آقای موسوی',
    userPosition: 'مسئول انبار',
    type: 'purchase',
    title: 'خرید ذغال کک با قیمت ویژه و تخفیف نقدی مناسب کارخانه',
    details: 'خريد ۴۰ تن ذغال کک کوره با ارزش رقابتی و کسر ۵ درصد از قیمت روز کل کشور.',
    tonnage: 40,
    value: 680000000,
    commissionAmount: 5000000,
    status: 'pending',
    createdAt: '۱۴۰۵/۰۴/۰۱'
  }
];

// Suggestions Box
export const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug_1',
    userId: 'fallahzadeh',
    userName: 'آقای فلاح‌زاده',
    title: 'اصلاح زمان‌بندی دمش کوره‌ها جهت صرفه‌جویی ۱۰ درصدی گاز',
    content: 'با تغییر برنامه زمان‌بندی فواصل پیش‌گرم به ۹۰ ثانیه، مصرف بیهوده گاز در زمان توقف خط بارهای جرثقیل تا مقدار زیادی کاهش می‌یابد.',
    type: 'saving',
    status: 'approved',
    bonusReward: 3000000,
    createdAt: '۱۴۰۵/۰۳/۲۵',
    reviewComment: 'طرح عالی است، منجر به صرفه‌جویی کلان ماهانه خواد شد. پاداش ۳ میلیون تومانی همراه با فیش حقوقی آتی واریز می‌گردد.'
  },
  {
    id: 'sug_2',
    userId: 'ataei',
    userName: 'خانم عطایی',
    title: 'اتوماسیون فکس و اسناد ورودی اداری با استفاده از پنل ابری',
    content: 'انتقال خطوط فکس سنتی به فکس اینترنتی جهت ردیابی بهتر نامه‌ها توسط مدیران بدون نیاز به چاپ کاغذی.',
    type: 'process_improvement',
    status: 'pending',
    bonusReward: 0,
    createdAt: '۱۴۰۵/۰۴/۰۲'
  }
];

// Intelligent Business Rules Engine initial list
export const INITIAL_RULES: BusinessRule[] = [
  {
    id: 'rule_1',
    name: 'تغییر مسیر خرید نقدی کالا به دفتر مدیریت',
    triggerEvent: 'ثبت خرید نقدی انبار یا تدارکات',
    actionType: 'ارجاع مستقیم خودکار به کارتابل اداری خانم عطایی (مدیر دفتر)',
    isActive: true,
    descr: 'خرید‌های نقدی زیر ۱۰۰ میلیون تومان نیاز به چک اداری دارند.'
  },
  {
    id: 'rule_2',
    name: 'تغییر مسیر فروش نقدی تناژ بالا',
    triggerEvent: 'فروش نقدی میلگرد یا محصولات فولادی بالای ۵۰ تن',
    actionType: 'ارسال هشدار فوری پیامکی به مدیرعامل و ارجاع پرونده به خانم عطایی',
    isActive: true,
    descr: 'به جهت ریسک نوسان نقدی بازار، کارهای صادرات نقدی باید بلافاصله رصد شوند.'
  }
];

// Attendance stats & template seed daily records for the current month
export const TEMPORARY_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_1',
    userId: 'ataei',
    date: '۱۴۰۵/۰۴/۰۳',
    dayOfWeek: 'شنبه',
    checkIn: '۰۸:۰۵',
    checkOut: '۱۷:۰۲',
    status: 'present',
    delayMinutes: 5,
    earlyDepartureMinutes: 0,
    leaveType: null,
    overtimeMinutes: 2,
    scoreDeducted: 0,
    calculatedScore: 100
  },
  {
    id: 'att_2',
    userId: 'zargar',
    date: '۱۴۰۵/۰۴/۰۳',
    dayOfWeek: 'شنبه',
    checkIn: '۰۸:۴۵', // 45 mins late
    checkOut: '۱۷:۰۰',
    status: 'late',
    delayMinutes: 45,
    earlyDepartureMinutes: 0,
    leaveType: null,
    overtimeMinutes: 0,
    scoreDeducted: 1, // Let's say delays deduct on fractional hours
    calculatedScore: 99
  },
  {
    id: 'att_3',
    userId: 'mousavi',
    date: '۱۴۰۵/۰۴/۰۳',
    dayOfWeek: 'شنبه',
    checkIn: '۰۹:۱۵', // 75 mins late -> 1.25 hours
    checkOut: '۱۶:۳۰', // 30 mins early exit
    status: 'late',
    delayMinutes: 75,
    earlyDepartureMinutes: 30,
    leaveType: null,
    overtimeMinutes: 0,
    scoreDeducted: 2,
    calculatedScore: 98
  }
];

// Preset Evaluaton Indices per Employee
export const INITIAL_EVALUATIONS: Record<string, PerformanceEvaluation> = {
  'ataei': { userId: 'ataei', month: '۱۴۰۵/۰۳', discipline: 98, presence: 97, taskQuality: 96, innovation: 92, profitability: 85, responsibility: 98, teamwork: 95, communication: 98, speed: 96, overall: 96 },
  'zargar': { userId: 'zargar', month: '۱۴۰۵/۰۳', discipline: 92, presence: 94, taskQuality: 88, innovation: 80, profitability: 60, responsibility: 94, teamwork: 90, communication: 92, speed: 90, overall: 89 },
  'ghorbi': { userId: 'ghorbi', month: '۱۴۰۵/۰۳', discipline: 99, presence: 99, taskQuality: 98, innovation: 90, profitability: 75, responsibility: 99, teamwork: 92, communication: 95, speed: 95, overall: 97 },
  'marziyeh': { userId: 'marziyeh', month: '۱۴۰۵/۰۳', discipline: 96, presence: 98, taskQuality: 94, innovation: 85, profitability: 50, responsibility: 97, teamwork: 96, communication: 94, speed: 96, overall: 95 },
  'mousavi': { userId: 'mousavi', month: '۱۴۰۵/۰۳', discipline: 90, presence: 92, taskQuality: 85, innovation: 78, profitability: 70, responsibility: 90, teamwork: 94, communication: 88, speed: 88, overall: 87 },
  'zarrabi': { userId: 'zarrabi', month: '۱۴۰۵/۰۳', discipline: 95, presence: 96, taskQuality: 92, innovation: 82, profitability: 65, responsibility: 95, teamwork: 92, communication: 90, speed: 92, overall: 93 },
  'rahimi': { userId: 'rahimi', month: '۱۴۰۵/۰۳', discipline: 94, presence: 95, taskQuality: 93, innovation: 84, profitability: 92, responsibility: 96, teamwork: 94, communication: 92, speed: 92, overall: 94 },
  'yoosefi': { userId: 'yoosefi', month: '۱۴۰۵/۰۳', discipline: 97, presence: 98, taskQuality: 95, innovation: 88, profitability: 70, responsibility: 98, teamwork: 93, communication: 94, speed: 95, overall: 96 },
  'fallahzadeh': { userId: 'fallahzadeh', month: '۱۴۰۵/۰۳', discipline: 93, presence: 94, taskQuality: 91, innovation: 94, profitability: 88, responsibility: 94, teamwork: 92, communication: 91, speed: 92, overall: 93 }
};
