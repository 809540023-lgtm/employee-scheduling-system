import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DAYS_OF_WEEK, type Employee, type TimeSlot, type StaffAvailability, type Schedule } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { toast } from 'sonner';

interface MyScheduleProps {
  currentUser: Employee;
  timeSlots: TimeSlot[];
  availabilities: StaffAvailability[];
  schedules: Schedule[];
  confirmations: { weekStart: string; weekEnd: string; confirmedAt: string }[];
}

export function MySchedule({
  currentUser,
  timeSlots,
  availabilities,
  schedules,
  confirmations,
}: MyScheduleProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date('2025-04-01'), { weekStartsOn: 1 }));
  const [activeTab, setActiveTab] = useState('pending');

  const weekEnd = addDays(currentWeekStart, 4);
  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

  // 檢查本週是否已確認
  const isWeekConfirmed = confirmations.some(
    c => c.weekStart === weekStartStr
  );

  // 取得我的報名（待確認）
  const myPendingSlots = useMemo(() => {
    const myAvails = availabilities.filter(
      a => a.employeeId === currentUser.id && a.status === 'available'
    );
    
    return myAvails
      .map(avail => {
        const slot = timeSlots.find(s => s.id === avail.timeSlotId);
        return slot ? { ...slot, availabilityId: avail.id } : null;
      })
      .filter((slot): slot is TimeSlot & { availabilityId: string } => slot !== null)
      .filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= currentWeekStart && slotDate <= weekEnd;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [availabilities, currentUser.id, timeSlots, currentWeekStart, weekEnd]);

  // 取得我的確誌班表
  const myConfirmedSchedules = useMemo(() => {
    return schedules
      .filter(s => s.employeeId === currentUser.id && s.status === 'scheduled')
      .map(schedule => {
        const slot = timeSlots.find(s => s.id === schedule.timeSlotId);
        return slot ? { ...schedule, slot } : null;
      })
      .filter((item): item is Schedule & { slot: TimeSlot } => item !== null)
      .filter(item => {
        const slotDate = new Date(item.date);
        return slotDate >= currentWeekStart && slotDate <= weekEnd;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules, currentUser.id, timeSlots, currentWeekStart, weekEnd]);

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

  // 生成 ICS 檔案內容
  const generateICS = (items: (TimeSlot & { availabilityId: string })[]) => {
    const events = items.map(item => {
      const startDate = item.date.replace(/-/g, '');
      const startTime = item.startTime.replace(':', '') + '00';
      const endTime = item.endTime.replace(':', '') + '00';
      
      return `BEGIN:VEVENT
DTSTART:${startDate}T${startTime}
DTEND:${startDate}T${endTime}
SUMMARY:上班班表
DESCRIPTION:工作時段：${item.startTime} - ${item.endTime}
LOCATION:公司
STATUS:CONFIRMED
END:VEVENT`;
    });

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//員工排班系統//CN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join('\n')}
END:VCALENDAR`;
  };

  // 下載 ICS 檔案
  const downloadICS = (items: (TimeSlot & { availabilityId: string })[], filename: string) => {
    const icsContent = generateICS(items);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('行事曆檔案已下載！');
  };

  // 匯出到 Google 日曆
  const exportToGoogleCalendar = (item: TimeSlot & { availabilityId: string }) => {
    const startDate = item.date.replace(/-/g, '');
    const startTime = item.startTime.replace(':', '') + '00';
    const endTime = item.endTime.replace(':', '') + '00';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: '上班班表',
      dates: `${startDate}T${startTime}/${startDate}T${endTime}`,
      details: `工作時段：${item.startTime} - ${item.endTime}`,
      location: '公司',
    });
    
    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, '_blank');
  };

  // 批次匯出到 Google 日曆
  const exportAllToGoogleCalendar = () => {
    myConfirmedSchedules.forEach((item, index) => {
      setTimeout(() => {
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: '上班班表',
          dates: `${item.date.replace(/-/g, '')}T${item.slot.startTime.replace(':', '')}00/${item.date.replace(/-/g, '')}T${item.slot.endTime.replace(':', '')}00`,
          details: `工作時���：${item.slot.startTime} - ${item.slot.endTime}`,
          location: '公司',
        });
        
        const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
        window.open(url, '_blank');
      }, index * 500);
    });
    toast.success('正在開啟 Google 日曆...');
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

        {isWeekConfirmed && (
          <Badge className="bg-green-100 text-green-700 px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            班表已確認
          </Badge>
        )}
      </div>

      {/* 統計 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">待確認報名</p>
                <p className="text-2xl font-bold text-orange-600">{myPendingSlots.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">已確認班表</p>
                <p className="text-2xl font-bold text-green-600">{myConfirmedSchedules.length}</p>
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
                <p className="text-sm text-slate-500">本週狀態</p>
                <p className="text-lg font-bold text-slate-900">
                  {isWeekConfirmed ? '已確認' : '待確認'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 班表列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            待確認 ({myPendingSlots.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            已確認 ({myConfirmedSchedules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {myPendingSlots.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">本週沒有待確認的報名</p>
                <p className="text-sm text-slate-400 mt-1">請前往「填寫時間」報名時段</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myPendingSlots.map(slot => (
                <Card key={slot.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded text-sm font-medium ${getSlotColor(slot.startTime)}`}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {format(new Date(slot.date), 'MM/dd')} ({DAYS_OF_WEEK.find(d => d.value === new Date(slot.date).getDay())?.label})
                          </p>
                          <p className="text-sm text-slate-500">
                            等待老闆確認中...
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        待確認
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4">
          {myConfirmedSchedules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">本週沒有已確認的班表</p>
                <p className="text-sm text-slate-400 mt-1">老闆確認後會顯示在這裡</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* 批次匯出按鈕 */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => downloadICS(
                    myConfirmedSchedules.map(s => ({ ...s.slot, availabilityId: s.id })),
                    `班表_${format(currentWeekStart, 'yyyyMMdd')}.ics`
                  )}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下載 ICS 檔案
                </Button>
                <Button 
                  onClick={exportAllToGoogleCalendar}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  匯出到 Google 日曆
                </Button>
              </div>

              {myConfirmedSchedules.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded text-sm font-medium ${getSlotColor(item.slot.startTime)}`}>
                          {item.slot.startTime} - {item.slot.endTime}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {format(new Date(item.date), 'MM/dd')} ({DAYS_OF_WEEK.find(d => d.value === new Date(item.date).getDay())?.label})
                          </p>
                          <p className="text-sm text-slate-500">
                            已於 {format(new Date(item.confirmedAt), 'MM/dd HH:mm')} 確認
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          已確認
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => exportToGoogleCalendar({ ...item.slot, availabilityId: item.id })}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
