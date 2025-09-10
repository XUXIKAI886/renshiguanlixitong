import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并CSS类名的工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 计算在职天数
export const calculateWorkingDays = (regularDate: Date): number => {
  const today = new Date();
  const diffTime = today.getTime() - regularDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// 生成员工ID
export const generateEmployeeId = (): string => {
  const timestamp = Date.now();
  return `EMP${timestamp}`;
};

// 格式化日期
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 格式化日期时间
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 验证身份证号
export const validateIdCard = (idCard: string): boolean => {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return idCardRegex.test(idCard);
};

// 验证手机号
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证中文姓名
export const validateChineseName = (name: string): boolean => {
  const nameRegex = /^[\u4e00-\u9fa5]{2,20}$/;
  return nameRegex.test(name);
};

// 计算年度评优综合得分
export const calculateFinalScore = (
  totalScore: number,
  attendanceScore: number,
  performanceScore: number
): number => {
  const scoreWeight = totalScore * 0.6;
  const attendanceWeight = attendanceScore * 0.2;
  const performanceWeight = performanceScore * 0.2;
  return Math.round((scoreWeight + attendanceWeight + performanceWeight) * 100) / 100;
};

// 获取月份范围
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// 获取年份范围
export const getYearRange = (year: number): { start: Date; end: Date } => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 深拷贝函数
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// 数组去重
export const uniqueArray = <T>(arr: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(arr)];
  }
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// 数字格式化（千分位）
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

// 百分比格式化
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};
