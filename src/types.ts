/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FinancialInfo {
  baseSalary: number; // حقوق پایه (تومان)
  benefits: number; // مزایا (تومان)
  bonus: number; // پاداش (تومان)
  commission: number; // پورسانت (تومان)
  deductions: number; // کسورات (تومان)
}

export interface User {
  id: string;
  name: string;
  position: string; // سمت سازمانی
  employeeCode: string; // کد پرسنلی
  avatar: string; // تصویر پرسنلی
  department: string; // واحد سازمانی
  hireDate: string; // تاریخ استخدام
  phone: string; // شماره تماس
  isWorking: boolean; // وضعیت اشتغال (فعال/غیرفعال)
  financialInfo: FinancialInfo;
  
  // Scoring & Stats
  currentScore: number; // امتیاز فعلی ماه جاری (شروع از 100)
  avgScore: number; // میانگین امتیاز تا تاریخ جاری
  
  // Specific roles
  isAdmin: boolean; // مدیر سیستم (موسوی-وظیفه)
  isOfficeManager: boolean; // مدیر دفتر (خانم عطایی)
  
  password?: string; // رمز عبور برای ورود به سامانه
}

export type AttendanceStatus = 'present' | 'late' | 'early_departure' | 'absent' | 'leave_daily' | 'leave_hourly' | 'weekend' | 'holiday';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // شنبه، یکشنبه، ...
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  status: AttendanceStatus;
  delayMinutes: number; // تأخیر (دقیقه)
  earlyDepartureMinutes: number; // تعجیل خروج (دقیقه)
  leaveType: 'daily' | 'hourly' | null;
  overtimeMinutes: number; // اضافه کاری (دقیقه)
  scoreDeducted: number; // امتیاز کسر شده
  calculatedScore: number; // امتیاز باقی‌مانده از 100
  
  // GPS/Verification fields
  latitude?: number;
  longitude?: number;
  locationName?: string;
  locationDescription?: string; // Manual description fallback
  isLocationCorrected?: boolean;
  isLocationDiscrepancy?: boolean;
  locationApprovalStatus?: 'pending' | 'approved' | 'rejected';
  correctedBy?: string; // ID of Office Manager who corrected it
}

export type TaskStatus = 'new' | 'in_progress' | 'pending_approval' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignees: string[]; // User IDs
  priority: TaskPriority;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  status: TaskStatus | 'pending_internal_approval' | 'rejected_by_internal';
  progress: number; // 0 to 100
  attachmentName?: string;
  resultText?: string;
  resultAttachment?: string;
  
  // Approvals & Delegation
  requireApproval: boolean; // وظایف نیازمند تایید مدیر
  reminderSetting: '2_days' | 'weekly' | '2_weeks' | 'custom';
  createdAt: string;
  
  // Team Tasks Specifics
  isTeamTask: boolean; // وظیفه تیمی
  teamLeaderId?: string; // مسئول بخش
  teamContributions?: Record<string, number>; // سهم هر فرد در پروژه (درصد)
  teamRatings?: Record<string, number>; // امتیاز اختصاصی فرد در تیم
  
  // Crew and modification fields
  creatorId?: string;
  modificationRequest?: string; // "درخواست اصلاح" by staff
  modificationRequestStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string; // Manager's rejection comment
  voiceNoteUrl?: string; // Microphone voice note attach URL
}

export interface WorkflowStep {
  name: string; // نام مرحله مثلا "تایید کارخانه"
  role: string; // سمت مسئول مرحله
  assigneeName: string; // نام پرسنل
  status: 'pending' | 'approved' | 'rejected';
  updateTime?: string;
  comment?: string;
}

export interface WorkflowInstance {
  id: string;
  title: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  filePath?: string;
  status: 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  history: {
    stepIndex: number;
    action: 'approved' | 'rejected' | 'initiated';
    user: string;
    comment: string;
    time: string;
  }[];
}

export interface CommercialRecord {
  id: string;
  userId: string;
  userName: string;
  userPosition: string;
  type: 'purchase' | 'sale' | 'customer_intro' | 'participation'; // خرید، فروش، معرفی مشتری، مشارکت در معامله
  title: string;
  details: string;
  tonnage: number; // تناژ
  value: number; // مبلغ معامله (تومان)
  commissionAmount: number; // پورسانت تعلق گرفته (تومان)
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  createdAt: string;
  isConfidential: boolean; // گزارش محرمانه
  isRead: boolean;
  type: 'message' | 'suggestion' | 'confidential' | 'request';
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  type: 'idea' | 'process_improvement' | 'saving' | 'commercial' | 'other'; // ایده، بهبود فرآیند، کاهش هزینه، فرصت تجاری، غیره
  status: 'pending' | 'approved' | 'rejected';
  bonusReward: number; // پاداش نقدی تخصیص‌یافته
  createdAt: string;
  reviewComment?: string;
}

