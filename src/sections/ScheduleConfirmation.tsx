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

  // åå¾æ¬é±æ¥æï¼é±ä¸å°é±äºï¼
  const weekDates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const weekEnd = addDays(currentWeekStart, 4);
  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  // æª¢æ¥æ¬é±æ¯å¦å·²ç¢ºèª
  const isConfirmed = confirmations.some(
    c => c.weekStart === weekStartStr && c.weekEnd === weekEndStr
  );

  // åæé±æ¬¡
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

  // åå¾æ¬é±çå ±åçµ±è¨
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

  // åå¾æææ®µçå ±åå¡å·¥
  const getSlotEmployees = (slotId: string): Employee[] => {
    const staffIds = availabilities
      .filter(a => a.timeSlotId === slotId && a.status !== 'cancelled')
      .map(a => a.employeeId);
    return employees.filter(e => staffIds.includes(e.id));
  };

  // èçç¢ºèª
  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const confirmSchedule = () => {
    onConfirm(weekStartStr, weekEndStr, 'admin-1');
    setShowConfirmDialog(false);
    toast.success('ç­è¡¨å·²ç¢ºèªï¼å¡å·¥å°æ¶å°éç¥ã');
  };

  // åå¾ææ®µé¡è²
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
      {/* é±æ¬¡å°èª */}
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
            å·²ç¢ºèª
          </Badge>
        ) : (
          <Button 
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="w-4 h-4 mr-2" />
            ç¢ºèªç­è¡¨
          </Button>
        )}
      </div>

      {/* çµ±è¨å¡ç */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">æ¬é±ææ®µ</p>
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
                <p className="text-sm text-slate-500">å·²é¡å»¿</p>
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
                <p className="text-sm text-slate-500">éæ±äººæ¸</p>
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
                <p className="text-sm text-slate-500">å·²å ±å</p>
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

      {/* æ»¿è¶³ç */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">äººåéæ±æ»¿è¶³ç</span>
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

      {/* è©³ç´°ç­è¡¨ */}
      <Card>
        <CardHeader>
          <CardTitle>æ¬é±ç­è¡¨è©³æ</CardTitle>
          <CardDescription>æ¥çæ¯å¤©çå ±åçæ³</CardDescription>
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
                                {count} / {slot.requiredStaff} äºº
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
                                å°ç¡äººå ±å
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

      {/* ç¢ºèªå°è©±æ¡ */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ç¢ºèªç­è¡¨</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">ç¢ºèªæé</p>
              <p className="font-semibold text-slate-900">
                {format(currentWeekStart, 'yyyy/MM/dd')} - {format(weekEnd, 'yyyy/MM/dd')}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">ç¸½ææ®µæ¸</span>
                <span className="font-medium">{weekStats.totalSlots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">å·²é¡æ»¿ææ®µ</span>
                <span className="font-medium text-green-600">{weekStats.filledSlots}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">æ»¿è¶³ç</span>
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
                  æ³¨æï¼é¨åææ®µå°æªé¡æ»¿ï¼ç¢ºèªå¾å¡å·¥å°æ¶å°æçµç­è¡¨ã
                </p>
              </div>
            )}

            <p className="text-sm text-slate-500">
              ç¢ºèªå¾ï¼ç³»çµ±å°æéç¥ææå¡å·¥ä»åçæçµç­è¡¨ï¼ä¸¦åè¨±ä»åå¯åºå° Google æ¥æã
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              åæ¶
            </Button>
            <Button 
              onClick={confirmSchedule}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              ç¢ºèªç­è¡¨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
