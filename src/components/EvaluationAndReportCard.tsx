/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Task, PerformanceEvaluation } from '../types';
import { toPersianDigits, formatCurrency, printDocument } from '../utils';
import { Check, Edit3, Award, FileText, BarChart2, Star, ShieldAlert, Sparkles, Printer, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface EvaluationAndReportCardProps {
  currentUser: User;
  allUsers: User[];
  allTasks: Task[];
  evaluations: Record<string, PerformanceEvaluation>;
  onRateEmployee: (userId: string, ratings: Partial<PerformanceEvaluation>) => void;
  isDelegatedToOfficeManager: boolean;
}

export default function EvaluationAndReportCard({
  currentUser,
  allUsers,
  allTasks,
  evaluations,
  onRateEmployee,
  isDelegatedToOfficeManager,
}: EvaluationAndReportCardProps) {

  // Active targets
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ataei');
  const [showRatingEditor, setShowRatingEditor] = useState(false);

  // Form Inputs for Performance Ratings
  const [disc, setDisc] = useState(95);
  const [inno, setInno] = useState(85);
  const [profit, setProfit] = useState(80);
  const [resp, setResp] = useState(95);
  const [teamw, setTeamw] = useState(90);
  const [comm, setComm] = useState(92);
  const [speed, setSpeed] = useState(90);
  const [overall, setOverall] = useState(95);

  const isAdminOrDelegated = currentUser.isAdmin || (isDelegatedToOfficeManager && currentUser.isOfficeManager);

  // Active Target Employee
  const targetUserObj = allUsers.find(u => u.id === selectedStaffId) || allUsers[1];

  // Retrieve or fallback evaluation metrics
  const targetEval: PerformanceEvaluation = evaluations[targetUserObj.id] || {
    userId: targetUserObj.id,
    month: '۱۴۰۵/۰۳',
    discipline: 90,
    presence: 90,
    taskQuality: 90,
    innovation: 80,
    profitability: 70,
    responsibility: 90,
    teamwork: 90,
    communication: 90,
    speed: 90,
    overall: 90
  };

  // Auto-calculated Task Quality score: Average of their completed tasks progress/ratings
  const personalTasks = allTasks.filter(t => t.assignees.includes(targetUserObj.id));
  const completedPersonalTasks = personalTasks.filter(t => t.status === 'completed' || t.status === 'archived');
  let calculatedTaskQuality = 100;
  if (completedPersonalTasks.length > 0) {
    const sum = completedPersonalTasks.reduce((acc, current) => acc + current.progress, 0);
    calculatedTaskQuality = Math.round(sum / completedPersonalTasks.length);
  } else {
    calculatedTaskQuality = 90; // Fallback seed
  }

  // Attendance average is calculated based on user's current attendance scores
  const calculatedPresence = targetUserObj.currentScore;

  // Final Overall Composite Rating Formula
  const compositeFinalScore = Math.round(
    (targetEval.discipline * 0.1) +
    (calculatedPresence * 0.15) +
    (calculatedTaskQuality * 0.2) +
    (targetEval.innovation * 0.1) +
    (targetEval.profitability * 0.1) +
    (targetEval.responsibility * 0.1) +
    (targetEval.teamwork * 0.1) +
    (targetEval.communication * 0.05) +
    (targetEval.speed * 0.1)
  );

  // Auto bonus threshold logic based on performance
  const allocatedBonus = compositeFinalScore > 95 ? 5000000 : compositeFinalScore > 90 ? 3000000 : compositeFinalScore > 80 ? 1000000 : 0;

  const handleSaveRatings = (e: React.FormEvent) => {
    e.preventDefault();
    onRateEmployee(targetUserObj.id, {
      discipline: Number(disc),
      presence: calculatedPresence,
      taskQuality: calculatedTaskQuality,
      innovation: Number(inno),
      profitability: Number(profit),
      responsibility: Number(resp),
      teamwork: Number(teamw),
      communication: Number(comm),
      speed: Number(speed),
      overall: Number(overall)
    });
    setShowRatingEditor(false);
  };

  const loadCurrentRatingValuesInForm = () => {
    setDisc(targetEval.discipline);
    setInno(targetEval.innovation);
    setProfit(targetEval.profitability);
    setResp(targetEval.responsibility);
    setTeamw(targetEval.teamwork);
    setComm(targetEval.communication);
    setSpeed(targetEval.speed);
    setOverall(targetEval.overall);
    setShowRatingEditor(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Admin Selecter and Intro */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-1000">سامانه جامع ارزیابی عملکرد و صدور کارنامه‌های اداری</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">محاسبه درگاه پاداش‌های فصلی و سالیانه و پایش کیفیت انجام امور</p>
        </div>

        {/* Selected target employee */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">انتخاب پرونده پرسنل:</span>
          <select
            value={selectedStaffId}
            onChange={(e) => {
              setSelectedStaffId(e.target.value);
              setShowRatingEditor(false);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs p-2 focus:outline-none"
          >
            {allUsers.filter(u=> !u.isAdmin).map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. APPRAISAL CRITERIA VISUAL DETAILS AND THE COMPLETED REPORT CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Appraisal indicators list */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm lg:col-span-3 space-y-5">
          <div className="flex justify-between items-center border-b border-rose-50/50 pb-3">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <BarChart2 className="w-5 h-5 text-brand-cyan" />
              <span>آمارهای تخصصی و شاخص‌های ده‌گانه ارزیابی</span>
            </h3>

            {isAdminOrDelegated && !showRatingEditor && (
              <button
                onClick={loadCurrentRatingValuesInForm}
                className="bg-brand-light hover:bg-slate-100 text-brand-navy border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-reverse space-x-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-brand-cyan" />
                <span>ویرایش ارزیابی پرسنل</span>
              </button>
            )}
          </div>

          {showRatingEditor ? (
            <form onSubmit={handleSaveRatings} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mb-2">
                <span className="text-brand-navy font-black block text-[11px] mb-1">ارزیابی خودکار از سیستم کارهای محوله:</span>
                <p className="text-[10px] text-slate-400">
                  امتیاز امور محوله از میانگین فیزیکی تسک‌های تایید شده استخراج می‌شود: <span className="font-extrabold text-slate-800">{toPersianDigits(calculatedTaskQuality)} از ۱۰۰</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  امتیاز حضور و غیاب انضباطی دستگاه نیز به طور خودکار تعیین می‌گردد: <span className="font-extrabold text-slate-800">{toPersianDigits(calculatedPresence)} از ۱۰۰</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pr-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">انضباط دپارتمان (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={disc}
                    onChange={(e) => setDisc(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">سرعت انجام کار (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">نوآوری ایده (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={inno}
                    onChange={(e) => setInno(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">سودآوری تجاری (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={profit}
                    onChange={(e) => setProfit(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">مسئولیت‌پذیری (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={resp}
                    onChange={(e) => setResp(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">همکاری تیمی (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={teamw}
                    onChange={(e) => setTeamw(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ارتباطات سازمانی (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={comm}
                    onChange={(e) => setComm(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">نمره عملکرد کلی مدیرعامل (۱ - ۱۰۰)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={overall}
                    onChange={(e) => setOverall(Number(e.target.value))}
                    className="w-full bg-slate-50 p-2 border border-slate-250 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-cyan text-white text-xs py-2 rounded-xl font-black cursor-pointer"
                >
                  ثبت ارزیابی جدید پرسنل
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingEditor(false)}
                  className="flex-1 bg-slate-100 text-slate-700 text-xs py-2 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : (
            /* Bar indicators parameter display list */
            <div className="space-y-4 text-xs pr-1">
              
              {/* Discipline */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۱. میزان انضباط اداری ستاد</span>
                  <span className="font-extrabold">{toPersianDigits(targetEval.discipline)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-cyan h-2 rounded-full" style={{ width: `${targetEval.discipline}%` }} />
                </div>
              </div>

              {/* Attendance */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۲. حضور و غیاب (کارت حضور انضباطی دستگاه)</span>
                  <span className="font-extrabold text-emerald-600">{toPersianDigits(calculatedPresence)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${calculatedPresence}%` }} />
                </div>
              </div>

              {/* Quality of assigned tasks */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۳. کیفیت انجام امور محوله (محاسبه هوشمند از پیشرفت ماموریت‌ها)</span>
                  <span className="font-extrabold text-blue-600">{toPersianDigits(calculatedTaskQuality)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${calculatedTaskQuality}%` }} />
                </div>
              </div>

              {/* Innovation */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۴. نوآوری و میزان ایده‌های پیشنهادی</span>
                  <span className="font-extrabold">{toPersianDigits(targetEval.innovation)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-505 h-2 rounded-full bg-indigo-500" style={{ width: `${targetEval.innovation}%` }} />
                </div>
              </div>

              {/* Profitability */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۵. سودآوری تجاری و مشارکت بازرگانی انبار/تولید</span>
                  <span className="font-extrabold text-teal-650">{toPersianDigits(targetEval.profitability)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${targetEval.profitability}%` }} />
                </div>
              </div>

              {/* Responsibility */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۶. مسئولیت‌پذیری و تعهد در پروژه</span>
                  <span className="font-extrabold">{toPersianDigits(targetEval.responsibility)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${targetEval.responsibility}%` }} />
                </div>
              </div>

              {/* Teamwork */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۷. همکاری تیمی و مشارکت در اهداف جمعی</span>
                  <span className="font-extrabold">{toPersianDigits(targetEval.teamwork)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full bg-purple-500" style={{ width: `${targetEval.teamwork}%` }} />
                </div>
              </div>

              {/* Corporate Communication */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>۸. ارتباطات سازمانی و پاسخگویی به نامه‌ها</span>
                  <span className="font-extrabold">{toPersianDigits(targetEval.communication)}٪</span>
                </div>
                <div className="w-full bg-slate-105 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-504 h-2 rounded-full bg-sky-400" style={{ width: `${targetEval.communication}%` }} />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* COMPLETED ONLINE REPORT CARD CARD VIEW- "تولید خودکار کارنامه ماهانه" */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-[10px] text-slate-450 font-bold block">پرینت آنلاین کارنامه</span>
            <button
              onClick={() => printDocument('print_report_card_box')}
              className="bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-brand-cyan" />
              <span>چاپ کارنامه</span>
            </button>
          </div>

          <div id="print_report_card_box" className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5 print:p-0">
            <div className="text-center pb-4 border-b border-dashed border-slate-200">
              <span className="text-2xl font-black text-brand-navy block">هلدینگ کاویان سپنتا</span>
              <span className="text-[10px] text-brand-cyan mt-1 block font-bold">کارنامه عملکرد کیفی پرسنل - خردادماه ۱۴۰۵</span>
            </div>

            <div className="flex items-center space-x-reverse space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan flex items-center justify-center font-black text-white text-sm overflow-hidden">
                {targetUserObj.avatar && (targetUserObj.avatar.startsWith('http') || targetUserObj.avatar.startsWith('data:image')) ? (
                  <img src={targetUserObj.avatar} alt={targetUserObj.name} className="w-full h-full object-cover" />
                ) : (
                  targetUserObj.avatar
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">{targetUserObj.name}</span>
                <span className="text-[10px] text-slate-400 font-bold">سمت: {targetUserObj.position}</span>
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-2.5 text-xs divide-y divide-slate-100/60 font-medium">
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">حضور و غیاب انضباطی:</span>
                <span className="font-extrabold text-slate-800">حضور کامل (امتیاز {toPersianDigits(calculatedPresence)})</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">کیفیت انجام کارهای محوله:</span>
                <span className="font-extrabold text-slate-800">نسبت کیفی {toPersianDigits(calculatedTaskQuality)}٪</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">شاخص نوآوری و ایده طرح:</span>
                <span className="font-extrabold text-slate-800">امتیاز {toPersianDigits(targetEval.innovation)}٪</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">سودآوری معامله و مشارکت:</span>
                <span className="font-extrabold text-slate-800">امتیاز {toPersianDigits(targetEval.profitability)}٪</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">ارزیابی نهایی مدیریت ارشد:</span>
                <span className="font-extrabold text-slate-800">تعهد بالای {toPersianDigits(targetEval.overall)}٪</span>
              </div>

              <div className="flex justify-between items-center pt-3.5 font-bold">
                <span className="text-slate-900">امتیاز نهایی کارنامه (Composite):</span>
                <span className="text-sm font-black text-brand-cyan">{toPersianDigits(compositeFinalScore)} از ۱۰۰</span>
              </div>

              <div className="flex justify-between items-center pt-3.5 font-bold">
                <span className="text-slate-900">پاداش ناشی از کارآیی:</span>
                <span className="text-sm font-black text-emerald-600">
                  {allocatedBonus > 0 ? toPersianDigits(formatCurrency(allocatedBonus)) : 'فاقد تعلق'}
                </span>
              </div>

            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed text-center border-t border-dashed border-slate-200/60 pt-4 font-bold">
              این کارنامه بر اساس لاگ ورود و خروج، آمار تسک‌های بسته‌شده و تایید نهایی شخص مدیرعامل (موسوی-وظیفه) صادر گشته است.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