export interface TaskTransferRequest {
  id: string;
  taskId: string;
  taskTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface BankingRecord {
  id: string;
  title: string;
  amount: number;
  registeredByUserId: string;
  registeredByUserName: string;
  registrationDate: string;
  status: 'office_manager_sent' | 'ceo_approved' | 'executed' | 'rejected';
  comments?: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  triggerEvent: string; // e.g., 'CASH_PURCHASE'
  actionType: string; // e.g., 'AUTO_ROUTE_TO_OFFICE_MANAGER'
  isActive: boolean;
  descr: string;
}

export interface SystemAlert {
  id: string;
  userId: string; // Trigger/Receiver ID
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface PerformanceEvaluation {
  userId: string;
  month: string; // YYYY-MM
  discipline: number; // انضباط (1-100)
  presence: number; // حضور و غیاب (1-100) - auto calculated from attendance
  taskQuality: number; // کیفیت انجام امور (1-100) - auto average of tasks
  innovation: number; // نوآوری (1-100)
  profitability: number; // سودآوری (1-100)
  responsibility: number; // مسئولیت‌پذیری (1-100)
  teamwork: number; // همکاری تیمی (1-100)
  communication: number; // ارتباطات سازمانی (1-100)
  speed: number; // سرعت انجام کار (1-100)
  overall: number; // عملکرد کلی (درج توسط مدیر)
}

// ----------------------------------------
// New Modules Interfaces
// ----------------------------------------

export interface AttendanceCorrectionRequest {
  id: string;
  userId: string;
  userName: string;
  date: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionComment?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'daily' | 'hourly';
  leaveCategory?: 'earned' | 'sick' | 'unpaid'; // استحقاقی، استعلاجی، بدون حقوق
  startDate: string; // Solar date Pop-up selection
  endDate?: string;  // For daily
  startTime?: string; // For hourly
  endTime?: string;   // For hourly
  reason: string;
  status: 'pending' | 'pending_admin' | 'approved' | 'rejected'; // workflow status
  rejectionComment?: string;
  createdAt: string;
  sentToPayroll: boolean; // Automatic notification or transfer
  substituteId?: string; // جانشین
  substituteName?: string;
  attachmentName?: string; // گواهی پزشکی یا پیوست دیگر
}

export interface MissionRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'daily' | 'hourly';
  subType?: 'intra_city' | 'inter_city' | 'abroad'; // ساعتی (درون‌شهری) / روزانه (بین‌شهری / خارجی)
  date: string; // Solar date selection
  endDate?: string; // For daily missions
  startTime?: string;
  endTime?: string;
  location: string; // آدرس دقیق محل ماموریت
  destinationCompany?: string; // نام سازمان یا شرکت مقصد
  approximateGps?: string; // مختصات تقریبی محل ماموریت
  reason: string; // هدف و شرح ماموریت
  budget?: number; // بودجه و تنخواه پیش‌بینی‌شده (تومان)
  vehicleType?: 'personal' | 'company' | 'public'; // وسیله نقلیه
  status: 'pending' | 'pending_admin' | 'approved' | 'rejected'; // workflow status
  rejectionComment?: string;
  createdAt: string;
  sentToPayroll: boolean; // Transmitted to payroll system
  reportContent?: string; // گزارش دستاوردهای ماموریت (پس از اتمام تاریخ ماموریت)
  isReportSubmitted?: boolean;
}

export interface EmergencyHoliday {
  id: string;
  date: string; // YYYY-MM-DD or Solar Date
  title: string;
  declaredBy: string; // User ID (office manager)
  createdAt: string;
}

export interface CompanyDocument {
  id: string;
  title: string;
  description: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  fileName: string;
  createdAt: string;
  
  // Two-phase approval status
  status: 'pending_internal' | 'pending_admin' | 'approved' | 'rejected';
  internalApproverId?: string;
  adminApproverId?: string;
  rejectionComment?: string;
  
  // Escrow / Loan (امانت‌دهی)
  isEscrow: boolean;
  escrowBorrower?: string;
  escrowReturnDate?: string;
  escrowImportance?: string;
  escrowStatus?: 'pending_approval' | 'borrowed' | 'pending_return' | 'returned' | 'rejected';
  escrowActualReturnDate?: string;
}

export interface DailyPrayer {
  id: string;
  userId?: string;
  userName: string;
  text: string;
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface DailyPerformanceReport {
  id: string;
  userId: string;
  userName: string;
  date: string; // Solar date
  content: string; // Tasks and works completed
  createdAt: string;
}
