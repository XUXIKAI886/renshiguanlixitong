import * as XLSX from 'xlsx';
import { RECRUITMENT_STATUS_LABELS } from '@/constants';
import { calculateWorkingDays } from '@/utils';
import type { AnnualAward, Employee, RecruitmentRecord } from '@/types';

type ExportDate = Date | string | undefined;

type ExportableEmployee = {
  employeeId?: string;
  name?: string;
  city?: Employee['city'];
  gender?: Employee['gender'];
  phone?: string;
  idCard?: string;
  department?: string;
  position?: string;
  workStatus?: Employee['workStatus'];
  workingDays?: number;
  resignationDate?: Date | string;
  totalScore?: number;
  regularDate?: Date | string;
};

type ExportableRecruitmentRecord = {
  candidateName?: string;
  city?: RecruitmentRecord['city'];
  gender?: RecruitmentRecord['gender'];
  idCard?: string;
  phone?: string;
  appliedPosition?: string;
  department?: string;
  interviewDate?: Date | string;
  arrivalDate?: Date | string;
  trialDays?: number;
  resignationReason?: string;
  recruitmentStatus?: RecruitmentRecord['recruitmentStatus'] | string;
  createdAt?: Date | string;
};

type ExportableEmployeeRef = {
  employeeId?: string;
  name?: string;
  department?: string;
  position?: string;
};

type ExportableScoreRecord = {
  employeeId?: string | ExportableEmployeeRef;
  employeeName?: string;
  department?: string;
  position?: string;
  behaviorType?: string;
  scoreChange?: number;
  reason?: string;
  recordedBy?: string;
  recordDate?: ExportDate;
  createdAt?: ExportDate;
};

type ExportableAward = {
  rank?: number;
  year?: number;
  awardLevel?: AnnualAward['awardLevel'] | string;
  finalScore?: number;
  bonusAmount?: number;
  createdAt?: ExportDate;
  employeeId?: string | ExportableEmployeeRef;
  employeeName?: string;
  department?: string;
  position?: string;
};

const formatExportDate = (value: ExportDate) =>
  value ? new Date(value).toLocaleDateString('zh-CN') : '-';

const getEmployeeRef = (value?: string | ExportableEmployeeRef): ExportableEmployeeRef => {
  if (!value || typeof value === 'string') {
    return { employeeId: value };
  }

  return value;
};

// 导出数据到Excel
export function exportToExcel(
  data: Array<Record<string, unknown>>,
  filename: string,
  sheetName: string = 'Sheet1'
) {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 15 }));
    worksheet['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // 导出文件
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('导出Excel失败:', error);
    return false;
  }
}

// 格式化员工数据用于导出
export function formatEmployeeDataForExport(employees: ExportableEmployee[]) {
  return employees.map(employee => ({
    '员工ID': employee.employeeId,
    '姓名': employee.name,
    '城市': employee.city || '宜昌',
    '性别': employee.gender === 'male' ? '男' : '女',
    '手机号': employee.phone,
    '身份证号': employee.idCard,
    '部门': employee.department,
    '岗位': employee.position,
    '在职状况': employee.workStatus === 'active' ? '在职' : 
                employee.workStatus === 'resigned' ? '离职' : '休假',
    '在职天数': employee.workStatus === 'active' && employee.regularDate
      ? calculateWorkingDays(new Date(employee.regularDate))
      : employee.workingDays,
    '总积分': employee.totalScore,
    '入司日期': formatExportDate(employee.regularDate),
    '离职日期': formatExportDate(employee.resignationDate),
    '今日日期': new Date().toLocaleDateString('zh-CN')
  }));
}

// 格式化招聘数据用于导出
export function formatRecruitmentDataForExport(records: ExportableRecruitmentRecord[]) {
  return records.map(record => {
    const recruitmentStatusKey =
      record.recruitmentStatus as keyof typeof RECRUITMENT_STATUS_LABELS;

    return {
    '姓名': record.candidateName,
    '城市': record.city || '宜昌',
    '性别': record.gender === 'male' ? '男' : '女',
    '身份证号': record.idCard,
    '电话': record.phone,
    '应聘岗位': record.appliedPosition || '未分配',
    '所属部门': record.department || '未分配',
    '面试日期': formatExportDate(record.interviewDate),
    '到岗日期': formatExportDate(record.arrivalDate),
    '试岗天数': record.trialDays || '-',
    '备注内容': record.resignationReason || '-',
    '招聘状态': RECRUITMENT_STATUS_LABELS[recruitmentStatusKey] || record.recruitmentStatus,
    '创建时间': formatExportDate(record.createdAt)
    };
  });
}

// 格式化积分数据用于导出
export function formatScoreDataForExport(scores: ExportableScoreRecord[]) {
  return scores.map(score => {
    const employee = getEmployeeRef(score.employeeId);

    return {
    '员工ID': employee.employeeId || score.employeeId,
    '员工姓名': employee.name || score.employeeName,
    '部门': employee.department || score.department,
    '岗位': employee.position || score.position,
    '行为类型': score.behaviorType === 'overtime_help' ? '周末加班帮忙' :
                score.behaviorType === 'cleaning' ? '主动打扫卫生' :
                score.behaviorType === 'moving_help' ? '协助搬运物品' :
                score.behaviorType === 'activity_participation' ? '积极参与集体活动' :
                score.behaviorType === 'task_assistance' ? '协助完成集体任务' :
                score.behaviorType === 'suggestion' ? '提出合理化建议' :
                score.behaviorType === 'help_newcomer' ? '帮助新员工' :
                score.behaviorType === 'outstanding_performance' ? '工作表现突出' :
                score.behaviorType === 'late' ? '迟到' :
                score.behaviorType === 'early_leave' ? '早退' :
                score.behaviorType === 'absence' ? '旷工' :
                score.behaviorType === 'phone_usage' ? '上班看手机' :
                score.behaviorType === 'work_slack' ? '工作懈怠' :
                score.behaviorType === 'minor_violation' ? '违反规定(轻微)' :
                score.behaviorType === 'serious_violation' ? '违反规定(严重)' :
                score.behaviorType === 'interview_record' ? '约谈记录' : score.behaviorType,
    '积分变化': score.scoreChange,
    '记录原因': score.reason,
    '记录人': score.recordedBy,
    '记录日期': formatExportDate(score.recordDate),
    '创建时间': formatExportDate(score.createdAt)
    };
  });
}

// 格式化年度评优数据用于导出
export function formatAwardDataForExport(awards: ExportableAward[]) {
  return awards.map(award => {
    const employee = getEmployeeRef(award.employeeId);

    return {
    '排名': award.rank,
    '员工ID': employee.employeeId || award.employeeId,
    '员工姓名': employee.name || award.employeeName,
    '部门': employee.department || award.department,
    '岗位': employee.position || award.position,
    '年份': award.year,
    '奖项等级': award.awardLevel === 'special' ? '特等奖' :
                award.awardLevel === 'first' ? '一等奖' :
                award.awardLevel === 'second' ? '二等奖' :
                award.awardLevel === 'excellent' ? '优秀员工' : award.awardLevel,
    '最终得分': award.finalScore,
    '奖金金额': award.bonusAmount,
    '创建时间': formatExportDate(award.createdAt)
    };
  });
}
