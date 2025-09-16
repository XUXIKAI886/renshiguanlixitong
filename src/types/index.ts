// 招聘记录类型定义
export interface RecruitmentRecord {
  _id?: string;
  interviewDate: Date;
  candidateName: string;
  recruitmentChannel?: string;
  gender: 'male' | 'female';
  age: number;
  idCard?: string;
  phone: string;
  appliedPosition?: string; // 新增：应聘岗位
  trialDate?: Date;
  hasTrial: boolean;
  trialDays?: number;
  trialStatus?: 'excellent' | 'good' | 'average' | 'poor';
  resignationReason?: string;
  recruitmentStatus: 'interviewing' | 'trial' | 'hired' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

// 员工信息类型定义
export interface Employee {
  _id?: string;
  employeeId: string;
  regularDate: Date;
  name: string;
  gender: 'male' | 'female';
  phone: string;
  idCard: string;
  workingDays: number;
  workStatus: 'active' | 'resigned' | 'leave';
  department?: string;
  position?: string;
  totalScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 积分记录类型定义
export interface ScoreRecord {
  _id?: string;
  employeeId: string;
  recordDate: Date;
  behaviorType: string;
  scoreChange: number;
  reason: string;
  recordedBy: string;
  evidence?: string;
  createdAt?: Date;
}

// 年度评优类型定义
export interface AnnualAward {
  _id?: string;
  year: number;
  employeeId: string;
  finalScore: number;
  rank: number;
  awardLevel: 'special' | 'first' | 'second' | 'excellent';
  bonusAmount: number;
  createdAt?: Date;
}

// 积分行为类型定义
export interface ScoreBehavior {
  type: string;
  score: number;
  category: 'deduction' | 'addition';
  description: string;
}

// API响应类型定义
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数类型定义
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应类型定义
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 筛选参数类型定义
export interface FilterParams {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  department?: string;
  position?: string;
  keyword?: string;
}
