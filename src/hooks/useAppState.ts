import { useState, useEffect, useCallback } from 'react';
import type { 
  Employee, 
  TimeSlot, 
  StaffAvailability, 
  PunchRecord, 
  Schedule,
  ScheduleConfirmation,
  AppState 
} from '@/types';

const STORAGE_KEY = 'staff-scheduling-app-v2';

// 生成 4/1-6/30 的時段資料（週六日除外）
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startDate = new Date('2025-04-01');
  const endDate = new Date('2025-06-30');
  
  const slotTemplates = [
    { startTime: '06:00', endTime: '09:00', requiredStaff: 2 },
    { startTime: '10:00', endTime: '13:00', requiredStaff: 2 },
    { startTime: '13:00', endTime: '18:00', requiredStaff: 1 },
  ];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    // 跳過週六(6)和週日(0)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const dateStr = d.toISOString().split('T')[0];
    
    slotTemplates.forEach((template, index) => {
      slots.push({
        id: `slot-${dateStr}-${index}`,
        date: dateStr,
        startTime: template.startTime,
        endTime: template.endTime,
        requiredStaff: template.requiredStaff,
        isWeekend: false,
        createdAt: new Date().toISOString(),
      });
    });
  }
  
  return slots;
};

// 初始資料
const getInitialState = (): AppState => ({
  currentUser: null,
  employees: [
    { id: 'admin-1', name: '老闆', role: 'admin', createdAt: new Date().toISOString() },
    { id: 'staff-1', name: '小明', role: 'staff', createdAt: new Date().toISOString() },
    { id: 'staff-2', name: '小華', role: 'staff', createdAt: new Date().toISOString() },
    { id: 'staff-3', name: '小美', role: 'staff', createdAt: new Date().toISOString() },
  ],
  timeSlots: generateTimeSlots(),
  availabilities: [],
  punchRecords: [],
  schedules: [],
  confirmations: [],
  scheduleStartDate: '2025-04-01',
  scheduleEndDate: '2025-06-30',
});

// 從 localStorage 載入資料
const loadFromStorage = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 如果沒有時段資料，重新生成
      if (!parsed.timeSlots || parsed.timeSlots.length === 0) {
        parsed.timeSlots = generateTimeSlots();
      }
      return { ...getInitialState(), ...parsed };
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
  return getInitialState();
};

// 儲存到 localStorage
const saveToStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

