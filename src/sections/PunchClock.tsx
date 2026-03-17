import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { type Employee, type PunchRecord } from '@/types';
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

  // æ´æ°æé
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // åå¾ä»æ¥æå¡è¨é
  useEffect(() => {
    setTodayRecord(getTodayPunchRecord(currentUser.id));
  }, [currentUser.id, getTodayPunchRecord]);

  // èçä¸ç­æå¡
  const handlePunchIn = () => {
    setPunchType('in');
    setShowLocationDialog(true);
  };

  // èçä¸ç­æå¡
  const handlePunchOut = () => {
    setPunchType('out');
    setShowLocationDialog(true);
  };

  // ç¢ºèªæå¡
  const confirmPunch = async () => {
    setIsLoading(true);
    
    // æ¨¡æ¬ç¶²è·¯å»¶é²
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (punchType === 'in') {
      onPunchIn(currentUser.id, location || undefined);
      toast.success('ä¸ç­æå¡æåï¼');
    } else {
      onPunchOut(currentUser.id, location || undefined);
      toast.success('ä¸ç­æå¡æåï¼');
    }
    
    // æ´æ°è¨é
    setTodayRecord(getTodayPunchRecord(currentUser.id));
    
    setIsLoading(false);
    setShowLocationDialog(false);
    setLocation('');
  };

  // è¨ç®å·¥ä½æé·
  const calculateWorkDuration = () => {
    if (!todayRecord?.punchIn || !todayRecord?.punchOut) return null;
    
    const start = new Date(`2000-01-01T${todayRecord.punchIn}`);
    const end = new Date(`2000-01-01T${todayRecord.punchOut}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}å°æ ${diffMinutes}åé`;
  };

  const workDuration = calculateWorkDuration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">æå¡åè½</h2>
        <p className="text-slate-500 mt-1">ä¸ç­ / ä¸ç­æå¡</p>
      </div>

      {/* ä¸»è¦æå¡åå */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm mb-2">
              {format(currentTime, 'yyyyå¹´MMæddæ¥ EEEE', { locale: zhTW })}
            </p>
            <p className="text-6xl font-bold font-mono tracking-wider">
              {format(currentTime, 'HH:mm:ss')}
            </p>
          </div>
        </div>
        
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* ä¸ç­æå¡ */}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-1">ä¸ç­æå¡</h3>
              {todayRecord?.punchIn ? (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    å·²æå¡
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
                  ä¸ç­æå¡
                </Button>
              )}
            </div>

            {/* ä¸ç­æå¡ */}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-1">ä¸ç­æå¡</h3>
              {todayRecord?.punchOut ? (
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    å·²æå¡
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
                  ä¸ç­æå¡
                </Button>
              )}
            </div>
          </div>

          {/* å·¥ä½æé· */}
          {workDuration && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <Timer className="w-5 h-5" />
                <span className="font-medium">ä»æ¥å·¥ä½æé·ï¼</span>
                <span className="text-xl font-bold">{workDuration}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ä»æ¥çææè¦ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ä»æ¥æ¥æ</p>
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
              <p className="text-sm text-slate-500">ä¸ç­æé</p>
              <p className={`font-semibold ${
                todayRecord?.punchIn ? 'text-green-600' : 'text-slate-400'
              }`}>
                {todayRecord?.punchIn || 'æªæå¡'}
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
              <p className="text-sm text-slate-500">ä¸ç­æé</p>
              <p className={`font-semibold ${
                todayRecord?.punchOut ? 'text-green-600' : 'text-slate-400'
              }`}>
                {todayRecord?.punchOut || 'æªæå¡'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* æå¡é ç¥ */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">æå¡é ç¥</p>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>â¢ è«å¨ä¸ç­åå¾ 30 åéå§å®ææå¡</li>
                <li>â¢ å¿è¨æå¡è«è¯ç¹«ä¸»ç®¡è£ç»</li>
                <li>â¢ æå¡è¨éå°èªåå²å­</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ä½ç½®è¼¸å¥å°è©±æ¡ */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {punchType === 'in' ? 'ä¸ç­æå¡' : 'ä¸ç­æå¡'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              ç®åæéï¼<strong>{format(currentTime, 'HH:mm:ss')}</strong>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                æå¡ä½ç½®ï¼é¸å¡«ï¼
              </label>
              <input
                type="text"
                placeholder="ä¾å¦ï¼ç¸½å¬å¸ãååºA..."
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
              åæ¶
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
              {isLoading ? 'èçä¸­...' : 'ç¢ºèªæå¡'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
