/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Task, TaskPriority, TaskStatus, TaskTransferRequest } from '../types';
import { toPersianDigits } from '../utils';
import { 
  Plus, Calendar, Flag, UserCheck, AlertCircle, CheckCircle2, Archive, Loader, 
  Paperclip, Send, ArrowRightLeft, ShieldAlert, Sparkles, X, ChevronDown, Check,
  Mic, Square, Trash2, Volume2
} from 'lucide-react';
import { motion } from 'motion/react';

interface TaskModuleProps {
  currentUser: User;
  allUsers: User[];
  allTasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (taskId: string, updated: Partial<Task>) => void;
  onSubmitTaskResult: (taskId: string, text: string, attachmentName?: string, voiceNoteUrl?: string) => void;
  onRequestTransfer: (taskId: string, toUserId: string, reason: string) => void;
  isDelegatedToOfficeManager: boolean;
}

export default function TaskModule({
  currentUser,
  allUsers,
  allTasks,
  onAddTask,
  onUpdateTask,
  onSubmitTaskResult,
  onRequestTransfer,
  isDelegatedToOfficeManager,
}: TaskModuleProps) {
  
  // Custom Filters for tasks list
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  // Trigger forms triggers
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  
  // Create New Task Form Inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescr, setTaskDescr] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDeadline, setTaskDeadline] = useState('۱۴۰۵/۰۴/۱۰');
  const [requireApproval, setRequireApproval] = useState(true);
  const [reminderSetting, setReminderSetting] = useState<'2_days' | 'weekly' | '2_weeks' | 'custom'>('2_days');
  const [isTeamTask, setIsTeamTask] = useState(false);
  const [teamLeader, setTeamLeader] = useState('');

  // Individual Contributions State for Team Task
  const [contributions, setContributions] = useState<Record<string, number>>({});

  // Interactivity Actions per task
  const [activeTaskInteractId, setActiveTaskInteractId] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState(50);
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('task_report_drafts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [resultAttach, setResultAttach] = useState('');

  // Voice Recording States
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string>('');
  const [recordingTimer, setRecordingTimer] = useState<any>(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("مرورگر شما از قابلیت ضبط صدا پشتیبانی نمی‌کند یا دسترسی مسدود است.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const localChunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          localChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(localChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedVoiceUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (err) {
      console.error("خطا در ضبط صدا:", err);
      alert("امکان دسترسی به میکروفون وجود ندارد. لطفا دسترسی‌ها را بررسی نمایید.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const discardRecording = () => {
    setRecordedVoiceUrl('');
    setIsRecording(false);
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    setRecordingDuration(0);
    setMediaRecorder(null);
  };
  
  // Delegation Transfer Inputs
  const [showTransferFormTaskId, setShowTransferFormTaskId] = useState<string | null>(null);
  const [transferTargetUser, setTransferTargetUser] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Task Editing & Modification request states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescr, setEditDescr] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editDeadline, setEditDeadline] = useState('');
  
  // Modification request texts from normal staff
  const [modRequestText, setModRequestText] = useState<Record<string, string>>({});
  const [showModInputId, setShowModInputId] = useState<string | null>(null);

  // Checks
  const isAdminOrDelegated = currentUser.isAdmin || (isDelegatedToOfficeManager && currentUser.isOfficeManager);

  // Filter tasks based on role: Admin/Manager sees ALL, staff sees only their assigned ones or team tasks they are part of
  const visibleTasks = allTasks.filter((task) => {
    const matchesUser = isAdminOrDelegated || task.assignees.includes(currentUser.id) || task.teamLeaderId === currentUser.id || task.creatorId === currentUser.id;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter || 
      (statusFilter === 'new' && task.status === 'pending_internal_approval'); // map pending internal as part of view if needed, or filter explicitly
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesUser && matchesStatus && matchesPriority;
  });

  const handleCheckboxAssignee = (userId: string) => {
    if (selectedAssignees.includes(userId)) {
      setSelectedAssignees(selectedAssignees.filter((id) => id !== userId));
      const nextConts = { ...contributions };
      delete nextConts[userId];
      setContributions(nextConts);
    } else {
      setSelectedAssignees([...selectedAssignees, userId]);
      // Seed default contribution
      setContributions({ ...contributions, [userId]: 10 });
    }
  };

  const updateContribValue = (userId: string, value: number) => {
    setContributions({ ...contributions, [userId]: value });
  };

  const handleTaskSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDescr || selectedAssignees.length === 0) return;

    // Normalizing contributions to ensure they sum to 100 or represent accurate shares
    const finalContributions: Record<string, number> = {};
    if (isTeamTask) {
      selectedAssignees.forEach((uid) => {
        finalContributions[uid] = contributions[uid] || Math.round(100 / selectedAssignees.length);
      });
    }

    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      title: taskTitle,
      description: taskDescr,
      assignees: selectedAssignees,
      priority: taskPriority,
      startDate: '۱۴۰۵/۰۴/۰۳',
      deadline: taskDeadline,
      status: 'new',
      progress: 0,
      requireApproval: requireApproval,
      reminderSetting: reminderSetting,
      createdAt: '۱۴۰۵/۰۴/۰۳',
      isTeamTask: isTeamTask,
      teamLeaderId: isTeamTask ? (teamLeader || selectedAssignees[0]) : undefined,
      teamContributions: isTeamTask ? finalContributions : undefined,
      teamRatings: isTeamTask ? selectedAssignees.reduce((acc, current) => ({ ...acc, [current]: 100 }), {}) : undefined
    };

    onAddTask(newTask);
    setShowAddTaskForm(false);
    
    // Clear Form Fields
    setTaskTitle('');
    setTaskDescr('');
    setSelectedAssignees([]);
    setTaskPriority('medium');
    setIsTeamTask(false);
    setTeamLeader('');
    setContributions({});
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header controls and filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900">سامانه متمرکز تخصیص وظایف و کنترل پیشرفت تیمی</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">کنترل همزمان وظایف چند نفره، مشخص کردن سهم اعضا و بررسی آلارم‌های دیرکرد</p>
        </div>

        {/* Filters and Add btn */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs p-2 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
          >
            <option value="all">کلیه وضعیت‌ها</option>
            <option value="new">جدید</option>
            <option value="in_progress">در حال انجام</option>
            <option value="pending_approval">در انتظار تایید مدیر</option>
            <option value="completed">تکمیل شده</option>
            <option value="archived">بایگانی شده</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e: any) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs p-2 focus:outline-none focus:ring-1 focus:ring-brand-cyan"
          >
            <option value="all">کلیه اولویت‌ها</option>
            <option value="high">اولویت بالا/فوری</option>
            <option value="medium">اولویت متوسط</option>
            <option value="low">اولویت پایین</option>
          </select>

          <button
            onClick={() => setShowAddTaskForm(true)}
            className="bg-brand-cyan hover:bg-blue-600 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-reverse space-x-1.5"
            id="define_task_btn"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف وظیفه جدید</span>
          </button>

        </div>
      </div>

      {/* 2. TASK ITEMS GRID */}
      {visibleTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xs font-black text-slate-700">هیچ وظیفه‌ای یافت نشد</h3>
          <p className="text-[10px] text-slate-400 mt-1">وظیفه‌ای با شرایط مورد نظر به شما ارجاع داده نشده یا تایید نگردیده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleTasks.map((task) => {
            const isCollaborative = task.isTeamTask;
            const isPendingApproval = task.status === 'pending_approval';
            const isCompletedOrArchived = task.status === 'completed' || task.status === 'archived';

            // ---------------------------------------------
            // Inline Editor for Admin / Internal Manager
            // ---------------------------------------------
            if (editingTaskId === task.id) {
              return (
                <div key={task.id} className="bg-white rounded-3xl p-6 border-2 border-brand-cyan shadow-lg text-right text-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-800 border-b pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-cyan" />
                    <span>ویرایش کامل فرآیند (پنل مدیریت)</span>
                  </h4>
                  
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">عنوان جدید وظیفه</label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">توضیحات و شرح فعالیت</label>
                    <textarea 
                      value={editDescr}
                      onChange={(e) => setEditDescr(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 h-20 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">اولویت</label>
                      <select 
                        value={editPriority}
                        onChange={(e: any) => setEditPriority(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      >
                        <option value="low">کم / عادی</option>
                        <option value="medium">متوسط</option>
                        <option value="high">بالا / فوری</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">مهلت نهایی</label>
                      <input 
                        type="text"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-black text-center text-slate-800 focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onUpdateTask(task.id, {
                          title: editTitle,
                          description: editDescr,
                          priority: editPriority,
                          deadline: editDeadline
                        });
                        setEditingTaskId(null);
                      }}
                      className="bg-brand-cyan hover:bg-blue-600 text-white font-black text-[11px] py-2 px-4 rounded-xl cursor-pointer transition-colors"
                    >
                      ذخیره تغییرات
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] py-2 px-4 rounded-xl cursor-pointer transition-colors"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={task.id} 
                className={`bg-white rounded-3xl p-5 border shadow-sm transition-all relative flex flex-col justify-between ${
                  task.priority === 'high' ? 'border-r-8 border-r-rose-500 border-slate-100' : 'border-slate-100'
                } hover:shadow-md`}
              >
                
                {/* Upper badges details */}
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-black ${
                      task.priority === 'high' ? 'bg-rose-50 text-rose-600' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {task.priority === 'high' ? 'ضروری / فوری' : task.priority === 'medium' ? 'متوسط' : 'عادی'}
                    </span>

                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold ${
                      task.status === 'new' ? 'bg-blue-50 text-blue-600 animate-pulse' :
                      task.status === 'in_progress' ? 'bg-emerald-50 text-emerald-600' :
                      task.status === 'pending_approval' ? 'bg-yellow-50 text-yellow-600 animate-pulse' :
                      task.status === 'pending_internal_approval' ? 'bg-indigo-50 text-indigo-600 animate-pulse font-black' :
                      task.status === 'rejected_by_internal' ? 'bg-rose-100 text-rose-700 font-black' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {task.status === 'new' ? 'جدید' :
                       task.status === 'in_progress' ? 'در حال انجام' :
                       task.status === 'pending_approval' ? 'در انتظار تایید مدیر سیستم' :
                       task.status === 'pending_internal_approval' ? 'منتظر تایید مدیر داخلی' :
                       task.status === 'rejected_by_internal' ? 'رد شده توسط مدیر داخلی' :
                       task.status === 'completed' ? 'تکمیل شده' : 'بایگانی در آرشیو'}
                    </span>
                  </div>

                  {/* Title and descriptions */}
                  <h3 className="text-xs font-black text-slate-900 mt-3">{task.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-1.5 border-b border-rose-50/50 pb-3">
                    <span className="text-[10px] text-slate-400 font-bold">مجریان ابلاغی:</span>
                    {task.assignees.map((uid) => {
                      const userObj = allUsers.find(u => u.id === uid);
                      return (
                        <span key={uid} className="bg-slate-100 text-[10px] text-slate-700 font-bold py-0.5 px-2.5 rounded-full border border-slate-200">
                          {userObj?.name}
                        </span>
                      );
                    })}
                  </div>

                  {/* Team specifications / sهم هر فرد "نمایش سهم هر فرد در پروژه" */}
                  {isCollaborative && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-3.5 space-y-2 text-[10px]">
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="font-extrabold text-brand-cyan">پیشرفت تیمی پروژه</span>
                        <span>مسئول بخش: {allUsers.find(u=>u.id===task.teamLeaderId)?.name || 'تعیین نشده'}</span>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <span className="text-slate-400 font-bold">سهم و حضور مجزا در پروژه:</span>
                        <div className="grid grid-cols-2 gap-2 mt-1 font-bold text-slate-700">
                          {Object.entries(task.teamContributions || {}).map(([uid, share]) => {
                            const uObj = allUsers.find(u=>u.id===uid);
                            return (
                              <div key={uid} className="flex justify-between bg-white px-2 py-1 rounded border border-slate-200">
                                <span>{uObj?.name}:</span>
                                <span>{toPersianDigits(share)}٪</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task Progress Bar */}
                  <div className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-400 font-bold">
                      <span>میزان فرآیند کاری انجام‌شده</span>
                      <span className="text-brand-cyan">{toPersianDigits(task.progress)}٪</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-cyan to-blue-500 h-2 rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>

                  {/* Attachment indicator */}
                  {task.attachmentName && (
                    <div className="mt-3 flex items-center space-x-reverse space-x-1.5 text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>پیوست انبار: {task.attachmentName}</span>
                    </div>
                  )}

                  {/* Deadlines and settings */}
                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-reverse space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span>مهلت نهایی: {task.deadline}</span>
                    </span>
                    <span>هشدار هوشمند: {task.reminderSetting === '2_days' ? '۲ روزه' : task.reminderSetting === 'weekly' ? 'هفتگی' : 'ثبت سفارشی'}</span>
                  </div>

                  {/* Submission output result log if existing */}
                  {task.resultText && (
                    <div className="mt-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs space-y-2">
                      <span className="font-bold text-slate-900 block">گزارش ارسالی مجری:</span>
                      <p className="text-slate-600 mt-1">{task.resultText}</p>
                      {task.voiceNoteUrl && (
                        <div className="mt-2.5 p-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                            <Mic className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                            <span>گزارش صوتی ضمیمه:</span>
                          </span>
                          <audio controls src={task.voiceNoteUrl} className="h-8 max-w-[200px]" />
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Operations area */}
                <div className="mt-5 border-t border-slate-50 pt-4 flex flex-col gap-2">
                  
                  {/* Swap delegation triggers button */}
                  {!isCompletedOrArchived && task.assignees.includes(currentUser.id) && (
                    <button
                      onClick={() => {
                        setShowTransferFormTaskId(showTransferFormTaskId === task.id ? null : task.id);
                        setTransferTargetUser('');
                        setTransferReason('');
                      }}
                      className="text-[10px] text-brand-cyan hover:underline flex items-center space-x-reverse space-x-1.5 self-start cursor-pointer font-bold"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>درخواست انتقال وظیفه به شخص دیگر</span>
                    </button>
                  )}

                  {/* Transfer Form slide-in */}
                  {showTransferFormTaskId === task.id && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 mt-2">
                      <label className="text-[9px] font-bold text-slate-500 block">انتخاب همکار جایگزین</label>
                      <select
                        value={transferTargetUser}
                        onChange={(e: any) => setTransferTargetUser(e.target.value)}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      >
                        <option value="">-- انتخاب کنید --</option>
                        {allUsers.filter(u => u.id !== currentUser.id && u.isWorking).map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="علت ارجاع (مثلا جابجایی واحد)"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                      />

                      {transferSuccess && (
                        <p className="text-[9px] text-emerald-600 font-bold">درخواست ارسالی با موفقیت ثبت شد</p>
                      )}

                      <button
                        onClick={() => {
                          if (!transferTargetUser || !transferReason) return;
                          onRequestTransfer(task.id, transferTargetUser, transferReason);
                          setTransferSuccess(true);
                          setTimeout(() => {
                            setTransferSuccess(false);
                            setShowTransferFormTaskId(null);
                          }, 3000);
                        }}
                        className="bg-brand-navy text-white text-[10px] font-bold py-1 px-3 rounded-lg cursor-pointer hover:bg-slate-800 transition-all block text-center"
                      >
                        ثبت درخواست انتقال وظیفه
                      </button>
                    </div>
                  )}

                  {/* Progress interaction buttons for assigned personnel */}
                  {!isCompletedOrArchived && task.assignees.includes(currentUser.id) && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3.5 mt-2 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-600">گزارش پیشرفت فیزیکی کار (درصد):</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressVal}
                          onChange={(e) => {
                            setProgressVal(Number(e.target.value));
                            onUpdateTask(task.id, { progress: Number(e.target.value) });
                          }}
                          className="w-1/2 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <textarea
                          placeholder="جزئیات خروجی کار را مکتوب کنید..."
                          value={resultDrafts[task.id] || ''}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setResultDrafts(prev => {
                              const updated = { ...prev, [task.id]: newVal };
                              localStorage.setItem('task_report_drafts', JSON.stringify(updated));
                              return updated;
                            });
                          }}
                          className="w-full bg-white p-2 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-12"
                        />
                        {(resultDrafts[task.id] || '').trim().length > 0 && (
                          <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 transition-all animate-fadeIn">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>پیش‌نویس گزارش به‌صورت خودکار در مرورگر شما ذخیره شد.</span>
                          </div>
                        )}
                      </div>

                      {/* MICROPHONE VOICE RECORDER ELEMENT */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-700 flex items-center gap-1">
                            <Mic className="w-3.5 h-3.5 text-rose-500" />
                            <span>ضبط گزارش صوتی با میکروفون (Voice Note):</span>
                          </span>
                          {isRecording && (
                            <span className="text-[10px] text-rose-600 font-bold animate-pulse flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full">
                              🔴 {toPersianDigits(Math.floor(recordingDuration / 60))}:{toPersianDigits(recordingDuration % 60 < 10 ? '0' + (recordingDuration % 60) : recordingDuration % 60)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          {!isRecording && !recordedVoiceUrl && (
                            <button
                              onClick={startRecording}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              <span>شروع ضبط گزارش صوتی</span>
                            </button>
                          )}

                          {isRecording && (
                            <button
                              onClick={stopRecording}
                              className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              <Square className="w-3 h-3 text-white fill-white" />
                              <span>توقف و ذخیره ضبط</span>
                            </button>
                          )}

                          {recordedVoiceUrl && (
                            <div className="w-full space-y-2">
                              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-brand-cyan" />
                                  <span className="text-[10px] text-slate-600 font-bold">صوت آماده ارسال است:</span>
                                </div>
                                <button
                                  onClick={discardRecording}
                                  className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>حذف و ضبط مجدد</span>
                                </button>
                              </div>
                              <audio src={recordedVoiceUrl} controls className="w-full h-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const currentText = resultDrafts[task.id] || '';
                          if (!currentText) return;
                          onSubmitTaskResult(task.id, currentText, resultAttach || undefined, recordedVoiceUrl || undefined);
                          
                          // Clear draft from state and localStorage
                          setResultDrafts(prev => {
                            const updated = { ...prev };
                            delete updated[task.id];
                            localStorage.setItem('task_report_drafts', JSON.stringify(updated));
                            return updated;
                          });
                          setRecordedVoiceUrl('');
                          setProgressVal(100);
                        }}
                        className="bg-brand-cyan hover:bg-blue-600 text-white text-xs py-2 rounded-xl font-black w-full text-center cursor-pointer transition-colors"
                      >
                        ثبت گزارش نهایی و ارسال جهت تایید رئیس
                      </button>
                    </div>
                  )}

                  {/* APPROVAL AREA FOR MANAGER */}
                  {isAdminOrDelegated && isPendingApproval && (
                    <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-250 flex items-center justify-between gap-4 mt-2">
                      <p className="text-[10px] text-yellow-850 font-bold">
                        کارمند وظیفه را تکمیل کرده و منتظر بازبینی و بسته‌شدن نهایی در پرونده پرسنلی است.
                      </p>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onUpdateTask(task.id, { status: 'completed' })}
                          className="bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-[10px] py-1.5 px-3 rounded-xl cursor-pointer"
                        >
                          تایید و ثبت آرشیو
                        </button>
                        <button
                          onClick={() => onUpdateTask(task.id, { status: 'in_progress' })}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold border border-rose-200 text-[10px] py-1.5 px-3 rounded-xl cursor-pointer"
                        >
                          نیاز به اصلاح
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------
                      NEW: WORKFLOW MANAGER APPROVALS FOR INTERNAL TASK CREATIONS
                     --------------------------------------------- */}
                  {task.status === 'pending_internal_approval' && isAdminOrDelegated && (
                    <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-150 space-y-2 mt-2 text-right">
                      <span className="text-[10px] font-black text-indigo-800 block">بررسی و تصویب وظیفه ارجاعی جدید (مدیریت):</span>
                      <p className="text-[10px] text-slate-500">این کار توسط پرسنل عادی ثبت شده و جهت انطباق با چرخه‌های جاری، نیاز به تنفیذ دارد.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateTask(task.id, { status: 'new' })}
                          className="flex-1 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-black text-[10px] py-2 rounded-xl cursor-pointer text-center"
                        >
                          تایید و انتشار کار
                        </button>
                        <button
                          onClick={() => {
                            const comment = prompt('علت عدم تایید کار ارجاعی را بنویسید:') || 'عدم انطباق با اهداف جاری';
                            onUpdateTask(task.id, { status: 'rejected_by_internal', rejectionReason: comment });
                          }}
                          className="flex-1 bg-rose-650 hover:bg-rose-700 bg-rose-600 text-white font-black text-[10px] py-2 rounded-xl cursor-pointer text-center"
                        >
                          رد و خروج از چرخه
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------
                      NEW: MODIFICATION REQUEST WORKFLOWS (درخواست اصلاح)
                     --------------------------------------------- */}
                  {task.modificationRequest && (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 mt-2 text-right text-[10px]">
                      <span className="font-extrabold text-amber-700 block">درخواست اصلاح ثبت شده پرسنل:</span>
                      <p className="text-slate-650 italic">«{task.modificationRequest}»</p>
                      
                      {isAdminOrDelegated ? (
                        <div className="flex gap-1.5 pt-1.5 border-t border-slate-200">
                          <button
                            onClick={() => {
                              // Clear the modification request, set status to pending approval or allow inline edit
                              setEditingTaskId(task.id);
                              setEditTitle(task.title);
                              setEditDescr(task.description);
                              setEditPriority(task.priority);
                              setEditDeadline(task.deadline);
                              onUpdateTask(task.id, { modificationRequest: undefined, modificationRequestStatus: 'approved' });
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                          >
                            موافقت و باز کردن ویرایشگر
                          </button>
                          <button
                            onClick={() => {
                              onUpdateTask(task.id, { modificationRequest: undefined, modificationRequestStatus: 'rejected' });
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[9px] font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                          >
                            رد درخواست اصلاح
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">
                          {task.modificationRequestStatus === 'pending' ? '⌛ در انتظار تایید مدیر داخلی...' : 'بررسی شده'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ---------------------------------------------
                      NEW: FULL EDITING OR MODIFICATION BUTTONS
                     --------------------------------------------- */}
                  <div className="mt-2 pt-2 border-t border-slate-105 flex justify-between items-center">
                    {isAdminOrDelegated ? (
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditTitle(task.title);
                          setEditDescr(task.description);
                          setEditPriority(task.priority);
                          setEditDeadline(task.deadline);
                        }}
                        className="text-[10px] text-brand-cyan hover:underline cursor-pointer font-black flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ویرایش کل فرآیند</span>
                      </button>
                    ) : (
                      !isCompletedOrArchived && !task.modificationRequest && (
                        <div className="w-full space-y-2 text-right">
                          {showModInputId === task.id ? (
                            <div className="space-y-1.5">
                              <textarea
                                placeholder="مورد پیشنهادی جهت اصلاح (تمدید زمان، تغییر شرح، ...) را اینجا بنویسید..."
                                value={modRequestText[task.id] || ''}
                                onChange={(e) => setModRequestText({ ...modRequestText, [task.id]: e.target.value })}
                                className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-cyan"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const req = modRequestText[task.id];
                                    if (!req) return;
                                    onUpdateTask(task.id, {
                                      modificationRequest: req,
                                      modificationRequestStatus: 'pending'
                                    });
                                    setShowModInputId(null);
                                  }}
                                  className="bg-brand-cyan hover:bg-blue-600 text-white text-[9px] font-black py-1.5 px-3 rounded-lg cursor-pointer"
                                >
                                  ثبت درخواست اصلاح
                                </button>
                                <button
                                  onClick={() => setShowModInputId(null)}
                                  className="bg-slate-100 text-slate-500 text-[9px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                                >
                                  انصراف
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowModInputId(task.id)}
                              className="text-[10px] text-amber-600 hover:underline cursor-pointer font-bold flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>درخواست اصلاح به مدیر داخلی</span>
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Archived triggers for completed tasks */}
                  {isAdminOrDelegated && task.status === 'completed' && (
                    <button
                      onClick={() => onUpdateTask(task.id, { status: 'archived' })}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center space-x-reverse space-x-1 w-full mt-2"
                    >
                      <Archive className="w-4 h-4" />
                      <span>انتقال به بایگانی اسناد خاتمه‌یافته</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DEFINING THE ADD TASK DIALOG FOR ADMIN */}
      {showAddTaskForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddTaskForm(false)}
              className="absolute top-4 left-4 bg-slate-105 p-2 rounded-full cursor-pointer hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            <h3 className="text-xs font-black text-slate-900 pb-3 border-b border-slate-100">تعریف وظیفه سازمانی و ایجاد ساختار تیمی</h3>
            <form onSubmit={handleTaskSubmission} className="space-y-4 mt-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">عنوان وظیفه ارجاعی</label>
                  <input
                    type="text"
                    required
                    placeholder="فروش نقدی، انبارگردانی، تست متالوگرافی..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">شرح کامل ماموریت و مستندات انبارگردانی</label>
                <textarea
                  required
                  placeholder="شرح دقیق فعالیت..."
                  value={taskDescr}
                  onChange={(e) => setTaskDescr(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-brand-cyan focus:outline-none h-20"
                />
              </div>

              {/* Multiple Assignees List */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2.5">انتخاب مجریان و تخصیص سهم در پروژه (یک یا چند نفر)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-36 overflow-y-auto p-1.5 border border-slate-150 rounded-xl">
                  {allUsers.filter(u=> u.id !== 'reza' && u.id !== 'mousavi').map((user) => (
                    <label key={user.id} className="flex items-center space-x-reverse space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(user.id)}
                        onChange={() => handleCheckboxAssignee(user.id)}
                        className="rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan"
                      />
                      <span className="text-[11px] text-slate-700 font-bold">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Collaborative details triggers */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-extrabold text-slate-800">آیا این یک وظیفه تیمی است؟</span>
                    <span className="text-[9px] text-slate-400">امکان مشخص کردن مدیر بخش و سهم اعضا در پیشرفت تیمی</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTeamTask}
                    onChange={(e) => setIsTeamTask(e.target.checked)}
                    className="rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan"
                  />
                </div>

                {isTeamTask && selectedAssignees.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 text-[10px]">
                    <div>
                      <label className="text-slate-500 block mb-1">تعیین مسئول بخش (Leader)</label>
                      <select
                        value={teamLeader}
                        onChange={(e) => setTeamLeader(e.target.value)}
                        className="w-full bg-white p-2 rounded-lg border border-slate-300 focus:outline-none"
                      >
                        <option value="">-- انتخاب کنید --</option>
                        {selectedAssignees.map((uid) => (
                          <option key={uid} value={uid}>{allUsers.find(u=>u.id===uid)?.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <span className="text-slate-500 block font-bold">تسهیم مشارکت مجریان (جمعاً ۱۰۰٪):</span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedAssignees.map((uid) => (
                          <div key={uid} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-250">
                            <span className="font-bold whitespace-nowrap">{allUsers.find(u=>u.id===uid)?.name}:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              required
                              value={contributions[uid] || 0}
                              onChange={(e) => updateContribValue(uid, Number(e.target.value))}
                              className="w-12 text-center border-b border-slate-300 p-0.5 focus:outline-none"
                            />
                            <span>٪</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">اولویت انجام وظیفه</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  >
                    <option value="low">اولویت عادی/کم</option>
                    <option value="medium">اولویت متوسط</option>
                    <option value="high">اولویت بالا/فوری</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">مهلت انجام فرآیند</label>
                  <input
                    type="text"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-center font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold">نیازمند بازبینی و تایید مدیر</span>
                  <input
                    type="checkbox"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="rounded border-slate-300 text-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">فرکانس یادآوری هوشمند آلارم</label>
                  <select
                    value={reminderSetting}
                    onChange={(e: any) => setReminderSetting(e.target.value)}
                    className="w-full bg-white p-1.5 rounded-lg border border-slate-200"
                  >
                    <option value="2_days">هر ۲ روز</option>
                    <option value="weekly">هفتگی</option>
                    <option value="2_weeks">هر ۲ هفته</option>
                    <option value="custom">دستور العمل ویژه</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-cyan hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  ذخیره و تخصیص ماموریت به مجریان
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(false)}
                  className="flex-1 bg-slate-100 text-slate-755 text-xs py-2.5 rounded-xl cursor-pointer"
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
