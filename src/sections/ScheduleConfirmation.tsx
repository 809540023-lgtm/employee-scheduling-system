import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';
import { DAYS_OF_WEEK, type Employee, type TimeSlot, type StaffAvailability } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { toast } from 'sonner';

interface ScheduleConfirmationProps {
  employees: Employee[];
  timeSlots: TimeSlot[];
  availabilities: StaffAvailability[];
  confirmations: { weekStart: string; weekEnd: string; confirmedAt: string; confirmedBy: string }[];
  onConfirm: (weekStart: string, weekEnd: string, adminId: string) => void;
  getAvailabilityCount: (timeSlotId: string) => number;
}

export function ScheduleConfirmationManager({
  employees,
  timeSlots,
  availabilities,
  confirmations,
  onConfirm,
  getAvailabilityCount,
}: ScheduleConfirmationProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date('2025-04-01'), { weekStartsOn: 1 }));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 取得本週日期（週一到週五）
  const weekDates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const weekEnd = addDays(currentWeekStart, 4);
  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  // 檢查本週是否已確認
  const isConfirmed = confirmations.some(
    c => c.weekStart === weekStartStr && c.weekEnd === weekEndStr
  );

  // 切換週次
  const goToPreviousWeek = () => {
    const newStart = addDays(currentWeekStart, -7);
    if (newStart >= new Date('2025-04-01')) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = addDays(currentWeekStart, 7);
    if (newStart <= new Date('2025-06-30')) {
      setCurrentWeekStart(newStart);
    }
  };

  // 取得本週的報名統計
  const weekStats = useMemo(() => {
    const weekSlots = timeSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= currentWeekStart && slotDate <= weekEnd;
    });

    let totalSlots = 0;
    let filledSlots = 0;
    let totalRequired = 0;
    let totalSigned = 0;

    weekSlots.forEach(slot => {
      totalSlots++;
      const count = getAvailabilityCount(slot.id);
      totalRequired += slot.requiredStaff;
      totalSigned += count;
      if (count >= slot.requiredStaff) {
        filledSlots++;
      }
    });

    return {
      totalSlots,
      filledSlots,
      totalRequired,
      totalSigned,
      fulfillmentRate: totalRequired > 0 ? Math.round((totalSigned / totalRequired) * 100) : 0,
    };
  }, [timeSlots, currentWeekStart, weekEnd, getAvailabilityCount]);

  // 取得某時段的報名員工
  const getSlotEmployees = (slotId: string): Employee[] => {
    const staffIds = availabilities
      .filter(a => a.timeSlotId === slotId && a.status !== 'cancelled')
      .map(a => a.employeeId);
    return employees.filter(e => staffIds.includes(e.id));
  };

  // 處理確認
  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const confirmSchedule = () => {
    onConfirm(weekStartStr, weekEndStr, 'admin-1');
    setShowConfirmDialog(false);
    toast.success('班表已確認！員工將收到通知。');
  };

  // 取得時段顏色
  const getSlotColor = (startTime: string) => {
    switch (startTime) {
      case '06:00':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case '10:00':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case '13:00':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 週次導航 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[200px]">
            <p className="font-semibold text-slate-900">
              {format(currentWeekStart, 'yyyy/MM/dd')} - {format(weekEnd, 'yyyy/MM/dd')}
            </p>
            <p className="text-sm text-slate-500">
              {format(currentWeekStart, 'MMMM', { locale: zhTW })}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isConfirmed ? (
          <Badge className="bg-green-100 text-green-700 px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            已確認
          </Badge>
        ) : (
          <Button 
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="w-4 h-4 mr-2" />
            確認班表
          </Button>
        )}
      </div>

      {/* 統計卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">本週時段</p>
                <p className="text-2xl font-bold text-slate-900">{weekStats.totalSlots}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">已額滿</p>
                <p className="text-2xl font-bold text-green-600">{weekStats.filledSlots}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">需求人數</p>
                <p className="text-2xl font-bold text-slate-900">{weekStats.totalRequired}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">已報名</p>
                <p className={`text-2xl font-bold ${
                  weekStats.totalSigned >= weekStats.totalRequired ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {weekStats.totalSigned}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 滿足率 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">人力需求滿足率</span>
            <span className={`text-sm font-bold ${
              weekStats.fulfillmentRate >= 100 ? 'text-green-600' : 
              weekStats.fulfillmentRate >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {weekStats.fulfillmentRate}%
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                weekStats.fulfillmentRate >= 100 ? 'bg-green-500' : 
                weekStats.fulfillmentRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(weekStats.fulfillmentRate, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 詳細班表 */}
      <Card>
        <CardHeader>
          <CardTitle>本週班表詳情</CardTitle>
          <CardDescription>查看每天的報名狀況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekDates.map((date, index) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const daySlots = timeSlots
                .filter(slot => slot.date === dateStr)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (daySlots.length === 0) return null;

              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b">
                    <h4 className="font-semibold text-slate-800">
                      {format(date, 'MM/dd')} ({DAYS_OF_WEEK.find(d => d.value === date.getDay())?.label})
                    </h4>
                  </div>
                  <div className="divide-y">
                    {daySlots.map(slot => {
                      const count = getAvailabilityCount(slot.id);
                      const isFull = count >= slot.requiredStaff;
                      const slotEmployees = getSlotEmployees(slot.id);

                      return (
                        <div key={slot.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded text-sm font-medium ${getSlotColor(slot.startTime)}`}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className={`text-sm ${isFull ? 'text-green-600 font-medium' : 'text-slate-600'}`}>
                                {count} / {slot.requiredStaff} 人
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {slotEmployees.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {slotEmployees.map(emp => (
                                  <Badge key={emp.id} variant="secondary" className="text-xs">
                                    {emp.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                尚焠人報名
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 確認對話框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>確認班表</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">確認期間</p>
              <p className="font-semibold text-slate-900">
                {format(currentWeekStart, 'yyyy/MM/dd')} - {format(weekEnd, 'yyyy/MM/dd')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">總時段數</span>
                <span className="font-medium">{weekStats.totalSlots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">已額滿時段</span>
                <span className="font-medium text-green-600">{weekStats.filledSlots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">滿足率</span>
                <span className={`font-medium ${
                  weekStats.fulfillmentRate >= 100 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {weekStats.fulfillmentRate}%
                </span>
              </div>
            </div>

            {weekStats.fulfillmentRate < 100 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  注意：部分時段尚未額滿，確認後員工將收到最終班表。
                </p>
              </div>
            )}

            <p className="text-sm text-slate-500">
              確認後，系統將會通知所有員工他們的最終班表，並允許他們匯出到 Google 日曆。
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button 
              onClick={confirmSchedule}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              確認班表
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