export function useAppState() {
  const [state, setState] = useState<AppState>(loadFromStorage);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初始化載入
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 自動儲存
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  // 設定目前使用者
  const setCurrentUser = useCallback((user: Employee | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  // 新增員工
  const addEmployee = useCallback((name: string, role: 'admin' | 'staff' = 'staff') => {
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
    }));
    return newEmployee;
  }, []);

  // 刪除員工
  const removeEmployee = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id),
    }));
  }, []);

  // 取得某時段的已報名人數
  const getAvailabilityCount = useCallback((timeSlotId: string): number => {
    return state.availabilities.filter(
      a => a.timeSlotId === timeSlotId && a.status !== 'cancelled'
    ).length;
  }, [state.availabilities]);

  // 檢查員工是否已報名某時段
  const hasAvailability = useCallback((employeeId: string, timeSlotId: string): boolean => {
    return state.availabilities.some(
      a => a.employeeId === employeeId && a.timeSlotId === timeSlotId && a.status !== 'cancelled'
    );
  }, [state.availabilities]);

  // 取得員工報名的時段
  const getEmployeeAvailabilities = useCallback((employeeId: string): StaffAvailability[] => {
    return state.availabilities.filter(
      a => a.employeeId === employeeId && a.status !== 'cancelled'
    );
  }, [state.availabilities]);

  // 新增員工可上班時間
  const addAvailability = useCallback((availability: Omit<StaffAvailability, 'id' | 'createdAt'>) => {
    const newAvailability: StaffAvailability = {
      ...availability,
      id: `avail-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      availabilities: [...prev.availabilities, newAvailability],
    }));
    return newAvailability;
  }, []);

  // 刪除員工可上班時間
  const removeAvailability = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter(a => a.id !== id),
    }));
  }, []);

  // 上班打卡
  const punchIn = useCallback((employeeId: string, location?: string) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    
    const existingRecord = state.punchRecords.find(
      r => r.employeeId === employeeId && r.date === date
    );

    if (existingRecord) {
      setState(prev => ({
        ...prev,
        punchRecords: prev.punchRecords.map(r =>
          r.id === existingRecord.id
            ? { ...r, punchIn: time, punchInLocation: location }
            : r
        ),
      }));
      return existingRecord;
    } else {
      const newRecord: PunchRecord = {
        id: `punch-${Date.now()}`,
        employeeId,
        date,
        punchIn: time,
        punchOut: null,
        punchInLocation: location,
        createdAt: now.toISOString(),
      };
      setState(prev => ({
        ...prev,
        punchRecords: [...prev.punchRecords, newRecord],
      }));
      return newRecord;
    }
  }, [state.punchRecords]);

  // 下班打卡
  const punchOut = useCallback((employeeId: string, location?: string) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    
    const existingRecord = state.punchRecords.find(
      r => r.employeeId === employeeId && r.date === date
    );

    if (existingRecord) {
      setState(prev => ({
        ...prev,
        punchRecords: prev.punchRecords.map(r =>
          r.id === existingRecord.id
            ? { ...r, punchOut: time, punchOutLocation: location }
            : r
        ),
      }));
      return { ...existingRecord, punchOut: time };
    } else {
      const newRecord: PunchRecord = {
        id: `punch-${Date.now()}`,
        employeeId,
        date,
        punchIn: null,
        punchOut: time,
        punchOutLocation: location,
        createdAt: now.toISOString(),
      };
      setState(prev => ({
        ...prev,
        punchRecords: [...prev.punchRecords, newRecord],
      }));
      return newRecord;
    }
  }, [state.punchRecords]);

  // 取得今日打卡記錄
  const getTodayPunchRecord = useCallback((employeeId: string): PunchRecord | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return state.punchRecords.find(
      r => r.employeeId === employeeId && r.date === today
    );
  }, [state.punchRecords]);

  // 老闆確認班表
  const confirmSchedule = useCallback((weekStart: string, weekEnd: string, adminId: string) => {
    // 將該週的 availabilities 轉換為 schedules
    const weekAvailabilities = state.availabilities.filter(a => {
      const date = new Date(a.date);
      const start = new Date(weekStart);
      const end = new Date(weekEnd);
      return date >= start && date <= end && a.status === 'available';
    });

    const newSchedules: Schedule[] = weekAvailabilities.map(avail => ({
      id: `schedule-${avail.id}`,
      timeSlotId: avail.timeSlotId,
      employeeId: avail.employeeId,
      date: avail.date,
      status: 'scheduled',
      confirmedBy: adminId,
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));

    const confirmation: ScheduleConfirmation = {
      id: `confirm-${Date.now()}`,
      weekStart,
      weekEnd,
      confirmedBy: adminId,
      confirmedAt: new Date().toISOString(),
      isConfirmed: true,
    };

    setState(prev => ({
      ...prev,
      schedules: [...prev.schedules, ...newSchedules],
      confirmations: [...prev.confirmations, confirmation],
    }));

    return confirmation;
  }, [state.availabilities]);

  // 檢查某週是否已確認
  const isWeekConfirmed = useCallback((weekStart: string): boolean => {
    return state.confirmations.some(
      c => c.weekStart === weekStart && c.isConfirmed
    );
  }, [state.confirmations]);

  // 取得員工已確認的班表
  const getEmployeeConfirmedSchedules = useCallback((employeeId: string): Schedule[] => {
    return state.schedules.filter(
      s => s.employeeId === employeeId && s.status === 'scheduled'
    );
  }, [state.schedules]);

  // 清除所有資料（重置）
  const resetAll = useCallback(() => {
    setState(getInitialState());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    isLoaded,
    setCurrentUser,
    addEmployee,
    removeEmployee,
    addAvailability,
    removeAvailability,
    getAvailabilityCount,
    hasAvailability,
    getEmployeeAvailabilities,
    punchIn,
    punchOut,
    getTodayPunchRecord,
    confirmSchedule,
    isWeekConfirmed,
    getEmployeeConfirmedSchedules,
    resetAll,
  };
}
