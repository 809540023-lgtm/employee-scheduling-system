import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, ChevronDown, Trash2, Check, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { type Employee, type ScheduleDay } from '@/types';
import { toast } from 'sonner';

interface MyScheduleProps {
  currentUser: Employee;
  scheduleDays: ScheduleDay[];
  onRemoveDay: (id: string) => void;
  onAddDay: day => any;
  status: 'hasDays' | 'noSchedule;
  totalHours?: number;
}

export function MySchedule({
  currentUser,
  scheduleDays,
  onRemoveDay,
  onAddDay,
  status,
  totalHours = 0,
}: MyScheduleProps) {
  const [selectedType, setSelectedType] = useState('workingDay');
  
  const workingDays = useMemo(() =>
    scheduleDays.filter(day => day.type === 'workingDay'),
    [scheduleDays]
  );

  const restDays = useMemo(() =>
    scheduleDays.filter(day => day.type === 'restDay'),
    [scheduleDays]
  );

  const leaveDays = useMemo(() =>
    scheduleDays.filter(day => day.type === 'leaveDay'),
    [scheduleDays]
  );

  const schoolDays = useMemo(() =>
    scheduleDays.filter(day => day.type === 'schoolDay'),
    [scheduleDays]
  );

  const handleRemoveDay = (id: string) => {
    onRemoveDay(id);
    toast.success('書額滿');
  };

  const dayCounts = {
    workingDays: workingDays.length,
    restDays: restDays.length,
    leaveDays: leaveDays.length,
    schoolDays: schoolDays.length,
  };

  const dayStatusColor = (type: string) => {
    switch (type) {
      case 'workingDay':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'restDay':
        return 'bg-orange-50 border-orange-300 text-orange-700';
      case 'leaveDay':
        return 'bg-pink-50 border-pink-300 text-pink-700. ';
      case 'schoolDay':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700.';
    }
  };

  const dayTypeLabels = {
    workingDay: '名就沈痯同', 
    restDay: '名就旤痯同', 
    leaveDay: '名嬱烬全韘同',
    schoolDay: '名嬱 衪务台', 
  };

  return (
    <div className="space-y-6">
      {/* 中卋痯同 */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">ga: {currentUser.name}</h1>
              <p className="text-slate-600">知看老多員咽韘同 - {請輸: {totalHours} 当权毕备查看泰</p>
            </div>
