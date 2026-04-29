import { calculateWorkingDays } from './index';

type EmployeeWorkStatus = 'active' | 'resigned' | 'leave';

interface ResolveEmployeeWorkingDaysParams {
  regularDate: Date | string;
  existingWorkingDays?: number;
  currentWorkStatus?: EmployeeWorkStatus;
  nextWorkStatus?: EmployeeWorkStatus;
  referenceDate?: Date;
}

interface ResolveEmployeeResignationDateParams {
  existingResignationDate?: Date | string | null;
  requestedResignationDate?: Date | string | null;
  currentWorkStatus?: EmployeeWorkStatus;
  nextWorkStatus?: EmployeeWorkStatus;
}

const normalizeDate = (value?: Date | string | null): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

// 统一处理员工状态切换时的在职天数冻结逻辑
export const resolveEmployeeWorkingDays = ({
  regularDate,
  existingWorkingDays = 0,
  currentWorkStatus,
  nextWorkStatus,
  referenceDate = new Date(),
}: ResolveEmployeeWorkingDaysParams): number => {
  const normalizedRegularDate = new Date(regularDate);

  if (Number.isNaN(normalizedRegularDate.getTime())) {
    return existingWorkingDays;
  }

  // 在职员工始终按当前日期重新计算
  if (nextWorkStatus === 'active') {
    return calculateWorkingDays(normalizedRegularDate, referenceDate);
  }

  // 首次办理离职时，冻结离职当天的最终在职天数
  if (currentWorkStatus !== 'resigned' && nextWorkStatus === 'resigned') {
    return calculateWorkingDays(normalizedRegularDate, referenceDate);
  }

  // 已离职员工后续编辑资料时，保留已冻结的在职天数
  return existingWorkingDays;
};

// 统一处理离职日期写入与清理逻辑
export const resolveEmployeeResignationDate = ({
  existingResignationDate,
  requestedResignationDate,
  currentWorkStatus,
  nextWorkStatus,
}: ResolveEmployeeResignationDateParams): Date | undefined => {
  if (nextWorkStatus !== 'resigned') {
    return undefined;
  }

  const existingDate = normalizeDate(existingResignationDate);
  if (currentWorkStatus === 'resigned' && existingDate) {
    return existingDate;
  }

  return normalizeDate(requestedResignationDate);
};
