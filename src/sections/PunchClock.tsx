import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from 'A/components/ui/button';
import { Badge } from 'A/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'A/components/ui/dialog';
import { 
  Clock, 
  MapPin, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Timer
} from 'lucide-react';
import { type Employee, type PunchRecord } from 'A/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface PunchClockProps {
  currentUser: Employee;
  onPunchIn: (employeeId: string, location?: string) => void;
  onPunchOut: (employeeId: string, location?: string) => void;
  getTodayPunchRecord: (employeeId: string) => PunchRecord | undefined;
}

export function PunchClock({
  currentUser,
  onPunchIn,
  onPunchOut,
  getTodayPunchRecord,
}: PunchClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<PunchRecord | undefined>();
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [punchType, setPunchType] = useState<'in' | 'out'>('in');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 取得今日打卡記錄
  useEffect(() => {
    setTodayRecord(getTodayPunchRecord(currentUser.id));
  }, [currentUser.id, getTodayPunchRecord]);

  // 處理上班打卡
  const handlePunchIn = () => {
    setPunchType('in');
    setShowLocationDialog(true);
  };

  // 處理下班打卡
  const handlePunchOut = () => {
    setPunchType('out');
    setShowLocationDialog(true);
  };

  // 確認打卡
  const confirmPunch = async () => {
    setIsLoading(true);
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (punchType === 'in') {
      onPunchIn(currentUser.id, location || undefined);
      toast.success('上班打卡成功！');
    } else {
      onPunchOut(currentUser.id, location || undefined);
      toast.success('下班打卡成功！');
    }
    
    // 更新記錄
    setTodayRecord(getTodayPunchRecord(currentUser.id));
    
    setIsLoading(false);
    setShowLocationDialog(false);
    setLocation('');
  };

  // 計算工作時長
  const calculateWorkDuration = () => {
    if (!todayRecord?.punchIn || !todayRecord?.punchOut) return null;
    
    const start = new Date(`2000-01-01T${todayRecord.punchIn}`);
    const end = new Date(`2000-01-01T${todayRecord.punchOut}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}小時 ${diffMinutes}分鐘`;
  };

  const workDuration = calculateWorkDuration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">打卡功能</h2>
        <p className="text-slate-500 mt-1">上班 / 下班打卡</p>
      </div>

      {/* 主要打卡區域 */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-2">
              {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
            </p>
            <p className="text-6xl font-bold font-mono tracking-wider">
              {format(currentTime, 'HH:mm:ss')}
            </p>
          </div>
        </div>
        
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 上班打卡 */}
            <div className="text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
                todayRecord?.punchIn
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {todayRecord?.punchIn ? (
                  <CheckCircle2 className="w-12 h-12" />
                ) : (
                  <LogIn className="w-12 h-12" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">上班打卡</h3>
              {todayRecord?.punchIn ? (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    已打卡
                  </Badge>
                  <p className="text-2xl font-bold text-green-600">
                    {todayRecord.punchIn}
                  </p>
                  {todayRecord.punchInLocation && (
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {todayRecord.punchInLocation}
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handlePunchIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  上班打卡
                </Button>
              )}
            </div>

            {/* 下班打卡 */}
            <div className="text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
                todayRecord?.punchOut
                  ? 'bg-green-100 text-green-600'
                  : !todayRecord?.punchIn
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-orange-100 text-orange-600'
              }`}>
                {todayRecord?.punchOut ? (
                  <CheckCircle2 className="w-12 h-12" />
                ) : (
                  <LogOut className="w-12 h-12" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">下班打卡</h3>
              {todayRecord?.punchOut ? (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    已打卡
                  </Badge>
                  <p className="text-2xl font-bold text-green-600">
                    {todayRecord.punchOut}
                  </p>
                  {todayRecord.punchOutLocation && (
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {todayRecord.punchOutLocation}
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handlePunchOut}
                  disabled={!todayRecord?.punchIn}
                  className="w-full bg-orange-500 hover:bg-orange-600 mt-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  下班打卡
                </Button>
              )}
            </div>
          </div>

          {/* 工作時長 */}
          {workDuration && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <Timer className="w-5 h-5" />
                <span className="font-medium">今日工作時長：</span>
                <span className="text-xl font-bold">{workDuration}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 今日狀態摘要 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">今日日期</p>
              <p className="font-semibold text-slate-900">
                {format(currentTime, 'MM/dd')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              todayRecord?.punchIn ? 'bg-green-100' : 'bg-slate-100'
            }`}>
              <Clock className={`w-6 h-6 ${
                todayRecord?.punchIn ? 'text-green-600' : 'text-slate-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">上班時間</p>
              <p className={`font-semibold ${
                todayRecord?.punchIn ? 'text-green-600' : 'text-slate-400'
              }`}>
                {todayRecord?.punchIn || '未打卡'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              todayRecord?.punchOut ? 'bg-green-100' : 'bg-slate-100'
            }`}>
              <Clock className={`w-6 h-6 ${
                todayRecord?.punchOut ? 'text-green-600' : 'text-slate-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">下班時間</p>
              <p className={`font-semibold ${
                todayRecord?.punchOut ? 'text-green-600' : 'text-slate-400'
              }`}>
                {todayRecord?.punchOut || '未打卡'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 打卡須知 */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">打卡須知</p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• 請在上班前後 30 分鐘內完成打卡</li>
                <li>• 忘記打卡請聯繫主管補登</li>
                <li>• 打卡記錄將自動儲存</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 位置輸入對話框 */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {punchType === 'in' ? '上班打卡' : '下班打卡'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              目前時間：<strong>{format(currentTime, 'HH:mm:ss')}</strong>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                打卡位置（選填）
              </label>
              <input
                type="text"
                placeholder="例如：總公司、分店A..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowLocationDialog(false)} 
              className="flex-1"
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              onClick={confirmPunch} 
              className={`flex-1 ${
                punchType === 'in' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
              disabled={isLoading}
            >
              {isLoading ? '處理中...' : '確認打卡'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  (}