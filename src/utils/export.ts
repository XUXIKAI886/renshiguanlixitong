import * as XLSX from 'xlsx';
import { calculateWorkingDays } from '@/utils';

// 导出数据到Excel
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
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
export function formatEmployeeDataForExport(employees: any[]) {
  return employees.map(employee => ({
    '员工ID': employee.employeeId,
    '姓名': employee.name,
    '性别': employee.gender === 'male' ? '男' : '女',
    '手机号': employee.phone,
    '身份证号': employee.idCard,
    '部门': employee.department,
    '岗位': employee.position,
    '在职状况': employee.workStatus === 'active' ? '在职' : 
                employee.workStatus === 'resigned' ? '离职' : '休假',
    '在职天数': employee.workStatus === 'active' 
      ? calculateWorkingDays(new Date(employee.regularDate))
      : employee.workingDays,
    '总积分': employee.totalScore,
    '转正日期': new Date(employee.regularDate).toLocaleDateString('zh-CN'),
    '今日日期': new Date().toLocaleDateString('zh-CN')
  }));
}

// 格式化招聘数据用于导出
export function formatRecruitmentDataForExport(records: any[]) {
  return records.map(record => ({
    '姓名': record.name,
    '性别': record.gender === 'male' ? '男' : '女',
    '身份证号': record.idCard,
    '电话': record.phone,
    '面试日期': new Date(record.interviewDate).toLocaleDateString('zh-CN'),
    '是否试岗': record.isProbation ? '是' : '否',
    '试岗日期': record.probationStartDate ? new Date(record.probationStartDate).toLocaleDateString('zh-CN') : '-',
    '试岗天数': record.probationDays || '-',
    '试岗状态': record.probationStatus || '-',
    '备注内容': record.resignationReason || '-',
    '招聘状态': record.status === 'pending' ? '待处理' :
                record.status === 'interviewing' ? '面试中' :
                record.status === 'hired' ? '已录用' :
                record.status === 'rejected' ? '已拒绝' : '已离职',
    '创建时间': new Date(record.createdAt).toLocaleDateString('zh-CN')
  }));
}

// 格式化积分数据用于导出
export function formatScoreDataForExport(scores: any[]) {
  return scores.map(score => ({
    '员工ID': score.employeeId?.employeeId || score.employeeId,
    '员工姓名': score.employeeId?.name || score.employeeName,
    '部门': score.employeeId?.department || score.department,
    '岗位': score.employeeId?.position || score.position,
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
    '记录日期': new Date(score.recordDate).toLocaleDateString('zh-CN'),
    '创建时间': new Date(score.createdAt).toLocaleDateString('zh-CN')
  }));
}

// 格式化年度评优数据用于导出
export function formatAwardDataForExport(awards: any[]) {
  return awards.map(award => ({
    '排名': award.rank,
    '员工ID': award.employeeId?.employeeId || award.employeeId,
    '员工姓名': award.employeeId?.name || award.employeeName,
    '部门': award.employeeId?.department || award.department,
    '岗位': award.employeeId?.position || award.position,
    '年份': award.year,
    '奖项等级': award.awardLevel === 'special' ? '特等奖' :
                award.awardLevel === 'first' ? '一等奖' :
                award.awardLevel === 'second' ? '二等奖' :
                award.awardLevel === 'excellent' ? '优秀员工' : award.awardLevel,
    '最终得分': award.finalScore,
    '奖金金额': award.bonusAmount,
    '创建时间': new Date(award.createdAt).toLocaleDateString('zh-CN')
  }));
}
