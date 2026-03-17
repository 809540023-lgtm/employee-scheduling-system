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

// çæ 4/1-6/30 çææ®µè³æï¼é±å­æ¥é¤å¤ï¼
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
    // è·³éé±å­(6)åé±æ¥(0)
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

// åå§è³æ
const getInitialState = (): AppState => ({
  currentUser: null,
  employees: [
    { id: 'admin-1', name: 'èé', role: 'admin', createdAt: new Date().toISOString() },
    { id: 'staff-1', name: 'å°æ', role: 'staff', createdAt: new Date().toISOString() },
    { id: 'staff-2', name: 'å°è¯', role: 'staff', createdAt: new Date().toISOString() },
    { id: 'staff-3', name: 'å°ç¾', role: 'staff', createdAt: new Date().toISOString() },
  ],
  timeSlots: generateTimeSlots(),
  availabilities: [],
  punchRecords: [],
  schedules: [],
  confirmations: [],
  scheduleStartDate: '2025-04-01',
  scheduleEndDate: '2025-06-30',
});

// å¾ localStorage è¼å¥è³æ
const loadFromStorage = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // å¦ææ²æææ®µè³æï¼éæ°çæ
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

// å²å­å° localStorage
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

  // åå§åè¼å¥
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // èªåå²å­
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  // è¨­å®ç®åä½¿ç¨è
  const setCurrentUser = useCallback((user: Employee | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  // æ°å¢å¡å·¥
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

  // åªé¤å¡å·¥
  const removeEmployee = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id),
    }));
  }, []);

  // åå¾æææ®µçå·²å ±åäººæ¸
  const getAvailabilityCount = useCallback((timeSlotId: string): number => {
    return state.availabilities.filter(
      a => a.timeSlotId === timeSlotId && a.status !== 'cancelled'
    ).length;
  }, [state.availabilities]);

  // æª¢æ¥å¡å·¥æ¯å¦å·²å ±åæææ®µ
  const hasAvailability = useCallback((employeeId: string, timeSlotId: string): boolean => {
    return state.availabilities.some(
      a => a.employeeId === employeeId && a.timeSlotId === timeSlotId && a.status !== 'cancelled'
    );
  }, [state.availabilities]);

  // åå¾å¡å·¥å ±åçææ®µ
  const getEmployeeAvailabilities = useCallback((employeeId: string): StaffAvailability[] => {
    return state.availabilities.filter(
      a => a.employeeId === employeeId && a.status !== 'cancelled'
    );
  }, [state.availabilities]);

  // æ°å¢å¡å·¥å¯ä¸ç­æé
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

  // åªé¤å¡å·¥å¯ä¸ç­æé
  const removeAvailability = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter(a => a.id !== id),
    }));
  }, []);

  // ä¸ç­æå¡
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

  // ä¸ç­æå¡
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

  // åå¾ä»æ¥æå¡è¨é
  const getTodayPunchRecord = useCallback((employeeId: string): PunchRecord | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return state.punchRecords.find(
      r => r.employeeId === employeeId && r.date === today
    );
  }, [state.punchRecords]);

  // èéç¢ºèªç­è¡¨
  const confirmSchedule = useCallback((weekStart: string, weekEnd: string, adminId: string) => {
    // å°è©²é±ç availabilities è½æçº schedules
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

  // æª¢æ¥æé±æ¯å¦å·²ç¢ºèª
  const isWeekConfirmed = useCallback((weekStart: string): boolean => {
    return state.confirmations.some(
      c => c.weekStart === weekStart && c.isConfirmed
    );
  }, [state.confirmations]);

  // åå¾å¡å·¥å·²ç¢ºèªçç­è¡¨
  const getEmployeeConfirmedSchedules = useCallback((employeeId: string): Schedule[] => {
    return state.schedules.filter(
      s => s.employeeId === employeeId && s.status === 'scheduled'
    );
  }, [state.schedules]);

  // æ¸é¤ææè³æï¼éç½®ï¼
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
