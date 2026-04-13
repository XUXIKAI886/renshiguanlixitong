// 招聘状态类型
export type RecruitmentStatus =
  | 'pending_arrival'
  | 'no_show'
  | 'trialing'
  | 'regularized'
  | 'rejected';

// 兼容旧状态值，统一映射到新流程状态
export const normalizeRecruitmentStatus = (status?: string): RecruitmentStatus => {
  switch (status) {
    case 'interviewing':
      return 'pending_arrival';
    case 'trial':
      return 'trialing';
    case 'hired':
      return 'regularized';
    case 'rejected':
      return 'rejected';
    case 'pending_arrival':
    case 'no_show':
    case 'trialing':
    case 'regularized':
      return status;
    default:
      return 'pending_arrival';
  }
};

// 筛选时同时兼容旧状态值
export const getCompatibleRecruitmentStatuses = (status?: string): string[] => {
  const normalizedStatus = normalizeRecruitmentStatus(status);
  switch (normalizedStatus) {
    case 'pending_arrival':
      return ['pending_arrival', 'interviewing'];
    case 'trialing':
      return ['trialing', 'trial'];
    case 'regularized':
      return ['regularized', 'hired'];
    default:
      return [normalizedStatus];
  }
};

// 除已拒绝外，其余流程状态都需要到岗日期
export const requiresArrivalDate = (status?: string): boolean => {
  const normalizedStatus = normalizeRecruitmentStatus(status);
  return normalizedStatus !== 'rejected';
};

// 根据到岗日期自动计算试岗天数
export const calculateTrialDays = (
  arrivalDate?: Date | string | null,
  status?: string,
  regularizedDate?: Date | string | null,
  updatedAt?: Date | string | null
): number | undefined => {
  if (!arrivalDate) {
    return undefined;
  }

  const normalizedStatus = normalizeRecruitmentStatus(status);
  if (normalizedStatus !== 'trialing' && normalizedStatus !== 'regularized') {
    return undefined;
  }

  const start = new Date(arrivalDate);
  const end = normalizedStatus === 'regularized'
    ? new Date(regularizedDate || updatedAt || new Date())
    : new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return undefined;
  }

  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// 兼容旧字段，优先读取新到岗日期
export const getArrivalDate = (record: {
  arrivalDate?: Date | string | null;
  trialDate?: Date | string | null;
}) => {
  return record.arrivalDate || record.trialDate || undefined;
};

type RecruitmentNormalizationFields = {
  recruitmentStatus?: string;
  arrivalDate?: Date | string | null;
  trialDate?: Date | string | null;
  regularizedDate?: Date | string | null;
  updatedAt?: Date | string | null;
  trialDays?: number;
};

// 输出给前端前统一格式，兼容旧状态和旧字段
export const normalizeRecruitmentRecord = <T extends Record<string, unknown>>(record: T) => {
  const normalizedRecord = record as T & RecruitmentNormalizationFields;
  const recruitmentStatus = normalizeRecruitmentStatus(normalizedRecord.recruitmentStatus);
  const arrivalDate = getArrivalDate(normalizedRecord);
  const trialDays = calculateTrialDays(
    arrivalDate,
    recruitmentStatus,
    normalizedRecord.regularizedDate,
    normalizedRecord.updatedAt
  );

  return {
    ...record,
    recruitmentStatus,
    arrivalDate,
    trialDays,
  };
};
