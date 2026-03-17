// 員工資料
export interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

// 時段設定（老闆設定每個時段需要多少人）
export interface TimeSlot {
  id: string;
  date: string; // "YYYY-MM-DD" 格式
  startTime: string; // "HH:mm" 格式
  endTime: string;   // "HH:mm" 格式
  requiredStaff: number; // 需要多少人
  isWeekend: boolean;
  createdAt: string;
}

// 員工可上班時間填寫
export interface StaffAvailability {
  id: string;
  employeeId: string;
  timeSlotId: string;
  date: string; // "YYYY-MM-DD" 格式
  status: 'available' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// 打卡記錄
export interface PunchRecord {
  id: string;
  employeeId: string;
  date: string; // "YYYY-MM-DD" 格式
  punchIn: string | null; // "HH:mm:ss" 格式
  punchOut: string | null; // "HH:mm:ss" 格式
  punchInLocation?: string;
  punchOutLocation?: string;
  note?: string;
  createdAt: string;
}

// 排班結果（老闆確認後）
export interface Schedule {
  id: string;
  timeSlotId: string;
  employeeId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'absent';
  confirmedBy: string; // 確認的管理員ID
  confirmedAt: string;
  createdAt: string;
}

// 班表確認狀態
export interface ScheduleConfirmation {
  id: string;
  weekStart: string; // "YYYY-MM-DD" 週一日期
  weekEnd: string;   // "YYYY-MM-DD" 週日日期
  confirmedBy: string;
  confirmedAt: string;
  isConfirmed: boolean;
}

// 應用程式狀態
export interface AppState {
  currentUser: Employee | null;
  employees: Employee[];
  timeSlots: TimeSlot[];
  availabilities: StaffAvailability[];
  punchRecords: PunchRecord[];
  schedules: Schedule[];
  confirmations: ScheduleConfirmation[];
  scheduleStartDate: string; // "YYYY-MM-DD"
  scheduleEndDate: string;   // "YYYY-MM-DD"
}

// 星期幾對應
export const DAYS_OF_WEEK = [
  { value: 0, label: '星期日', shortLabel: '日' },
  { value: 1, label: '星期一', shortLabel: '一' },
  { value: 2, label: '星期二', shortLabel: '二' },
  { value: 3, label: '星期三', shortLabel: '三' },
  { value: 4, label: '星期四', shortLabel: '四' },
  { value: 5, label: '星期五', shortLabel: '五' },
  { value: 6, label: '星期六', shortLabel: '六' },
] as const;

// 預設時段模板
export const DEFAULT_TIME_SLOTS = [
  { startTime: '06:00', endTime: '09:00', requiredStaff: 2, label: '早班 (06:00-09:00)' },
  { startTime: '10:00', endTime: '13:00', requiredStaff: 2, label: '午班 (10:00-13:00)' },
  { startTime: '13:00', endTime: '18:00', requiredStaff: 1, label: '下午班 (13:00-18:00)' },
] as const;

// 時間選項（每小時）
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});
