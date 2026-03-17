import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  Clock,
} from 'lucide-react';
import { DAYS_OF_WEEK, type Employee, type TimeSlot, type StaffAvailability } from '@/types';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { toast } from 'sonner';

interface CalendarViewProps {
  currentUser: Employee;
  timeSlots: TimeSlot[];
  availabilities: StaffAvailability[];
  onAddAvailability: (availability: Omit<StaffAvailability, 'id' | 'createdAt'>) => void;
  onRemoveAvailability: (id: string) => void;
  getAvailabilityCount: (timeSlotId: string) => number;
  hasAvailability: (employeeId: string, timeSlotId: string) => boolean;
  isReadOnly?: boolean;
}

// æéæ®µé¸é 
const TIME_RANGES = [
  { value: 'all', label: 'å¨é¨ææ®µ' },
  { value: 'morning', label: 'æ©ä¸ (06:00-09:00)' },
  { value: 'noon', label: 'ä¸­å (10:00-13:00)' },
  { value: 'afternoon', label: 'ä¸å (13:00-18:00)' },
];

export function CalendarView({
  currentUser,
  timeSlots,
  availabilities,
  onAddAvailability,
  onRemoveAvailability,
  getAvailabilityCount,
  hasAvailability,
  isReadOnly = false,
}: CalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date('2025-04-01'), { weekStartsOn: 1 }));
  const [timeFilter, setTimeFilter] = useState('all');

  // åå¾æ¬é±æ¥æï¼é±ä¸å°é±äºï¼
  const weekDates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // åæé±æ¬¡
  const goToPreviousWeek = () => {
    const newStart = addDays(currentWeekStart, -7);
    // éå¶ä¸è½æ©æ¼ 4/1
    if (newStart >= new Date('2025-04-01')) {
      setCurrentWeekStart(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = addDays(currentWeekStart, 7);
    // éå¶ä¸è½ææ¼ 6/30
    if (newStart <= new Date('2025-06-30')) {
      setCurrentWeekStart(newStart);
    }
  };

  // åå¾æå¤©çææ®µ
  const getDayTimeSlots = (date: Date): TimeSlot[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeSlots
      .filter(slot => slot.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // éæ¿¾ææ®µ
  const filterTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
    if (timeFilter === 'all') return slots;
    
    return slots.filter(slot => {
      switch (timeFilter) {
        case 'morning':
          return slot.startTime === '06:00';
        case 'noon':
          return slot.startTime === '10:00';
        case 'afternoon':
          return slot.startTime === '13:00';
        default:
          return true;
      }
    });
  };

  // èçå ±å/åæ¶
  const handleToggleAvailability = (slot: TimeSlot) => {
    if (isReadOnly) return;

    const hasSignedUp = hasAvailability(currentUser.id, slot.id);
    
    if (hasSignedUp) {
      // åæ¶å ±å
      const existing = availabilities.find(
        a => a.employeeId === currentUser.id && a.timeSlotId === slot.id
      );
      if (existing) {
        onRemoveAvailability(existing.id);
        toast.success('å·²åæ¶å ±å');
      }
    } else {
      // æª¢æ¥æ¯å¦é¡æ»¿
      const count = getAvailabilityCount(slot.id);
      if (count >= slot.requiredStaff) {
        toast.error('è©²ææ®µå·²é¡æ»¿');
        return;
      }
      
      // å ±å
      onAddAvailability({
        employeeId: currentUser.id,
        timeSlotId: slot.id,
        date: slot.date,
        status: 'available',
      });
      toast.success('å ±åæåï¼');
    }
  };

  // åå¾ææ®µçæ
  const getSlotStatus = (slot: TimeSlot) => {
    const count = getAvailabilityCount(slot.id);
    const hasSignedUp = hasAvailability(currentUser.id, slot.id);
    const isFull = count >= slot.requiredStaff;
    
    return {
      count,
      hasSignedUp,
      isFull,
      remaining: slot.requiredStaff - count,
    };
  };

  // åå¾ææ®µé¡è²
  const getSlotColor = (slot: TimeSlot) => {
    switch (slot.startTime) {
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

  // æª¢æ¥æ¯å¦çºä»å¤©
  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-4">
      {/* é±æ¬¡å°èª */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[200px]">
            <p className="font-semibold text-slate-900">
              {format(currentWeekStart, 'yyyy/MM/dd')} - {format(addDays(currentWeekStart, 4), 'yyyy/MM/dd')}
            </p>
            <p className="text-sm text-slate-500">
              {format(currentWeekStart, 'MMMM', { locale: zhTW })}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* æ¥æç¶²æ ¼ */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* è¡¨é ­ */}
        <div className="grid grid-cols-6 border-b">
          <div className="p-3 bg-slate-50 border-r font-medium text-slate-500 text-sm">
            æé
          </div>
          {weekDates.map((date, index) => (
            <div 
              key={index} 
              className={`p-3 text-center border-r last:border-r-0 ${
                isToday(date) ? 'bg-blue-50' : 'bg-slate-50'
              }`}
            >
              <p className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : 'text-slate-600'}`}>
                {DAYS_OF_WEEK.find(d => d.value === date.getDay())?.shortLabel}
              </p>
              <p className={`text-lg font-bold ${isToday(date) ? 'text-blue-700' : 'text-slate-900'}`}>
                {format(date, 'MM/dd')}
              </p>
            </div>
          ))}
        </div>

        {/* ææ®µå§å®¹ */}
        <div className="grid grid-cols-6">
          {/* æéæ¨ç±¤æ¬ */}
          <div className="border-r bg-slate-50">
            {['06:00', '10:00', '13:00'].map((time) => (
              <div 
                key={time} 
                className="p-4 border-b last:border-b-0 h-24 flex items-center justify-center"
              >
                <div className="text-center">
                  <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-sm font-medium text-slate-600">{time}</p>
                  <p className="text-xs text-slate-400">
                    {time === '06:00' ? '09:00' : time === '10:00' ? '13:00' : '18:00'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* æ¯å¤©çææ®µ */}
          {weekDates.map((date, dayIndex) => {
            const daySlots = filterTimeSlots(getDayTimeSlots(date));
            
            return (
              <div 
                key={dayIndex} 
                className={`border-r last:border-r-0 ${isToday(date) ? 'bg-blue-50/30' : ''}`}
              >
                {['06:00', '10:00', '13:00'].map(timeKey => {
                  const slot = daySlots.find(s => s.startTime === timeKey);
                  
                  if (!slot) {
                    return (
                      <div 
                        key={timeKey} 
                        className="p-2 border-b last:border-b-0 h-24 flex items-center justify-center"
                      >
                        <span className="text-slate-300 text-sm">-</span>
                      </div>
                    );
                  }

                  const status = getSlotStatus(slot);
                  const slotColor = getSlotColor(slot);

                  return (
                    <div 
                      key={timeKey} 
                      className="p-2 border-b last:border-b-0 h-24"
                    >
                      <button
                        onClick={() => handleToggleAvailability(slot)}
                        disabled={isReadOnly || (!status.hasSignedUp && status.isFull)}
                        className={`w-full h-full rounded-lg border-2 p-2 transition-all ${
                          status.hasSignedUp
                            ? 'border-green-500 bg-green-50'
                            : status.isFull
                            ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                            : `border-transparent ${slotColor} hover:opacity-80 cursor-pointer`
                        }`}
                      >
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {slot.startTime}-{slot.endTime}
                            </span>
                            {status.hasSignedUp && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className={`text-xs ${
                                status.isFull ? 'text-red-600 font-medium' : ''
                              }`}>
                                {status.count}/{slot.requiredStaff}
                              </span>
                            </div>
                            {!isReadOnly && !status.hasSignedUp && !status.isFull && (
                              <span className="text-xs opacity-70">é»æå ±å</span>
                            )}
                          </div>
                          
                          {/* é²åº¦æ¢ */}
                          <div className="h-1 bg-white/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                status.isFull ? 'bg-red-500' : 'bg-white'
                              }`}
                              style={{ width: `${(status.count / slot.requiredStaff) * 100}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* åä¾ */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
          <span className="text-slate-600">æ©ç­ (06:00-09:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
          <span className="text-slate-600">åç­ (10:00-13:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span className="text-slate-600">ä¸åç­ (13:00-18:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-500" />
          <span className="text-slate-600">å·²å ±å</span>
        </div>
      </div>
    </div>
  );
}
