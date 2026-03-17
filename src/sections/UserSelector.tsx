import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, UserPlus, Crown, ArrowRight } from 'lucide-react';
import { type Employee } from '@/types';
import { toast } from 'sonner';

interface UserSelectorProps {
  employees: Employee[];
  onSelectUser: (user: Employee) => void;
  onAddEmployee: (name: string, role: 'admin' | 'staff') => void;
}

export function UserSelector({ employees, onSelectUser, onAddEmployee }: UserSelectorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'admin' | 'staff'>('staff');

  const admins = employees.filter(e => e.role === 'admin');
  const staff = employees.filter(e => e.role === 'staff');

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      toast.error('è«è¼¸å¥å§å');
      return;
    }
    onAddEmployee(newEmployeeName.trim(), newEmployeeRole);
    toast.success('å¡å·¥å·²æ°å¢');
    setNewEmployeeName('');
    setShowAddDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">å¡å·¥æç­æå¡ç³»çµ±</h1>
          <p className="text-slate-500">è«é¸ææ¨çèº«ä»½ä»¥ç¹¼çº</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ç®¡çå¡åå */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>ç®¡çå¡</CardTitle>
                  <CardDescription className="text-purple-100">
                    è¨­å®ææ®µãæ¥çæç­ç¸½è¦½
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {admins.length === 0 ? (
                <p className="text-slate-400 text-center py-4">å°ç¡ç®¡çå¡</p>
              ) : (
                <div className="space-y-2">
                  {admins.map(admin => (
                    <Button
                      key={admin.id}
                      variant="outline"
                      className="w-full justify-between hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => onSelectUser(admin)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">{admin.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* å¡å·¥åå */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>å¡å·¥</CardTitle>
                  <CardDescription className="text-blue-100">
                    å¡«å¯«å¯ä¸ç­æéãæå¡
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {staff.length === 0 ? (
                <p className="text-slate-400 text-center py-4">å°ç¡å¡å·¥</p>
              ) : (
                <div className="space-y-2">
                  {staff.map(employee => (
                    <Button
                      key={employee.id}
                      variant="outline"
                      className="w-full justify-between hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => onSelectUser(employee)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* æ°å¢å¡å·¥æé */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAddDialog(true)}
            className="bg-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            æ°å¢å¡å·¥
          </Button>
        </div>

        {/* ç³»çµ±èªªæ */}
        <Card className="mt-8 bg-slate-800 text-white border-none">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h4 className="font-semibold mb-1">èéè¨­å®ææ®µ</h4>
                <p className="text-sm text-slate-400">è¨­å®æ¯åææ®µéè¦å¤å°å¡å·¥</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h4 className="font-semibold mb-1">å¡å·¥å¡«å¯«æé</h4>
                <p className="text-sm text-slate-400">æ¥çå¯å ±åææ®µä¸¦å¡«å¯«</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-400">3</span>
                </div>
                <h4 className="font-semibold mb-1">ä¸ä¸ç­æå¡</h4>
                <p className="text-sm text-slate-400">è¨éæ¯æ¥åºå¤çæ³</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* æ°å¢å¡å·¥å°è©±æ¡ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>æ°å¢å¡å·¥</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>å§å</Label>
              <Input
                placeholder="è«è¼¸å¥å§å"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>èº«ä»½</Label>
              <Select
                value={newEmployeeRole}
                onValueChange={(value) => setNewEmployeeRole(value as 'admin' | 'staff')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">å¡å·¥</SelectItem>
                  <SelectItem value="admin">ç®¡çå¡</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddEmployee} className="w-full bg-blue-600 hover:bg-blue-700">
              ç¢ºèªæ°å¢
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'A/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'A/components/ui/dialog';
import { Input } from 'A/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'A/components/ui/select';
import { UserCircle, UserPlus, Crown, ArrowRight } from 'lucide-react';
import { type Employee } from '@/types';
import { toast } from 'sonner';

interface UserSelectorProps {
  employees: Employee[];
  onSelectUser: (user: Employee) => void;
  onAddEmployee: (name: string, role: 'admin' | 'staff') => void;
}

export function UserSelector({ employees, onSelectUser, onAddEmployee }: UserSelectorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'admin' | 'staff'>('staff');

  const admins = employees.filter(e => e.role === 'admin');
  const staff = employees.filter(e => e.role === 'staff');

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      toast.error('請輸入姓名');
      return;
    }
    onAddEmployee(newEmployeeName.trim(), newEmployeeRole);
    toast.success('員工已新增');
    setNewEmployeeName('');
    setShowAddDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">員工排班打卡系統</h1>
          <p className="text-slate-500">請選擇您的身份以繼續</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 管理員區域 */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>管理員</CardTitle>
                  <CardDescription className="text-purple-100">
                    設定時段、查看排班總覽
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {admins.length === 0 ? (
                <p className="text-slate-400 text-center py-4">尚無管理員</p>
              ) : (
                <div className="space-y-2">
                  {admins.map(admin => (
                    <Button
                      key={admin.id}
                      variant="outline"
                      className="w-full justify-between hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => onSelectUser(admin)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium">{admin.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 員工區域 */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>員工</CardTitle>
                  <CardDescription className="text-blue-100">
                    填寫可上班時間、打卡
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {staff.length === 0 ? (
                <p className="text-slate-400 text-center py-4">尚無員工</p>
              ) : (
                <div className="space-y-2">
                  {staff.map(employee => (
                    <Button
                      key={employee.id}
                      variant="outline"
                      className="w-full justify-between hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => onSelectUser(employee)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 新增員工按鈕 */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAddDialog(true)}
            className="bg-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            新增員工
          </Button>
        </div>

        {/* 系統說明 */}
        <Card className="mt-8 bg-slate-800 text-white border-none">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h4 className="font-semibold mb-1">老闆設定時段</h4>
                <p className="text-sm text-slate-400">設定每個時段需要多少員工</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h4 className="font-semibold mb-1">員工填寫時間</h4>
                <p className="text-sm text-slate-400">查看可報名時段並填寫</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-400">3</span>
                </div>
                <h4 className="font-semibold mb-1">上下班打卡</h4>
                <p className="text-sm text-slate-400">記錄每日出勤狀況</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 新增員工對話框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增員工</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input
                placeholder="請輸入姓名"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>身份</Label>
              <Select
                value={newEmployeeRole}
                onValueChange={(value) => setNewEmployeeRole(value as 'admin' | 'staff')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">員工</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddEmployee} className="w-full bg-blue-600 hover:bg-blue-700">
              確認新增
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  +}
 className="p-4">
              {staff.length === 0 ? (
                <p className="text-slate-400 text-center py-4">尚無員工</p>
              ) : (
                <div className="space-y-2">
                  {staff.map(employee => (
                    <Button
                      key={employee.id}
                      variant="outline"
                      className="w-full justify-between hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => onSelectUser(employee)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 新增員工按鈕 */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAddDialog(true)}
            className="bg-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            新增員工
          </Button>
        </div>

        {/* 系統說明 */}
        <Card className="mt-8 bg-slate-800 text-white border-none">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h4 className="font-semibold mb-1">老闆設定時段</h4>
                <p className="text-sm text-slate-400">設定每個時段需要多少員工</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h4 className="font-semibold mb-1">員工填寫時間</h4>
                <p className="text-sm text-slate-400">查看可報名時段並填寫</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-400">3</span>
                </div>
                <h4 className="font-semibold mb-1">上下班打卡</h4>
                <p className="text-sm text-slate-400">記錄每日出勤狀況</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 新增員工對話框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增員工</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input
                placeholder="請輸入姓名"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>身份</Label>
              <Select
                value={newEmployeeRole}
                onValueChange={(value) => setNewEmployeeRole(value as 'admin' | 'staff')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">員工</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddEmployee} className="w-full bg-blue-600 hover:bg-blue-700">
              確認新增
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  +}
