import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { 
  LogOut, 
  Calendar, 
  Clock, 
  LayoutDashboard,
  UserCircle,
  Crown,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { UserSelector } from '@/sections/UserSelector';
import { CalendarView } from '@/sections/CalendarView';
import { ScheduleConfirmationManager } from '@/sections/ScheduleConfirmation';
import { MySchedule } from '@/sections/MySchedule';
import { PunchClock } from '@/sections/PunchClock';
import './App.css';

function App() {
  const {
    state,
    setCurrentUser,
    addEmployee,
    addAvailability,
    removeAvailability,
    getAvailabilityCount,
    hasAvailability,
    getEmployeeAvailabilities,
    punchIn,
    punchOut,
    getTodayPunchRecord,
    confirmSchedule,
    getEmployeeConfirmedSchedules,
  } = useAppState();

  const [activeTab, setActiveTab] = useState('calendar');

  // 如果還沒選擇用戶，顯示用戶選擇畫面
  if (!state.currentUser) {
    return (
      <>
        <UserSelector
          employees={state.employees}
          onSelectUser={setCurrentUser}
          onAddEmployee={addEmployee}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const isAdmin = state.currentUser.role === 'admin';

  // 處理登出
  const handleLogout = () => {
    setCurrentUser(null);
    toast.success('已登出');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {isAdmin ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <UserCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="font-bold text-slate-900">員工排班打卡系統</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{state.currentUser.name}</span>
                  <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-xs">
                    {isAdmin ? '管理員' : '員工'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">排班期間</p>
                <p className="text-sm font-medium text-slate-600">
                  2025/04/01 - 2025/06/30
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl mx-auto" style={{ gridTemplateColumns: isAdmin ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)' }}>
            {isAdmin ? (
              <>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  日曆總覽
                </TabsTrigger>
                <TabsTrigger value="confirmation" className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  確認班表
                </TabsTrigger>
                <TabsTrigger value="punch" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  打卡
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  填寫時間
                </TabsTrigger>
                <TabsTrigger value="myschedule" className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  我的班表
                </TabsTrigger>
                <TabsTrigger value="punch" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  打卡
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  總覽
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* 日曆檢視 - 管理員和員工都可以使用 */}
          <TabsContent value="calendar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isAdmin ? '日曆總覽' : '填寫可上班時間'}
                  </h2>
                  <p className="text-slate-500 mt-1">
                    {isAdmin 
                      ? '查看所有員工的報名狀況' 
                      : '點擊時段即可報名或取消（週六日休息）'}
                  </p>
                </div>
              </div>
              <CalendarView
                currentUser={state.currentUser}
                timeSlots={state.timeSlots}
                availabilities={state.availabilities}
                onAddAvailability={addAvailability}
                onRemoveAvailability={removeAvailability}
                getAvailabilityCount={getAvailabilityCount}
                hasAvailability={hasAvailability}
                isReadOnly={isAdmin}
              />
            </div>
          </TabsContent>

          {/* 確認班表 - 僅管理員 */}
          {isAdmin && (
            <TabsContent value="confirmation">
              <ScheduleConfirmationManager
                employees={state.employees}
                timeSlots={state.timeSlots}
                availabilities={state.availabilities}
                confirmations={state.confirmations}
                onConfirm={confirmSchedule}
                getAvailabilityCount={getAvailabilityCount}
              />
            </TabsContent>
          )}

          {/* 我的班表 - 僅員工 */}
          {!isAdmin && (
            <TabsContent value="myschedule">
              <MySchedule
                currentUser={state.currentUser}
                timeSlots={state.timeSlots}
                availabilities={state.availabilities}
                schedules={state.schedules}
                confirmations={state.confirmations}
              />
            </TabsContent>
          )}

          {/* 打卡功能 - 管理員和員工都可以使用 */}
          <TabsContent value="punch">
            <PunchClock
              currentUser={state.currentUser}
              onPunchIn={punchIn}
              onPunchOut={punchOut}
              getTodayPunchRecord={getTodayPunchRecord}
            />
          </TabsContent>

          {/* 總覽 - 僅員工 */}
          {!isAdmin && (
            <TabsContent value="overview">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">排班總覽</h2>
                  <p className="text-slate-500 mt-1">查看所有時段的報名狀況</p>
                </div>
                
                {/* 簡化版總覽 */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">我的報名</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {getEmployeeAvailabilities(state.currentUser.id).length}
                          </p>
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
                          <p className="text-sm text-slate-500">已確認班表</p>
                          <p className="text-2xl font-bold text-green-600">
                            {getEmployeeConfirmedSchedules(state.currentUser.id).length}
                          </p>
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
                          <p className="text-sm text-slate-500">今日打卡</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {getTodayPunchRecord(state.currentUser.id)?.punchIn ? '✓' : '-'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 時段說明 */}
                <Card>
                  <CardHeader>
                    <CardTitle>時段說明</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                        <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
                        <div className="flex-1">
                          <p className="font-medium">早班 (06:00 - 09:00)</p>
                          <p className="text-sm text-slate-500">需要 2 人</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
                        <div className="flex-1">
                          <p className="font-medium">午班 (10:00 - 13:00)</p>
                          <p className="text-sm text-slate-500">需要 2 人</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                        <div className="flex-1">
                          <p className="font-medium">下午班 (13:00 - 18:00)</p>
                          <p className="text-sm text-slate-500">需要 1 人</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* 底部資訊 */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>員工排班打卡系統</p>
            <div className="flex items-center gap-4">
              <span>排班期間: 2025/04/01 - 2025/06/30</span>
              <span>週六日休息</span>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  );
}

// 需要導入 Card 組件
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default App;
